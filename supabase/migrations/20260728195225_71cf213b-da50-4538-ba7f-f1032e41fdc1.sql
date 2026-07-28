-- =========================================================================
-- PHASE 1: schools registry, verified profiles, marketplace + trust schema
-- =========================================================================

-- ---------- SCHOOLS ------------------------------------------------------
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'university' CHECK (type IN ('hbcu','university','college','community')),
  city text,
  state text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX schools_domain_idx ON public.schools (domain);
CREATE INDEX schools_type_idx ON public.schools (type);
GRANT SELECT ON public.schools TO anon, authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schools_public_read" ON public.schools FOR SELECT USING (true);
CREATE POLICY "schools_admin_write" ON public.schools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER schools_set_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed HBCU schools
INSERT INTO public.schools (name, domain, type) VALUES
  ('Howard University', 'howard.edu', 'hbcu'),
  ('Howard University', 'bison.howard.edu', 'hbcu'),
  ('Spelman College', 'spelman.edu', 'hbcu'),
  ('Morehouse College', 'morehouse.edu', 'hbcu'),
  ('Hampton University', 'hamptonu.edu', 'hbcu'),
  ('Hampton University', 'my.hamptonu.edu', 'hbcu'),
  ('FAMU', 'famu.edu', 'hbcu'),
  ('FAMU', 'rattlers.famu.edu', 'hbcu'),
  ('Talladega College', 'talladega.edu', 'hbcu'),
  ('Tuskegee University', 'tuskegee.edu', 'hbcu'),
  ('NCCU', 'nccu.edu', 'hbcu'),
  ('NCCU', 'eagles.nccu.edu', 'hbcu'),
  ('Jackson State', 'jsums.edu', 'hbcu'),
  ('Southern University', 'subr.edu', 'hbcu'),
  ('Alabama State', 'alasu.edu', 'hbcu'),
  ('Alabama State', 'myasu.alasu.edu', 'hbcu'),
  ('Alabama A&M', 'aamu.edu', 'hbcu'),
  ('Alabama A&M', 'bulldogs.aamu.edu', 'hbcu'),
  ('Grambling State', 'gram.edu', 'hbcu'),
  ('Prairie View A&M', 'pvamu.edu', 'hbcu'),
  ('Texas Southern', 'tsu.edu', 'hbcu'),
  ('Tennessee State', 'tnstate.edu', 'hbcu'),
  ('Tennessee State', 'my.tnstate.edu', 'hbcu'),
  ('Fisk University', 'fisk.edu', 'hbcu'),
  ('Clark Atlanta', 'cau.edu', 'hbcu'),
  ('Morgan State', 'morgan.edu', 'hbcu'),
  ('Bowie State', 'bowiestate.edu', 'hbcu'),
  ('Coppin State', 'coppin.edu', 'hbcu'),
  ('Delaware State', 'desu.edu', 'hbcu'),
  ('Lincoln University', 'lincoln.edu', 'hbcu'),
  ('Lincoln University', 'lincolnu.edu', 'hbcu'),
  ('Cheyney University', 'cheyney.edu', 'hbcu'),
  ('North Carolina A&T', 'ncat.edu', 'hbcu'),
  ('North Carolina A&T', 'aggies.ncat.edu', 'hbcu'),
  ('Winston-Salem State', 'wssu.edu', 'hbcu'),
  ('Fayetteville State', 'uncfsu.edu', 'hbcu'),
  ('Elizabeth City State', 'ecsu.edu', 'hbcu'),
  ('Johnson C. Smith', 'jcsu.edu', 'hbcu'),
  ('Livingstone College', 'livingstone.edu', 'hbcu'),
  ('Shaw University', 'shawu.edu', 'hbcu'),
  ('Saint Augustine''s', 'st-aug.edu', 'hbcu'),
  ('Bennett College', 'bennett.edu', 'hbcu'),
  ('Bethune-Cookman', 'cookman.edu', 'hbcu'),
  ('Edward Waters', 'ewu.edu', 'hbcu'),
  ('Florida Memorial', 'fmuniv.edu', 'hbcu'),
  ('South Carolina State', 'scsu.edu', 'hbcu'),
  ('Claflin University', 'claflin.edu', 'hbcu'),
  ('Benedict College', 'benedict.edu', 'hbcu'),
  ('Allen University', 'allenuniversity.edu', 'hbcu'),
  ('Voorhees University', 'voorhees.edu', 'hbcu'),
  ('Norfolk State', 'nsu.edu', 'hbcu'),
  ('Virginia State', 'vsu.edu', 'hbcu'),
  ('Virginia Union', 'vuu.edu', 'hbcu'),
  ('Virginia University of Lynchburg', 'vul.edu', 'hbcu'),
  ('West Virginia State', 'wvstateu.edu', 'hbcu'),
  ('Bluefield State', 'bluefieldstate.edu', 'hbcu'),
  ('Kentucky State', 'kysu.edu', 'hbcu'),
  ('Central State', 'centralstate.edu', 'hbcu'),
  ('Wilberforce University', 'wilberforce.edu', 'hbcu'),
  ('Harris-Stowe State', 'hssu.edu', 'hbcu'),
  ('Langston University', 'langston.edu', 'hbcu'),
  ('Philander Smith', 'philander.edu', 'hbcu'),
  ('Arkansas Baptist', 'arkansasbaptist.edu', 'hbcu'),
  ('UAPB', 'uapb.edu', 'hbcu'),
  ('Xavier University of Louisiana', 'xula.edu', 'hbcu'),
  ('Dillard University', 'dillard.edu', 'hbcu'),
  ('Southern University at New Orleans', 'suno.edu', 'hbcu'),
  ('Miles College', 'miles.edu', 'hbcu'),
  ('Stillman College', 'stillman.edu', 'hbcu'),
  ('Oakwood University', 'oakwood.edu', 'hbcu'),
  ('Selma University', 'selmauniversity.edu', 'hbcu'),
  ('Rust College', 'rustcollege.edu', 'hbcu'),
  ('Tougaloo College', 'tougaloo.edu', 'hbcu'),
  ('Alcorn State', 'alcorn.edu', 'hbcu'),
  ('Mississippi Valley State', 'mvsu.edu', 'hbcu'),
  ('Paul Quinn College', 'pqc.edu', 'hbcu'),
  ('Wiley University', 'wileyc.edu', 'hbcu'),
  ('Huston-Tillotson', 'htu.edu', 'hbcu'),
  ('Jarvis Christian', 'jarvis.edu', 'hbcu');

