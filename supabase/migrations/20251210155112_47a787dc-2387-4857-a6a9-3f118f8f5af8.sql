-- Criar enum para status do membro
CREATE TYPE member_status AS ENUM ('ativo', 'afastado', 'desligado');

-- Adicionar coluna member_status à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN member_status member_status NOT NULL DEFAULT 'ativo';

-- Adicionar coluna avatar_drive_file_id para rastrear a foto no Google Drive
ALTER TABLE public.profiles 
ADD COLUMN avatar_drive_file_id TEXT;