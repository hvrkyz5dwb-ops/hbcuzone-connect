ALTER VIEW public.public_profiles SET (security_invoker = true);
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;