-- public_profiles exposes only safe, non-private columns and already excludes
-- suspended accounts. It was security_invoker, but no role holds SELECT on
-- public.profiles, so every profile page 404'd. Run it as the view owner.
ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.public_profiles TO anon, authenticated;