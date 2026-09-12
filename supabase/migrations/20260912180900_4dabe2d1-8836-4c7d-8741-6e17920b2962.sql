-- 1) Internal trigger helper must not be callable by API roles
REVOKE ALL ON FUNCTION public.opportunity_applications_guard_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.opportunity_applications_guard_update() FROM anon;
REVOKE ALL ON FUNCTION public.opportunity_applications_guard_update() FROM authenticated;

-- 2) local_businesses: contact details never reachable by anonymous role
REVOKE ALL ON TABLE public.local_businesses FROM anon;

-- 3) businesses: active storefronts readable only by non-suspended signed-in members
DROP POLICY IF EXISTS biz_public_read_active ON public.businesses;
CREATE POLICY biz_public_read_active ON public.businesses
  FOR SELECT TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND COALESCE(p.is_suspended, false) = false
    )
  );

-- 4) profiles: hard-revoke sensitive columns from public roles
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;
REVOKE SELECT (school_domain, suspended_reason, suspended_at, terms_accepted_at, onboarding_completed_at, account_type, updated_at) ON public.profiles FROM anon;
