-- ============ 1. profiles: account type + open to work ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS open_to_work boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_to_work_note text;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_chk
    CHECK (account_type IN ('student','business'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 2. local_businesses ============
CREATE TABLE IF NOT EXISTS public.local_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  rep_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  address text NOT NULL,
  website text,
  services_needed text[] NOT NULL DEFAULT '{}',
  description text,
  school_id uuid REFERENCES public.schools(id),
  campus_name text,
  verification_status text NOT NULL DEFAULT 'pending',
  verification_note text,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.local_businesses ADD CONSTRAINT local_biz_status_chk
    CHECK (verification_status IN ('pending','verified','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS local_businesses_owner_uniq
  ON public.local_businesses(owner_user_id);

GRANT SELECT, INSERT, UPDATE ON public.local_businesses TO authenticated;
GRANT ALL ON public.local_businesses TO service_role;
ALTER TABLE public.local_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lb_owner_read ON public.local_businesses;
CREATE POLICY lb_owner_read ON public.local_businesses
  FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid()
         OR verification_status = 'verified'
         OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS lb_owner_insert ON public.local_businesses;
CREATE POLICY lb_owner_insert ON public.local_businesses
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND verification_status = 'pending');

DROP POLICY IF EXISTS lb_owner_update ON public.local_businesses;
CREATE POLICY lb_owner_update ON public.local_businesses
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS lb_admin_update ON public.local_businesses;
CREATE POLICY lb_admin_update ON public.local_businesses
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- owners must not self-verify
CREATE OR REPLACE FUNCTION public.local_biz_guard_verification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.verification_status := OLD.verification_status;
    NEW.verification_note   := OLD.verification_note;
    NEW.verified_at         := OLD.verified_at;
    NEW.verified_by         := OLD.verified_by;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.local_biz_guard_verification() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_local_biz_guard ON public.local_businesses;
CREATE TRIGGER trg_local_biz_guard BEFORE UPDATE ON public.local_businesses
  FOR EACH ROW EXECUTE FUNCTION public.local_biz_guard_verification();

-- helper: is this user a verified local business owner?
CREATE OR REPLACE FUNCTION public.is_verified_local_business(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.local_businesses
                 WHERE owner_user_id = _user_id AND verification_status = 'verified');
$$;
REVOKE EXECUTE ON FUNCTION public.is_verified_local_business(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_verified_local_business(uuid) TO authenticated;

-- ============ 3. opportunities ============
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.local_businesses(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  compensation text NOT NULL,
  pay_min_cents integer,
  pay_max_cents integer,
  location text NOT NULL,
  is_remote boolean NOT NULL DEFAULT false,
  deadline date,
  required_skills text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  moderation_status text NOT NULL DEFAULT 'approved',
  applicant_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.opportunities ADD CONSTRAINT opp_status_chk
    CHECK (status IN ('open','paused','filled','closed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.opportunities ADD CONSTRAINT opp_mod_chk
    CHECK (moderation_status IN ('approved','pending','removed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS opportunities_open_idx
  ON public.opportunities(created_at DESC) WHERE status = 'open';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS opp_read ON public.opportunities;
CREATE POLICY opp_read ON public.opportunities
  FOR SELECT TO authenticated
  USING (
    (status = 'open' AND moderation_status = 'approved'
      AND public.is_verified_local_business(owner_user_id))
    OR owner_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS opp_insert ON public.opportunities;
CREATE POLICY opp_insert ON public.opportunities
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid()
              AND public.is_verified_local_business(auth.uid()));

DROP POLICY IF EXISTS opp_update ON public.opportunities;
CREATE POLICY opp_update ON public.opportunities
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS opp_delete ON public.opportunities;
CREATE POLICY opp_delete ON public.opportunities
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ 4. applications ============
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'applied',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, student_user_id)
);

DO $$ BEGIN
  ALTER TABLE public.opportunity_applications ADD CONSTRAINT opp_app_status_chk
    CHECK (status IN ('applied','shortlisted','declined','hired','withdrawn'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, UPDATE ON public.opportunity_applications TO authenticated;
GRANT ALL ON public.opportunity_applications TO service_role;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS opp_app_read ON public.opportunity_applications;
CREATE POLICY opp_app_read ON public.opportunity_applications
  FOR SELECT TO authenticated
  USING (student_user_id = auth.uid() OR business_user_id = auth.uid()
         OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS opp_app_insert ON public.opportunity_applications;
CREATE POLICY opp_app_insert ON public.opportunity_applications
  FOR INSERT TO authenticated
  WITH CHECK (
    student_user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.opportunities o
                WHERE o.id = opportunity_id
                  AND o.owner_user_id = business_user_id
                  AND o.status = 'open'
                  AND o.moderation_status = 'approved')
  );

DROP POLICY IF EXISTS opp_app_update ON public.opportunity_applications;
CREATE POLICY opp_app_update ON public.opportunity_applications
  FOR UPDATE TO authenticated
  USING (student_user_id = auth.uid() OR business_user_id = auth.uid())
  WITH CHECK (student_user_id = auth.uid() OR business_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.opp_app_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.opportunities
    SET applicant_count = applicant_count + 1
    WHERE id = NEW.opportunity_id;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.opp_app_count() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_opp_app_count ON public.opportunity_applications;
CREATE TRIGGER trg_opp_app_count AFTER INSERT ON public.opportunity_applications
  FOR EACH ROW EXECUTE FUNCTION public.opp_app_count();

-- ============ 5. saves ============
CREATE TABLE IF NOT EXISTS public.opportunity_saves (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
);
GRANT SELECT, INSERT, DELETE ON public.opportunity_saves TO authenticated;
GRANT ALL ON public.opportunity_saves TO service_role;
ALTER TABLE public.opportunity_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS opp_saves_own ON public.opportunity_saves;
CREATE POLICY opp_saves_own ON public.opportunity_saves
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ 6. reports accept new targets ============
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_target_type_chk;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_chk
  CHECK (target_type = ANY (ARRAY['user','listing','message','review','order','business','event','post','comment','opportunity','local_business']));

-- ============ 7. signup trigger honours account type ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_domain text := lower(split_part(NEW.email, '@', 2));
  v_kind   text := COALESCE(NEW.raw_user_meta_data ->> 'account_type', 'student');
  v_school public.schools;
BEGIN
  IF v_kind <> 'business' THEN
    SELECT * INTO v_school FROM public.schools
      WHERE domain = v_domain AND is_active = true LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, year, major,
    school_id, school_name, school_domain, is_hbcu_student,
    verification_status, terms_accepted_at, account_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    CASE WHEN v_kind = 'business' THEN NULL ELSE NEW.raw_user_meta_data ->> 'year' END,
    CASE WHEN v_kind = 'business' THEN NULL ELSE NEW.raw_user_meta_data ->> 'major' END,
    v_school.id,
    v_school.name,
    CASE WHEN v_school.id IS NOT NULL THEN v_domain ELSE NULL END,
    COALESCE(v_school.type = 'hbcu', false),
    CASE WHEN v_kind = 'business' THEN 'business'
         WHEN v_school.id IS NOT NULL THEN 'verified'
         ELSE 'pending' END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted') = 'true' THEN now() ELSE NULL END,
    CASE WHEN v_kind = 'business' THEN 'business' ELSE 'student' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;