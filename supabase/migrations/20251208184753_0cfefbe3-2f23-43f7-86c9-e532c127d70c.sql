-- Adicionar colunas do Google Drive na tabela audio_tracks
ALTER TABLE public.audio_tracks
ADD COLUMN IF NOT EXISTS drive_file_id text,
ADD COLUMN IF NOT EXISTS drive_view_link text,
ADD COLUMN IF NOT EXISTS drive_download_link text;

-- Adicionar colunas do Google Drive na tabela scores
ALTER TABLE public.scores
ADD COLUMN IF NOT EXISTS drive_file_id text,
ADD COLUMN IF NOT EXISTS drive_view_link text,
ADD COLUMN IF NOT EXISTS drive_download_link text;