DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT
  id,
  username,
  COALESCE(display_name, full_name) AS display_name,
  full_name,
  school_name,
  graduation_year,
  year,
  major,
  status,
  bio,
  avatar_url,
  is_hbcu_student,
  verification_status,
  account_type,
  open_to_work,
  open_to_work_note,
  completed_transactions,
  rating_avg,
  rating_count,
  created_at
FROM public.profiles
WHERE COALESCE(is_suspended, false) = false;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO service_role;

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;