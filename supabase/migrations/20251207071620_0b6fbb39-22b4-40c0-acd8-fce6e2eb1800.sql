-- Adicionar coluna file_name na tabela scores para armazenar nome original do arquivo
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS file_name TEXT;