import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      console.error("Faltando credenciais OAuth:", { clientId: !!clientId, clientSecret: !!clientSecret, refreshToken: !!refreshToken });
      throw new Error('Configuração de credenciais OAuth incompleta');
    }

    const { driveFileId } = await req.json();

    if (!driveFileId) {
      throw new Error('Missing driveFileId');
    }

    console.log(`Deletando arquivo do Drive: ${driveFileId}`);

    // Get fresh access token using OAuth 2.0 refresh token
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

    // Delete file from Google Drive
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveFileId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    // 204 = success, 404 = file already deleted (treat as success)
    if (!response.ok && response.status !== 204 && response.status !== 404) {
      const error = await response.text();
      console.error('Erro ao deletar:', error);
      throw new Error(`Falha ao deletar do Drive: ${error}`);
    }

    console.log(`Arquivo deletado com sucesso: ${driveFileId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro em delete-from-drive:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
