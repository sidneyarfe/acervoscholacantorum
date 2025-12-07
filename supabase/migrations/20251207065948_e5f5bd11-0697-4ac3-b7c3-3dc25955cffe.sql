-- Remover política permissiva atual
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

-- Criar política: usuários veem apenas próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Criar política: admins veem todos os perfis
CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));