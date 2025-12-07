-- ============================================
-- SCHOLA CANTORUM - SCHEMA COMPLETO
-- ============================================

-- 1. Enum para tipos de papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'member');

-- 2. Enum para tipos de vozes
CREATE TYPE public.voice_part AS ENUM ('soprano', 'contralto', 'tenor', 'baixo');

-- 3. Enum para tipos de vozes na música
CREATE TYPE public.voicing_type AS ENUM ('unison', 'polyphonic', 'gregorian');

-- 4. Enum para rank litúrgico
CREATE TYPE public.liturgical_rank AS ENUM ('solemnity', 'feast', 'memorial', 'optional_memorial');

-- ============================================
-- TABELA: profiles
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_voice voice_part,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: user_roles
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNÇÃO: has_role (Security Definer)
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- TABELA: artists
-- ============================================
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT, -- compositor, arranjador, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: songs
-- ============================================
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  composer TEXT,
  arranger TEXT,
  voicing_type voicing_type NOT NULL DEFAULT 'polyphonic',
  texture TEXT, -- SATB, SA, TB, etc.
  liturgical_tags JSONB DEFAULT '[]'::jsonb,
  genre TEXT,
  language TEXT DEFAULT 'Latim',
  copyright_info TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: celebrations
-- ============================================
CREATE TABLE public.celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  liturgical_rank liturgical_rank NOT NULL DEFAULT 'memorial',
  feast_type TEXT, -- Eucarística, Mariana, Temporal, Santos
  date_rule TEXT, -- Data fixa ou móvel
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: song_celebration (many-to-many)
-- ============================================
CREATE TABLE public.song_celebration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  celebration_id UUID REFERENCES public.celebrations(id) ON DELETE CASCADE NOT NULL,
  context_notes TEXT, -- Entrada, Ofertório, Comunhão, etc.
  usage_count INTEGER DEFAULT 0,
  default_order INTEGER,
  UNIQUE (song_id, celebration_id)
);

ALTER TABLE public.song_celebration ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: song_artists (many-to-many)
-- ============================================
CREATE TABLE public.song_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  role TEXT, -- compositor, arranjador
  UNIQUE (song_id, artist_id, role)
);

ALTER TABLE public.song_artists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: audio_tracks
-- ============================================
CREATE TABLE public.audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  voice_part voice_part, -- NULL para gravação completa
  file_url TEXT NOT NULL,
  duration_seconds INTEGER,
  version_tag TEXT,
  uploader_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: scores
-- ============================================
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  page_count INTEGER,
  key_signature TEXT,
  uploader_id UUID REFERENCES auth.users(id),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: rehearsal_lists
-- ============================================
CREATE TABLE public.rehearsal_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rehearsal_lists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: rehearsal_list_songs
-- ============================================
CREATE TABLE public.rehearsal_list_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rehearsal_list_id UUID REFERENCES public.rehearsal_lists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  position_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  UNIQUE (rehearsal_list_id, song_id)
);

ALTER TABLE public.rehearsal_list_songs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIGGER: Criar perfil automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  -- Criar papel de membro por padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- RLS POLICIES: profiles
-- ============================================
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES: user_roles
-- ============================================
CREATE POLICY "Admins podem ver todos os papéis"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar papéis"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: artists
-- ============================================
CREATE POLICY "Todos podem ver artistas"
  ON public.artists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar artistas"
  ON public.artists FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: songs
-- ============================================
CREATE POLICY "Todos podem ver músicas"
  ON public.songs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Membros podem criar músicas"
  ON public.songs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins podem gerenciar músicas"
  ON public.songs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: celebrations
-- ============================================
CREATE POLICY "Todos podem ver celebrações"
  ON public.celebrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar celebrações"
  ON public.celebrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: song_celebration
-- ============================================
CREATE POLICY "Todos podem ver relações"
  ON public.song_celebration FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar relações"
  ON public.song_celebration FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: song_artists
-- ============================================
CREATE POLICY "Todos podem ver relações artistas"
  ON public.song_artists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar relações artistas"
  ON public.song_artists FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: audio_tracks
-- ============================================
CREATE POLICY "Todos podem ver áudios aprovados"
  ON public.audio_tracks FOR SELECT
  TO authenticated
  USING (approved = true OR uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Membros podem fazer upload de áudios"
  ON public.audio_tracks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Usuários podem atualizar próprios áudios"
  ON public.audio_tracks FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar áudios"
  ON public.audio_tracks FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: scores
-- ============================================
CREATE POLICY "Todos podem ver partituras aprovadas"
  ON public.scores FOR SELECT
  TO authenticated
  USING (approved = true OR uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Membros podem fazer upload de partituras"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Usuários podem atualizar próprias partituras"
  ON public.scores FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar partituras"
  ON public.scores FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES: rehearsal_lists
-- ============================================
CREATE POLICY "Todos podem ver listas de ensaio"
  ON public.rehearsal_lists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar listas"
  ON public.rehearsal_lists FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

-- ============================================
-- RLS POLICIES: rehearsal_list_songs
-- ============================================
CREATE POLICY "Todos podem ver músicas das listas"
  ON public.rehearsal_list_songs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar músicas das listas"
  ON public.rehearsal_list_songs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('scores', 'scores', true),
  ('audio-tracks', 'audio-tracks', true);

-- ============================================
-- STORAGE POLICIES: scores
-- ============================================
CREATE POLICY "Partituras são públicas para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scores');

CREATE POLICY "Membros autenticados podem fazer upload de partituras"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'scores');

CREATE POLICY "Usuários podem atualizar suas partituras"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'scores');

CREATE POLICY "Admins podem deletar partituras"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'scores');

-- ============================================
-- STORAGE POLICIES: audio-tracks
-- ============================================
CREATE POLICY "Áudios são públicos para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-tracks');

CREATE POLICY "Membros autenticados podem fazer upload de áudios"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio-tracks');

CREATE POLICY "Usuários podem atualizar seus áudios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'audio-tracks');

CREATE POLICY "Admins podem deletar áudios"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio-tracks');