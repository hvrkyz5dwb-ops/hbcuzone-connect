-- Public discovery surfaces do not require an account. Applications and
-- employer management remain authenticated-only below this read policy.
GRANT EXECUTE ON FUNCTION public.is_verified_local_business(uuid) TO anon;
GRANT SELECT ON public.opportunities TO anon;

DROP POLICY IF EXISTS opp_guest_read ON public.opportunities;
CREATE POLICY opp_guest_read ON public.opportunities
  FOR SELECT TO anon
  USING (
    status = 'open'
    AND moderation_status = 'approved'
    AND public.is_verified_local_business(owner_user_id)
  );