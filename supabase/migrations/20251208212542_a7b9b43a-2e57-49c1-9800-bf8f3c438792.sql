-- Tornar título opcional para permitir banners somente com imagem
ALTER TABLE public.banners ALTER COLUMN title DROP NOT NULL;