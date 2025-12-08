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
    const formData = await req.formData()
    const file = formData.get('file') as File
    const songId = formData.get('songId') as string;
    const type = formData.get('fileType') as string; // 'audio' or 'score'
    const voicePart = formData.get('voicePart') as string | null;
    const uploaderId = formData.get('uploaderId') as string | null;
    const originalFileName = formData.get('fileName') as string | null;
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!file || !clientId || !clientSecret || !refreshToken) {
      console.error("Faltando credenciais:", { clientId: !!clientId, clientSecret: !!clientSecret, refreshToken: !!refreshToken })
      throw new Error('Configuração de credenciais incompleta no Supabase Secrets.')
    }

    if (!songId || !type) {
      throw new Error('Missing required fields: songId, fileType');
    }

    console.log(`Iniciando upload de: ${file.name} (${file.type}) para música ${songId}`)

    // 1. Buscar a pasta da música no banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: song, error: songError } = await supabase
      .from('songs')
      .select('drive_folder_id, title, composer')
      .eq('id', songId)
      .single();

    if (songError || !song) {
      throw new Error('Música não encontrada');
    }

    if (!song.drive_folder_id) {
      throw new Error('Esta música não possui uma pasta no Drive. Por favor, recrie a música.');
    }

    // 2. Troca o Refresh Token por um Access Token novo
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

    // 3. Prepara o Upload Multipart (diretamente na pasta da música)
    const songLabel = `${song.title}${song.composer ? ' - ' + song.composer : ''}`;
    const fileExtension = file.name.split('.').pop() || '';
    
    let driveFileName: string;
    if (type === 'audio') {
      const voiceLabels: Record<string, string> = {
        soprano: 'Soprano',
        contralto: 'Contralto',
        tenor: 'Tenor',
        baixo: 'Baixo',
      };
      const naipeLabel = voicePart && voiceLabels[voicePart] ? voiceLabels[voicePart] : 'Tutti';
      driveFileName = `Áudio - ${naipeLabel} - [${songLabel}].${fileExtension}`;
    } else {
      driveFileName = `Partitura - [${songLabel}].${fileExtension}`;
    }
    
    const metadata = {
      name: driveFileName,
      mimeType: file.type,
      parents: [song.drive_folder_id], // Usa a pasta da música
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
    const streamUrl = `${supabaseUrl}/functions/v1/stream-drive-audio?fileId=${driveData.id}`;

    // 6. Salva no banco de dados
    let dbResult;
    
    if (type === 'audio') {
      const { data, error } = await supabase
        .from('audio_tracks')
        .insert({
          song_id: songId,
          voice_part: voicePart && voicePart !== 'tutti' ? voicePart : null,
          file_url: streamUrl,
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
          file_url: webViewLink,
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