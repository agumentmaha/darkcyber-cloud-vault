-- Drop old restrictive policies
DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage ads"
ON public.ads
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active ads"
ON public.ads
FOR SELECT
USING (status = 'active');
