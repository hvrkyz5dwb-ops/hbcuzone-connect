-- ============ CAMPUSES ============
CREATE TABLE public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'college',
  is_hbcu boolean NOT NULL DEFAULT false,
  city text,
  state text,
  center_lat double precision,
  center_lng double precision,
  boundary jsonb,
  map_style text NOT NULL DEFAULT 'plugu-dark',
  verification_status text NOT NULL DEFAULT 'unverified',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campuses TO anon;
GRANT SELECT ON public.campuses TO authenticated;
GRANT ALL ON public.campuses TO service_role;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campuses_public_read" ON public.campuses FOR SELECT USING (is_published = true);
CREATE POLICY "campuses_admin_read" ON public.campuses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "campuses_admin_write" ON public.campuses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ CAMPUS PLACES ============
CREATE TABLE public.campus_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  name text NOT NULL,
  nicknames text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'academic',
  subcategory text,
  description text,
  lat double precision,
  lng double precision,
  boundary jsonb,
  entrances jsonb NOT NULL DEFAULT '[]'::jsonb,
  hours jsonb,
  services text[] NOT NULL DEFAULT '{}',
  accessibility text,
  contact_phone text,
  contact_email text,
  website text,
  address text,
  media jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  verification_source text,
  last_verified_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_places TO anon;
GRANT SELECT, INSERT, UPDATE ON public.campus_places TO authenticated;
GRANT ALL ON public.campus_places TO service_role;
ALTER TABLE public.campus_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "places_public_read" ON public.campus_places FOR SELECT USING (is_published = true);
CREATE POLICY "places_own_read" ON public.campus_places FOR SELECT TO authenticated USING (submitted_by = auth.uid());
CREATE POLICY "places_admin_read" ON public.campus_places FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "places_submit" ON public.campus_places FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid() AND is_published = false AND verification_status = 'pending' AND approved_by IS NULL);
CREATE POLICY "places_own_update_pending" ON public.campus_places FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND is_published = false)
  WITH CHECK (submitted_by = auth.uid() AND is_published = false AND verification_status = 'pending' AND approved_by IS NULL);
CREATE POLICY "places_admin_write" ON public.campus_places FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_places_campus ON public.campus_places(campus_id, is_published);
CREATE INDEX idx_places_category ON public.campus_places(campus_id, category);
CREATE INDEX idx_places_bbox ON public.campus_places(lat, lng);

-- ============ ROUTES ============
CREATE TABLE public.campus_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  from_place_id uuid REFERENCES public.campus_places(id) ON DELETE CASCADE,
  to_place_id uuid REFERENCES public.campus_places(id) ON DELETE CASCADE,
  route_type text NOT NULL DEFAULT 'walking',
  is_accessible boolean NOT NULL DEFAULT false,
  path jsonb NOT NULL DEFAULT '[]'::jsonb,
  distance_m integer,
  duration_min integer,
  verification_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_routes TO anon;
GRANT SELECT ON public.campus_routes TO authenticated;
GRANT ALL ON public.campus_routes TO service_role;
ALTER TABLE public.campus_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_public_read" ON public.campus_routes FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "routes_admin_all" ON public.campus_routes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ FLOORS ============
CREATE TABLE public.campus_floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.campus_places(id) ON DELETE CASCADE,
  floor_number integer NOT NULL,
  label text,
  plan_url text,
  rooms jsonb NOT NULL DEFAULT '[]'::jsonb,
  services text[] NOT NULL DEFAULT '{}',
  accessibility text,
  verification_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_floors TO anon;
GRANT SELECT ON public.campus_floors TO authenticated;
GRANT ALL ON public.campus_floors TO service_role;
ALTER TABLE public.campus_floors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "floors_public_read" ON public.campus_floors FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "floors_admin_all" ON public.campus_floors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TOURS ============
CREATE TABLE public.campus_tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  audience text NOT NULL DEFAULT 'students',
  duration_min integer,
  cover_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_tours TO anon;
