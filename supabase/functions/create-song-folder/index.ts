import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // === JWT AUTHENTICATION (Admin only) ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado: Token de autenticação ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Verify JWT using anon key client
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado: Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for admin check and database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user has admin role
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      console.error(`Usuário ${user.id} tentou criar pasta de música sem permissão de admin`);
      return new Response(
        JSON.stringify({ error: 'Não autorizado: Apenas administradores podem criar músicas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Criação de pasta autorizada para admin: ${user.id}`);
    // === END JWT AUTHENTICATION ===

    const { songId, title, composer } = await req.json();

    if (!songId || !title) {
      throw new Error('Missing required fields: songId, title');
    }

    const rootFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!rootFolderId || !clientId || !clientSecret || !refreshToken) {
      console.error("Faltando credenciais Google Drive");
      throw new Error('Configuração de credenciais incompleta no Supabase Secrets.');
    }

    // 1. Troca o Refresh Token por um Access Token
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

    // 2. Cria a pasta com nome "Título - Compositor" ou apenas "Título"
    const folderName = composer ? `${title} - ${composer}` : title;
    console.log(`Criando pasta "${folderName}" no Drive...`);

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error(`Erro ao criar pasta:`, errorText);
      throw new Error(`Falha ao criar pasta no Drive: ${errorText}`);
    }

    const folderData = await createRes.json();
    console.log(`Pasta criada com ID: ${folderData.id}`);

    // 3. Salva o drive_folder_id na música
    const { error: updateError } = await supabase
      .from('songs')
      .update({ drive_folder_id: folderData.id })
      .eq('id', songId);

    if (updateError) {
      console.error('Erro ao atualizar música:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        folderId: folderData.id,
        folderName: folderName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
