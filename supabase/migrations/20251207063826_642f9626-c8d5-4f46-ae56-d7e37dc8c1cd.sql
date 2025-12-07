-- Create celebration_types table for managing celebration types
CREATE TABLE public.celebration_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.celebration_types ENABLE ROW LEVEL SECURITY;

-- Everyone can view celebration types
CREATE POLICY "Todos podem ver tipos de celebração"
ON public.celebration_types
FOR SELECT
USING (true);

-- Only admins can manage celebration types
CREATE POLICY "Admins podem gerenciar tipos de celebração"
ON public.celebration_types
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default celebration types
INSERT INTO public.celebration_types (name) VALUES 
    ('Eucarística'),
    ('Mariana'),
    ('Temporal'),
    ('Santos'),
    ('Penitencial');