-- ---------- SCHOOL ACCESS REQUESTS --------------------------------------
CREATE TABLE public.school_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_school_name text NOT NULL,
  requested_domain text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sar_status_idx ON public.school_access_requests (status, created_at DESC);
CREATE INDEX sar_user_idx ON public.school_access_requests (requester_user_id);
GRANT SELECT, INSERT, UPDATE ON public.school_access_requests TO authenticated;
GRANT ALL ON public.school_access_requests TO service_role;
ALTER TABLE public.school_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sar_self_read" ON public.school_access_requests FOR SELECT TO authenticated
  USING (auth.uid() = requester_user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "sar_self_insert" ON public.school_access_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_user_id);
CREATE POLICY "sar_admin_update" ON public.school_access_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER sar_set_updated_at BEFORE UPDATE ON public.school_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- PROFILES: add verification columns --------------------------
ALTER TABLE public.profiles
  ADD COLUMN school_id uuid REFERENCES public.schools(id),
  ADD COLUMN verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','alumni','denied')),
  ADD COLUMN is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN suspended_reason text,
  ADD COLUMN suspended_at timestamptz;
CREATE INDEX profiles_school_id_idx ON public.profiles (school_id);
CREATE INDEX profiles_suspended_idx ON public.profiles (is_suspended);

-- Backfill: derive school_id/verified from existing domain
UPDATE public.profiles p
SET school_id = s.id,
    verification_status = 'verified',
    is_hbcu_student = (s.type = 'hbcu')
FROM public.schools s
WHERE lower(p.school_domain) = s.domain
  AND p.school_id IS NULL;

-- Admin allowed to admin-manage admin, so read via has_role. Add admin read
CREATE POLICY "profiles_admin_read" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Column-lock trigger: reverts protected columns on self-update
CREATE OR REPLACE FUNCTION public.profiles_guard_protected_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.school_id := OLD.school_id;
  NEW.school_name := OLD.school_name;
  NEW.school_domain := OLD.school_domain;
  NEW.is_hbcu_student := OLD.is_hbcu_student;
  NEW.verification_status := OLD.verification_status;
  NEW.is_suspended := OLD.is_suspended;
  NEW.suspended_reason := OLD.suspended_reason;
  NEW.suspended_at := OLD.suspended_at;
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_guard_protected
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_protected_columns();

-- Rewrite handle_new_user() to derive school on server from verified email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_domain text := lower(split_part(NEW.email, '@', 2));
  v_school public.schools;
BEGIN
  SELECT * INTO v_school FROM public.schools
    WHERE domain = v_domain AND is_active = true LIMIT 1;

  INSERT INTO public.profiles (
    id, email, full_name, year, major,
    school_id, school_name, school_domain, is_hbcu_student,
    verification_status, terms_accepted_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'year',
    NEW.raw_user_meta_data ->> 'major',
    v_school.id,
    v_school.name,
    CASE WHEN v_school.id IS NOT NULL THEN v_domain ELSE NULL END,
    COALESCE(v_school.type = 'hbcu', false),
    CASE WHEN v_school.id IS NOT NULL THEN 'verified' ELSE 'pending' END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted') = 'true' THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- HELPER: is caller suspended ---------------------------------
CREATE OR REPLACE FUNCTION public.is_suspended(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_suspended FROM public.profiles WHERE id = _user_id), false)
$$;

