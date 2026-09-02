ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('pending','verified','alumni','denied','business'));

-- Re-grant column-scoped SELECT to authenticated. RLS ("Profiles: self read"
-- and profiles_admin_read) still restricts rows to the owner or an admin.
-- The email column is intentionally excluded.
GRANT SELECT (
  id, full_name, school_name, school_domain, year, major, bio, avatar_url,
  is_hbcu_student, onboarding_completed_at, terms_accepted_at, created_at,
  updated_at, school_id, verification_status, is_suspended, suspended_reason,
  suspended_at, username, display_name, graduation_year, status,
  completed_transactions, rating_avg, rating_count, account_type,
  open_to_work, open_to_work_note
) ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;