-- 1) Public profile view serves the safe column subset for anonymous visitors
ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2) Remove anonymous direct read access to the base profiles table
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (COALESCE(is_suspended, false) = false);

-- 3) Ensure no anon column grants remain on profiles
REVOKE ALL ON public.profiles FROM anon;