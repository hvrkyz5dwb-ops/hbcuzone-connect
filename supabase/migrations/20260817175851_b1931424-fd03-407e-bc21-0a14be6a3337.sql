
-- profiles: no blanket cross-user read of the base table (email + PII)
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
REVOKE ALL ON public.profiles FROM anon;

-- public directory data flows through the curated view (no email, no full_name, no school_domain)
ALTER VIEW public.public_profiles SET (security_invoker = false);
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT ALL ON public.public_profiles TO service_role;

-- boosts: no anonymous access; amount_cents stays revoked at column level
DROP POLICY IF EXISTS boosts_public_read ON public.boosts;
REVOKE ALL ON public.boosts FROM anon;
CREATE POLICY boosts_read_authenticated ON public.boosts
  FOR SELECT TO authenticated USING (true);
