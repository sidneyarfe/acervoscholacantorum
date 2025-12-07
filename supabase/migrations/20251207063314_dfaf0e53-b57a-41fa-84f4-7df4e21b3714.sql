-- Create tags table for simple song tagging
CREATE TABLE public.song_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.song_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags
CREATE POLICY "Todos podem ver tags"
ON public.song_tags
FOR SELECT
USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins podem gerenciar tags"
ON public.song_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some default tags
INSERT INTO public.song_tags (name) VALUES 
    ('Entrada'),
    ('Comunhão'),
    ('Ofertório'),
    ('Saída'),
    ('Adoração'),
    ('Louvor'),
    ('Natal'),
    ('Quaresma'),
    ('Páscoa'),
    ('Pentecostes'),
    ('Mariana');