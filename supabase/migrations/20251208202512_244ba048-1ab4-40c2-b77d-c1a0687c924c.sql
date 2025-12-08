-- Adiciona coluna para armazenar o ID da pasta do Google Drive da música
ALTER TABLE public.songs 
ADD COLUMN drive_folder_id text;