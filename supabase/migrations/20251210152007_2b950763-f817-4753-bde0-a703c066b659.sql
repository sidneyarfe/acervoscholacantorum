-- Criar enum para status de aprovação
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Adicionar campos à tabela profiles
ALTER TABLE profiles 
ADD COLUMN approval_status approval_status DEFAULT 'pending',
ADD COLUMN approved_by uuid,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN rejection_reason text;

-- Atualizar usuários existentes para 'approved'
UPDATE profiles SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = 'pending';

-- Tornar coluna NOT NULL após popular dados existentes
ALTER TABLE profiles ALTER COLUMN approval_status SET NOT NULL;

-- Atualizar a trigger handle_new_user para incluir approval_status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, approval_status)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', 'pending');
  
  -- Criar papel de membro por padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;