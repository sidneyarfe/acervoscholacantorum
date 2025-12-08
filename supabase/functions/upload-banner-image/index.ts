import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AVISOS_FOLDER_NAME = "Avisos";

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
      console.error(`Usuário ${user.id} tentou upload de banner sem permissão de admin`);
      return new Response(
        JSON.stringify({ error: 'Não autorizado: Apenas administradores podem fazer upload de banners' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Upload de banner autorizado para admin: ${user.id}`);
    // === END JWT AUTHENTICATION ===

    const formData = await req.formData()
    const file = formData.get('file') as File
    const bannerId = formData.get('bannerId') as string | null;
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')
    const rootFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')

    if (!file || !clientId || !clientSecret || !refreshToken) {
      console.error("Faltando credenciais:", { clientId: !!clientId, clientSecret: !!clientSecret, refreshToken: !!refreshToken })
      throw new Error('Configuração de credenciais incompleta no Supabase Secrets.')
    }

    console.log(`Iniciando upload de banner: ${file.name} (${file.type})`)

    // 1. Get fresh access token
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

    // 2. Find or create "Avisos" folder
    let avisosFolderId: string;

    // Search for existing "Avisos" folder
    const searchQuery = `name='${AVISOS_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed=false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const searchData = await searchRes.json();
    
    if (searchData.files && searchData.files.length > 0) {
      avisosFolderId = searchData.files[0].id;
      console.log(`Pasta "Avisos" encontrada: ${avisosFolderId}`);
    } else {
      // Create "Avisos" folder
      console.log(`Criando pasta "Avisos"...`);
      const folderMetadata = {
        name: AVISOS_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: rootFolderId ? [rootFolderId] : [],
      };

      const createFolderRes = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=id,name',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(folderMetadata),
        }
      );

      if (!createFolderRes.ok) {
        const error = await createFolderRes.text();
        throw new Error(`Erro ao criar pasta Avisos: ${error}`);
      }

      const folderData = await createFolderRes.json();
      avisosFolderId = folderData.id;
      console.log(`Pasta "Avisos" criada: ${avisosFolderId}`);
    }

    // 3. Upload the file
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || '';
    const driveFileName = `Banner_${timestamp}.${fileExtension}`;
    
    const metadata = {
      name: driveFileName,
      mimeType: file.type,
      parents: [avisosFolderId],
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
    console.log('Upload de banner concluído:', driveData.id);

    // 4. Make file public
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

    // Generate direct image URL
    const imageUrl = `https://drive.google.com/thumbnail?id=${driveData.id}&sz=w1920`;
    const viewLink = `https://drive.google.com/file/d/${driveData.id}/view`;

    return new Response(
      JSON.stringify({
        success: true,
        driveFileId: driveData.id,
        imageUrl: imageUrl,
        viewLink: viewLink,
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
