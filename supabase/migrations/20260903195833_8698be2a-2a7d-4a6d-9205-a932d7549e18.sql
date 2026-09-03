DROP VIEW IF EXISTS public.local_businesses_public;

CREATE OR REPLACE FUNCTION public.get_public_local_businesses(_ids uuid[])
RETURNS TABLE (
  id uuid,
  name text,
  campus_name text,
  description text,
  services_needed text[],
  website text,
  school_id uuid,
  verification_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.name, b.campus_name, b.description, b.services_needed, b.website, b.school_id, b.verification_status
  FROM public.local_businesses b
  WHERE b.verification_status = 'verified'
    AND (_ids IS NULL OR b.id = ANY(_ids))
    AND auth.uid() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_public_local_businesses(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_local_businesses(uuid[]) TO authenticated;