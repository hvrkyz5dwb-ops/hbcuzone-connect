-- Replace the security-definer view with column-level grants + a narrow public
-- read policy, so the view can run as the querying user again.
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Safe, non-private columns only. Email, suspension reason, onboarding and
-- terms timestamps, school_domain and account_type are deliberately excluded.
GRANT SELECT (
  id, username, display_name, full_name, school_name, school_id,
  graduation_year, year, major, status, bio, avatar_url, is_hbcu_student,
  verification_status, completed_transactions, rating_avg, rating_count,
  is_suspended, open_to_work, open_to_work_note, created_at
) ON public.profiles TO anon, authenticated;

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_public_read
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_suspended, false) = false);