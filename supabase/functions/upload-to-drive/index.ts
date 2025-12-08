import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base64URL encode for JWT
function base64UrlEncode(data: Uint8Array | string): string {
  const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Create JWT for Google Service Account
async function createJWT(email: string, privateKey: string): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import private key - handle both actual newlines and escaped \n strings
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')  // Handle escaped \n from JSON
    .replace(/\n/g, '')   // Handle actual newlines
    .replace(/\r/g, '')   // Handle carriage returns
    .replace(/\s/g, '');  // Remove any whitespace
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${encodedSignature}`;
}

// Get Google access token
async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const jwt = await createJWT(email, privateKey);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token error:', error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Upload file to Google Drive
async function uploadToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  fileContent: Uint8Array,
  mimeType: string
): Promise<{ id: string; webViewLink: string; webContentLink: string }> {
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  // Create multipart body
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaPart = `${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
  
  // Convert file content to base64
  const base64Content = btoa(String.fromCharCode(...fileContent));
  
  const body = metadataPart + mediaPart + base64Content + closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Upload error:', error);
    throw new Error(`Failed to upload to Drive: ${error}`);
  }

  const result = await response.json();
  
  // Make file publicly accessible
  await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  return {
    id: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    webContentLink: `https://drive.google.com/uc?export=download&id=${result.id}`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!serviceEmail || !privateKey || !folderId) {
      throw new Error('Missing Google Drive configuration');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const songId = formData.get('songId') as string;
    const type = formData.get('fileType') as string; // 'audio' or 'score'
    const voicePart = formData.get('voicePart') as string | null;
    const uploaderId = formData.get('uploaderId') as string | null;
    const originalFileName = formData.get('fileName') as string | null;

    if (!file || !songId || !type) {
      throw new Error('Missing required fields: file, songId, fileType');
    }

    console.log(`Uploading ${type} for song ${songId}: ${file.name}`);

    // Get access token
    const accessToken = await getAccessToken(serviceEmail, privateKey);
    
    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);
    
    // Generate unique filename for Drive
    const timestamp = Date.now();
    const driveFileName = `${songId}_${type}_${voicePart || 'full'}_${timestamp}_${file.name}`;
    
    // Upload to Google Drive
    const driveResult = await uploadToDrive(
      accessToken,
      folderId,
      driveFileName,
      fileContent,
      file.type
    );

    console.log(`Upload successful: ${driveResult.id}`);

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let dbResult;
    
    if (type === 'audio') {
      const { data, error } = await supabase
        .from('audio_tracks')
        .insert({
          song_id: songId,
          voice_part: voicePart && voicePart !== 'tutti' ? voicePart : null,
          file_url: driveResult.webContentLink,
          drive_file_id: driveResult.id,
          drive_view_link: driveResult.webViewLink,
          drive_download_link: driveResult.webContentLink,
          uploader_id: uploaderId,
          approved: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      dbResult = data;
    } else if (type === 'score') {
      const { data, error } = await supabase
        .from('scores')
        .insert({
          song_id: songId,
          file_url: driveResult.webContentLink,
          file_name: originalFileName || file.name,
          drive_file_id: driveResult.id,
          drive_view_link: driveResult.webViewLink,
          drive_download_link: driveResult.webContentLink,
          uploader_id: uploaderId,
          approved: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      dbResult = data;
    }

    return new Response(
      JSON.stringify({
        success: true,
        driveFileId: driveResult.id,
        viewLink: driveResult.webViewLink,
        downloadLink: driveResult.webContentLink,
        record: dbResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-to-drive:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
