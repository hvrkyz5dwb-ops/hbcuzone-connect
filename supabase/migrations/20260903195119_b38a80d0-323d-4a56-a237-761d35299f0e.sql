ALTER VIEW public.public_profiles SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.get_public_profiles(_ids uuid[])
RETURNS TABLE (id uuid, username text, display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, COALESCE(p.display_name, p.full_name) AS display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
    AND COALESCE(p.is_suspended, false) = false
$$;

REVOKE ALL ON FUNCTION public.get_public_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;