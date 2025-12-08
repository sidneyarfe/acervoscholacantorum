import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getOrCreateSubfolder(
  accessToken: string,
  parentFolderId: string,
  folderName: string
): Promise<string> {
  // Search for existing folder
  const searchQuery = `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      console.log(`Pasta "${folderName}" encontrada: ${searchData.files[0].id}`);
      return searchData.files[0].id;
    }
  }

  // Create folder if not found
  console.log(`Criando pasta "${folderName}"...`);
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error(`Erro ao criar pasta "${folderName}":`, errorText);
    throw new Error(`Failed to create folder: ${folderName}`);
  }

  const folderData = await createRes.json();
  console.log(`Pasta "${folderName}" criada: ${folderData.id}`);
  return folderData.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const songId = formData.get('songId') as string;
    const type = formData.get('fileType') as string; // 'audio' or 'score'
    const voicePart = formData.get('voicePart') as string | null;
    const uploaderId = formData.get('uploaderId') as string | null;
    const originalFileName = formData.get('fileName') as string | null;
    
    // Recupera as credenciais das variáveis de ambiente
    const rootFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!file || !rootFolderId || !clientId || !clientSecret || !refreshToken) {
      console.error("Faltando credenciais:", { rootFolderId: !!rootFolderId, clientId: !!clientId, clientSecret: !!clientSecret, refreshToken: !!refreshToken })
      throw new Error('Configuração de credenciais incompleta no Supabase Secrets.')
    }

    if (!songId || !type) {
      throw new Error('Missing required fields: songId, fileType');
    }

    console.log(`Iniciando upload de: ${file.name} (${file.type}) para música ${songId}`)

    // 1. Troca o Refresh Token por um Access Token novo
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Erro ao renovar token:", errorText);
      throw new Error(`Falha na autenticação com Google: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();

    // 2. Determina a subpasta correta
    const subfolderName = type === 'audio' ? 'Musicas' : 'Partituras';
    const targetFolderId = await getOrCreateSubfolder(access_token, rootFolderId, subfolderName);

    // 3. Prepara o Upload Multipart
    const timestamp = Date.now();
    const driveFileName = `${songId}_${type}_${voicePart || 'full'}_${timestamp}_${file.name}`;
    
    const metadata = {
      name: driveFileName,
      mimeType: file.type,
      parents: [targetFolderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody = new Blob([
      delimiter,
      'Content-Type: application/json\r\n\r\n',
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${file.type}\r\n\r\n`,
      await file.arrayBuffer(),
      closeDelimiter,
    ]);

    // 4. Envia o arquivo para o Google Drive
    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Erro no upload:", errorText);
      throw new Error(`Erro ao salvar no Drive: ${errorText}`);
    }

    const driveData = await uploadRes.json();
    console.log('Upload concluído:', driveData.id);

    // 5. Tenta deixar o arquivo público para leitura
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${driveData.id}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      });
    } catch (e) {
      console.warn("Não foi possível definir permissão pública:", e);
    }

    const webViewLink = driveData.webViewLink || `https://drive.google.com/file/d/${driveData.id}/view`;
    // URL de streaming via proxy (resolve CORS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const streamUrl = `${supabaseUrl}/functions/v1/stream-drive-audio?fileId=${driveData.id}`;

    // 6. Salva no banco de dados
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let dbResult;
    
    if (type === 'audio') {
      const { data, error } = await supabase
        .from('audio_tracks')
        .insert({
          song_id: songId,
          voice_part: voicePart && voicePart !== 'tutti' ? voicePart : null,
          file_url: streamUrl, // URL do proxy para streaming
          drive_file_id: driveData.id,
          drive_view_link: webViewLink,
          drive_download_link: `https://drive.google.com/uc?export=download&id=${driveData.id}`,
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
          file_url: webViewLink, // Para PDFs, usar webViewLink que abre no visualizador do Drive
          file_name: originalFileName || file.name,
          drive_file_id: driveData.id,
          drive_view_link: webViewLink,
          drive_download_link: `https://drive.google.com/uc?export=download&id=${driveData.id}`,
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
        driveFileId: driveData.id,
        viewLink: webViewLink,
        downloadLink: streamUrl,
        record: dbResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
