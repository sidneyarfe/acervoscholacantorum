import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('fileId');

    if (!fileId) {
      throw new Error('Missing fileId parameter');
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing Google OAuth credentials');
    }

    // Get fresh access token
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
      throw new Error('Failed to get access token');
    }

    const { access_token } = await tokenResponse.json();

    // Get file metadata to determine content type and size
    const metaResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name,size`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!metaResponse.ok) {
      throw new Error('Failed to get file metadata');
    }

    const fileMeta = await metaResponse.json();
    const fileSize = parseInt(fileMeta.size, 10);
    const mimeType = fileMeta.mimeType || 'audio/ogg';

    // Check for Range header (iOS Safari sends this for audio streaming)
    const rangeHeader = req.headers.get('range');
    
    if (rangeHeader) {
      // Parse range header: bytes=start-end
      const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (matches) {
        const start = parseInt(matches[1], 10);
        const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        console.log(`Range request: ${start}-${end}/${fileSize}`);

        // Fetch partial content from Google Drive
        const fileResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: { 
              Authorization: `Bearer ${access_token}`,
              Range: `bytes=${start}-${end}`,
            },
          }
        );

        if (!fileResponse.ok && fileResponse.status !== 206) {
          throw new Error('Failed to fetch partial file from Drive');
        }

        const body = fileResponse.body;

        return new Response(body, {
          status: 206,
          headers: {
            ...corsHeaders,
            'Content-Type': mimeType,
            'Content-Length': chunkSize.toString(),
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Full file request (no range header)
    console.log(`Full file request: ${fileMeta.name} (${fileSize} bytes)`);
    
    const fileResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file from Drive');
    }

    return new Response(fileResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': mimeType,
        'Content-Length': fileSize.toString(),
        'Content-Disposition': `inline; filename="${fileMeta.name}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Stream error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
