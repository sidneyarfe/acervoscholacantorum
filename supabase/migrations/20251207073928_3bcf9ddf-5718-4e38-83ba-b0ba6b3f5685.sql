-- Add liturgical_season column to celebrations
ALTER TABLE public.celebrations 
ADD COLUMN liturgical_season TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.celebrations.liturgical_season IS 'Tempo litúrgico: branco, verde, vermelho, roxo, rosa';