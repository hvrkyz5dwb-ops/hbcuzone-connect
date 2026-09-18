-- Keep sensitive profile columns out of general member reads.
REVOKE ALL ON public.profiles FROM anon;
REVOKE SELECT (email, suspended_at, suspended_reason) ON public.profiles FROM authenticated;
GRANT SELECT (email, suspended_at, suspended_reason) ON public.profiles TO service_role;

-- Owners and admins still get their own / privileged access through
-- security-definer functions, which run with elevated rights.
CREATE OR REPLACE FUNCTION public.my_profile_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.my_profile_email() FROM public;
GRANT EXECUTE ON FUNCTION public.my_profile_email() TO authenticated;