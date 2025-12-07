-- Adicionar novos campos ao profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS join_date date,
ADD COLUMN IF NOT EXISTS has_stole boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_vestment boolean DEFAULT false;

-- Criar tabela para tipos de voz dinâmicos
CREATE TABLE IF NOT EXISTS public.voice_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver tipos de voz" ON public.voice_types FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar tipos de voz" ON public.voice_types FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Inserir tipos de voz padrão
INSERT INTO public.voice_types (name) VALUES ('Uníssono'), ('Polifônico'), ('Gregoriano')
ON CONFLICT (name) DO NOTHING;

-- Criar tabela para hierarquias litúrgicas dinâmicas
CREATE TABLE IF NOT EXISTS public.liturgical_hierarchies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  value text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.liturgical_hierarchies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver hierarquias litúrgicas" ON public.liturgical_hierarchies FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar hierarquias litúrgicas" ON public.liturgical_hierarchies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Inserir hierarquias litúrgicas padrão
INSERT INTO public.liturgical_hierarchies (name, value) VALUES 
  ('Solenidade', 'solemnity'),
  ('Festa', 'feast'),
  ('Memória', 'memorial'),
  ('Memória Opcional', 'optional_memorial')
ON CONFLICT (name) DO NOTHING;