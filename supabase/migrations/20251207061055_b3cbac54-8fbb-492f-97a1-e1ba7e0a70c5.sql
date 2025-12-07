-- Tabela para gêneros musicais
CREATE TABLE public.song_genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela para texturas musicais
CREATE TABLE public.song_textures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela para idiomas
CREATE TABLE public.song_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.song_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_textures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_languages ENABLE ROW LEVEL SECURITY;

-- Políticas: todos podem ver, apenas admins gerenciam
CREATE POLICY "Todos podem ver gêneros" ON public.song_genres FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar gêneros" ON public.song_genres FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Todos podem ver texturas" ON public.song_textures FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar texturas" ON public.song_textures FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Todos podem ver idiomas" ON public.song_languages FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar idiomas" ON public.song_languages FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Inserir valores iniciais
INSERT INTO public.song_genres (name) VALUES 
  ('Sacro'), ('Renascentista'), ('Barroco'), ('Clássico'), ('Contemporâneo'), ('Gregoriano');

INSERT INTO public.song_textures (name) VALUES 
  ('Homofônico'), ('Contrapontístico'), ('Monódico'), ('Polifônico');

INSERT INTO public.song_languages (name) VALUES 
  ('Latim'), ('Português'), ('Inglês'), ('Italiano'), ('Alemão'), ('Francês'), ('Espanhol');