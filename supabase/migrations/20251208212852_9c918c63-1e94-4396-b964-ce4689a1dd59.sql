-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins podem gerenciar banners" ON public.banners;
DROP POLICY IF EXISTS "Todos podem ver banners ativos" ON public.banners;

-- Create permissive policies so admins can see ALL banners
CREATE POLICY "Admins podem gerenciar banners" 
ON public.banners 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Todos podem ver banners ativos" 
ON public.banners 
FOR SELECT 
TO authenticated
USING (is_active = true);