GRANT SELECT ON public.campus_tours TO authenticated;
GRANT ALL ON public.campus_tours TO service_role;
ALTER TABLE public.campus_tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tours_public_read" ON public.campus_tours FOR SELECT USING (is_published = true);
CREATE POLICY "tours_admin_all" ON public.campus_tours FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.campus_tour_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.campus_tours(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.campus_places(id) ON DELETE CASCADE,
  sort integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_tour_stops TO anon;
GRANT SELECT ON public.campus_tour_stops TO authenticated;
GRANT ALL ON public.campus_tour_stops TO service_role;
ALTER TABLE public.campus_tour_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tour_stops_public_read" ON public.campus_tour_stops FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.campus_tours t WHERE t.id = tour_id AND t.is_published = true));
CREATE POLICY "tour_stops_admin_all" ON public.campus_tour_stops FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ LIVE PINS ============
CREATE TABLE public.campus_live_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid REFERENCES public.campuses(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  event_id uuid REFERENCES public.campus_events(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'business',
  category text,
  title text NOT NULL,
  note text,
  place_id uuid REFERENCES public.campus_places(id) ON DELETE SET NULL,
  safe_location_label text NOT NULL,
  lat double precision,
  lng double precision,
  price_range text,
  response_time_min integer,
  appointment_required boolean NOT NULL DEFAULT false,
  accepting_orders boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  moderation_status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_live_pins TO authenticated;
GRANT SELECT ON public.campus_live_pins TO anon;
GRANT ALL ON public.campus_live_pins TO service_role;
ALTER TABLE public.campus_live_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pins_public_read_active" ON public.campus_live_pins FOR SELECT
  USING (status = 'active' AND moderation_status = 'approved' AND expires_at > now());
CREATE POLICY "pins_owner_all" ON public.campus_live_pins FOR ALL TO authenticated
  USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "pins_admin_all" ON public.campus_live_pins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_pins_live ON public.campus_live_pins(campus_id, status, expires_at);

-- ============ SAVED PLACES ============
CREATE TABLE public.saved_places (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.campus_places(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, place_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_places TO authenticated;
GRANT ALL ON public.saved_places TO service_role;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_places_own" ON public.saved_places FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ SEARCHES ============
CREATE TABLE public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.search_history TO authenticated;
GRANT ALL ON public.search_history TO service_role;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_history_own" ON public.search_history FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_search_history_user ON public.search_history(user_id, created_at DESC);

CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  query text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_searches_own" ON public.saved_searches FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ HOME LAYOUT PREFS ============
CREATE TABLE public.home_layout_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  section_order text[] NOT NULL DEFAULT ARRAY['right_now','around_you','tonight','opportunities','campus_updates','your_activity'],
  hidden_sections text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_layout_prefs TO authenticated;
GRANT ALL ON public.home_layout_prefs TO service_role;
ALTER TABLE public.home_layout_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home_prefs_own" ON public.home_layout_prefs FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ LOCATION SETTINGS ============
CREATE TABLE public.location_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'never',
  live_business_availability boolean NOT NULL DEFAULT false,
  temporary_share_until timestamptz,
  temporary_share_with uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_settings TO authenticated;
GRANT ALL ON public.location_settings TO service_role;
ALTER TABLE public.location_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "location_settings_own" ON public.location_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ UPDATED_AT TRIGGERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_campuses_updated BEFORE UPDATE ON public.campuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_places_updated BEFORE UPDATE ON public.campus_places
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_routes_updated BEFORE UPDATE ON public.campus_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_floors_updated BEFORE UPDATE ON public.campus_floors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tours_updated BEFORE UPDATE ON public.campus_tours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pins_updated BEFORE UPDATE ON public.campus_live_pins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TALLADEGA PILOT CAMPUS (record only, no invented places) ============
INSERT INTO public.campuses (name, type, is_hbcu, city, state, verification_status, is_published, map_style)
VALUES ('Talladega College', 'college', true, 'Talladega', 'AL', 'pending', true, 'plugu-dark');