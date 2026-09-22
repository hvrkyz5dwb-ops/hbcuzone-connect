-- Public profile reads: column-scoped grants so the security_invoker view works
-- while the email column stays unreachable from the Data API.
GRANT SELECT (
  id, full_name, school_name, school_domain, year, major, bio, avatar_url,
  is_hbcu_student, onboarding_completed_at, terms_accepted_at, created_at,
  updated_at, school_id, verification_status, is_suspended, suspended_reason,
  suspended_at, username, display_name, graduation_year, status,
  completed_transactions, rating_avg, rating_count, account_type,
  open_to_work, open_to_work_note
) ON public.profiles TO anon, authenticated;

GRANT INSERT (
  id, full_name, school_name, school_domain, year, major, bio, avatar_url,
  is_hbcu_student, onboarding_completed_at, terms_accepted_at, school_id,
  username, display_name, graduation_year, status, account_type,
  open_to_work, open_to_work_note
) ON public.profiles TO authenticated;

GRANT UPDATE (
  full_name, school_name, school_domain, year, major, bio, avatar_url,
  is_hbcu_student, onboarding_completed_at, terms_accepted_at, school_id,
  username, display_name, graduation_year, status,
  open_to_work, open_to_work_note
) ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO service_role;

-- Availability feed: keep the block guard for signed-in users only, so anon
-- readers never execute is_blocked_between (which they may not run).
DROP POLICY IF EXISTS availability_block_guard ON public.seller_availability;
CREATE POLICY availability_block_guard
  ON public.seller_availability
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (NOT public.is_blocked_between(auth.uid(), seller_user_id));
