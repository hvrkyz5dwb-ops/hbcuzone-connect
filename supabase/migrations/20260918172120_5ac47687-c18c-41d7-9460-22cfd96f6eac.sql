-- 1. Privileged helper must not be callable by signed-out visitors
REVOKE EXECUTE ON FUNCTION public.my_profile_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_profile_email() TO authenticated;

-- 2. public_profiles runs with the querying user's own permissions again.
--    Row access is restored through a policy on profiles; the email,
--    suspended_at and suspended_reason columns stay revoked from
--    authenticated at the column-privilege level, so they remain private.
ALTER VIEW public.public_profiles SET (security_invoker = true);

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_public_read ON public.profiles
  FOR SELECT TO authenticated
  USING (COALESCE(is_suspended, false) = false);

-- 3. Block guard must be RESTRICTIVE so it is ANDed with the read policy
DROP POLICY IF EXISTS availability_block_guard ON public.seller_availability;
CREATE POLICY availability_block_guard ON public.seller_availability
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), seller_user_id));

-- 4. Scheduling data only for listings that are live and approved
DROP POLICY IF EXISTS sa_public_read ON public.service_availability;
CREATE POLICY sa_public_read ON public.service_availability
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = service_availability.listing_id
      AND l.status = 'active'
      AND l.moderation_status = 'approved'
  ));