-- ---------- BUSINESSES --------------------------------------------------
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  bio text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX businesses_owner_idx ON public.businesses (owner_user_id);
CREATE INDEX businesses_school_idx ON public.businesses (school_id);
GRANT SELECT ON public.businesses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biz_public_read_active" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "biz_owner_read" ON public.businesses FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "biz_owner_write" ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND NOT public.is_suspended(auth.uid()));
CREATE POLICY "biz_owner_update" ON public.businesses FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "biz_owner_delete" ON public.businesses FOR DELETE TO authenticated USING (owner_user_id = auth.uid());
CREATE TRIGGER biz_set_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- LISTINGS ----------------------------------------------------
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('item','service','booking')),
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','sold','removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listings_seller_idx ON public.listings (seller_user_id);
CREATE INDEX listings_school_idx ON public.listings (school_id);
CREATE INDEX listings_category_idx ON public.listings (category);
CREATE INDEX listings_status_idx ON public.listings (status);
CREATE INDEX listings_created_idx ON public.listings (created_at DESC);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_public_active" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "listings_seller_read" ON public.listings FOR SELECT TO authenticated USING (seller_user_id = auth.uid());
CREATE POLICY "listings_seller_insert" ON public.listings FOR INSERT TO authenticated
  WITH CHECK (seller_user_id = auth.uid() AND NOT public.is_suspended(auth.uid()));
CREATE POLICY "listings_seller_update" ON public.listings FOR UPDATE TO authenticated
  USING (seller_user_id = auth.uid()) WITH CHECK (seller_user_id = auth.uid());
CREATE POLICY "listings_seller_delete" ON public.listings FOR DELETE TO authenticated USING (seller_user_id = auth.uid());
CREATE TRIGGER listings_set_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- LISTING IMAGES ---------------------------------------------
CREATE TABLE public.listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listing_images_listing_idx ON public.listing_images (listing_id, position);
GRANT SELECT ON public.listing_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_images TO authenticated;
GRANT ALL ON public.listing_images TO service_role;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "li_public_read" ON public.listing_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.status = 'active'));
CREATE POLICY "li_owner_all" ON public.listing_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()));

-- ---------- SERVICE AVAILABILITY ---------------------------------------
CREATE TABLE public.service_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sa_listing_idx ON public.service_availability (listing_id);
GRANT SELECT ON public.service_availability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_availability TO authenticated;
GRANT ALL ON public.service_availability TO service_role;
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sa_public_read" ON public.service_availability FOR SELECT USING (true);
CREATE POLICY "sa_owner_write" ON public.service_availability FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()));

-- ---------- CONVERSATIONS / MEMBERS / MESSAGES -------------------------
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX cm_user_idx ON public.conversation_members (user_id);
GRANT SELECT, INSERT, DELETE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Helper avoids recursive RLS (members -> conversation checks members)
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conv uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.conversation_members WHERE conversation_id = _conv AND user_id = _user)
$$;

CREATE POLICY "conv_member_read" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_member(id, auth.uid()));
CREATE POLICY "conv_creator_insert" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND NOT public.is_suspended(auth.uid()));

CREATE POLICY "cm_self_read" ON public.conversation_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "cm_add" ON public.conversation_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );
CREATE POLICY "cm_self_leave" ON public.conversation_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_idx ON public.messages (conversation_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_member_read" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "msg_member_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_user_id = auth.uid()
    AND public.is_conversation_member(conversation_id, auth.uid())
    AND NOT public.is_suspended(auth.uid())
  );

