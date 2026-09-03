-- 1) local_businesses: restrict full-row reads to owner/admin
DROP POLICY IF EXISTS lb_owner_read ON public.local_businesses;
CREATE POLICY lb_owner_read ON public.local_businesses
FOR SELECT TO authenticated
USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- public-safe projection of verified businesses (no contact details)
CREATE OR REPLACE VIEW public.local_businesses_public
WITH (security_invoker = false) AS
SELECT id, name, campus_name, description, services_needed, website, school_id, verification_status, created_at
FROM public.local_businesses
WHERE verification_status = 'verified';

GRANT SELECT ON public.local_businesses_public TO authenticated;
GRANT SELECT ON public.local_businesses_public TO service_role;

-- 2) opportunity_applications: split update rights
DROP POLICY IF EXISTS opp_app_update ON public.opportunity_applications;

CREATE POLICY opp_app_update_student ON public.opportunity_applications
FOR UPDATE TO authenticated
USING (student_user_id = auth.uid())
WITH CHECK (student_user_id = auth.uid());

CREATE POLICY opp_app_update_business ON public.opportunity_applications
FOR UPDATE TO authenticated
USING (business_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (business_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.opportunity_applications_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- identity columns are immutable
  IF NEW.opportunity_id IS DISTINCT FROM OLD.opportunity_id
     OR NEW.student_user_id IS DISTINCT FROM OLD.student_user_id
     OR NEW.business_user_id IS DISTINCT FROM OLD.business_user_id THEN
    RAISE EXCEPTION 'Application ownership cannot be changed';
  END IF;

  -- only the reviewing business (or an admin) may change status
  IF NEW.status IS DISTINCT FROM OLD.status
     AND auth.uid() IS NOT NULL
     AND auth.uid() <> OLD.business_user_id
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only the business owner can change application status';
  END IF;

  -- applicants may not rewrite the review timestamp trail arbitrarily
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS opportunity_applications_guard_update ON public.opportunity_applications;
CREATE TRIGGER opportunity_applications_guard_update
BEFORE UPDATE ON public.opportunity_applications
FOR EACH ROW EXECUTE FUNCTION public.opportunity_applications_guard_update();