-- ---------- ORDERS / ORDER_ITEMS / BOOKINGS ----------------------------
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','completed','cancelled','disputed')),
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_buyer_idx ON public.orders (buyer_user_id);
CREATE INDEX orders_seller_idx ON public.orders (seller_user_id);
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_created_idx ON public.orders (created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_participant_read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() IN (buyer_user_id, seller_user_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_buyer_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (buyer_user_id = auth.uid() AND NOT public.is_suspended(auth.uid()));
CREATE POLICY "orders_participant_update" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() IN (buyer_user_id, seller_user_id))
  WITH CHECK (auth.uid() IN (buyer_user_id, seller_user_id));
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  qty integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX oi_order_idx ON public.order_items (order_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oi_participant_read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (auth.uid() IN (o.buyer_user_id, o.seller_user_id) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "oi_buyer_insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_user_id = auth.uid()));

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_min integer NOT NULL CHECK (duration_min > 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_order_idx ON public.bookings (order_id);
CREATE INDEX bookings_scheduled_idx ON public.bookings (scheduled_at);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_participant_read" ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND auth.uid() IN (o.buyer_user_id, o.seller_user_id)));
CREATE POLICY "bookings_participant_write" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND auth.uid() IN (o.buyer_user_id, o.seller_user_id)));
CREATE POLICY "bookings_participant_update" ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND auth.uid() IN (o.buyer_user_id, o.seller_user_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND auth.uid() IN (o.buyer_user_id, o.seller_user_id)));
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- REVIEWS -----------------------------------------------------
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text CHECK (body IS NULL OR char_length(body) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_subject_idx ON public.reviews (subject_user_id);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_if_completed_order" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_user_id = auth.uid()
    AND NOT public.is_suspended(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.status = 'completed'
        AND auth.uid() IN (o.buyer_user_id, o.seller_user_id)
        AND subject_user_id IN (o.buyer_user_id, o.seller_user_id)
        AND subject_user_id <> auth.uid()
    )
  );
CREATE POLICY "reviews_self_update" ON public.reviews FOR UPDATE TO authenticated
  USING (reviewer_user_id = auth.uid()) WITH CHECK (reviewer_user_id = auth.uid());
CREATE POLICY "reviews_self_delete" ON public.reviews FOR DELETE TO authenticated USING (reviewer_user_id = auth.uid());
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- REPORTS / DISPUTES / ADMIN ACTIONS -------------------------
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_status_idx ON public.reports (status, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_self_read" ON public.reports FOR SELECT TO authenticated
  USING (reporter_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reports_self_insert" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_user_id = auth.uid());
CREATE POLICY "reports_admin_update" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX disputes_order_idx ON public.disputes (order_id);
CREATE INDEX disputes_status_idx ON public.disputes (status);
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disputes_participant_read" ON public.disputes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (auth.uid() IN (o.buyer_user_id, o.seller_user_id) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "disputes_participant_insert" ON public.disputes FOR INSERT TO authenticated
  WITH CHECK (opened_by = auth.uid() AND EXISTS (SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND auth.uid() IN (o.buyer_user_id, o.seller_user_id)));
CREATE POLICY "disputes_admin_update" ON public.disputes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER disputes_set_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX aa_admin_idx ON public.admin_actions (admin_user_id, created_at DESC);
GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT ALL ON public.admin_actions TO service_role;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aa_admin_read" ON public.admin_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "aa_admin_insert" ON public.admin_actions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') AND admin_user_id = auth.uid());

-- ---------- BLOCKED USERS / FAVORITES / NOTIFICATIONS ------------------
CREATE TABLE public.blocked_users (
  blocker_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_user_id, blocked_user_id)
);
GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;
GRANT ALL ON public.blocked_users TO service_role;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked_self" ON public.blocked_users FOR ALL TO authenticated
  USING (blocker_user_id = auth.uid()) WITH CHECK (blocker_user_id = auth.uid());

CREATE TABLE public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
CREATE INDEX favorites_user_idx ON public.favorites (user_id);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_self" ON public.favorites FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notif_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_self_read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_self_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_self_delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------- PLANS / SUBS / BOOSTS / PAYOUTS ----------------------------
CREATE TABLE public.subscription_plans (
  code text PRIMARY KEY,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "plans_admin_write" ON public.subscription_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER plans_set_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.seller_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code text NOT NULL REFERENCES public.subscription_plans(code),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','expired')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ss_user_idx ON public.seller_subscriptions (user_id);
GRANT SELECT, INSERT, UPDATE ON public.seller_subscriptions TO authenticated;
GRANT ALL ON public.seller_subscriptions TO service_role;
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_self" ON public.seller_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ss_self_write" ON public.seller_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "ss_self_update" ON public.seller_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER ss_set_updated_at BEFORE UPDATE ON public.seller_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  kind text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX boosts_listing_idx ON public.boosts (listing_id);
CREATE INDEX boosts_expires_idx ON public.boosts (expires_at);
GRANT SELECT ON public.boosts TO anon;
GRANT SELECT, INSERT ON public.boosts TO authenticated;
GRANT ALL ON public.boosts TO service_role;
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boosts_public_read" ON public.boosts FOR SELECT USING (true);
CREATE POLICY "boosts_owner_insert" ON public.boosts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()));

CREATE TABLE public.payout_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pa_user_idx ON public.payout_accounts (user_id);
GRANT SELECT, INSERT, UPDATE ON public.payout_accounts TO authenticated;
GRANT ALL ON public.payout_accounts TO service_role;
ALTER TABLE public.payout_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_self" ON public.payout_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pa_self_insert" ON public.payout_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pa_self_update" ON public.payout_accounts FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER pa_set_updated_at BEFORE UPDATE ON public.payout_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();