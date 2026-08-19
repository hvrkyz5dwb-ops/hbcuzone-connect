-- ============ Campus zones (approximate areas only, never exact locations) ============
CREATE TABLE IF NOT EXISTS public.campus_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'general',
  x double precision NOT NULL DEFAULT 50,
  y double precision NOT NULL DEFAULT 50,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_zones TO authenticated;
GRANT ALL ON public.campus_zones TO service_role;
ALTER TABLE public.campus_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campus_zones_read_authenticated" ON public.campus_zones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "campus_zones_admin_write" ON public.campus_zones
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS campus_zones_school_idx ON public.campus_zones(school_id, sort);

-- ============ Available Now ============
CREATE TABLE IF NOT EXISTS public.seller_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  category text,
  service_label text,
  zone_name text,
  price_from_cents integer,
  slots_remaining integer,
  available_until timestamptz,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_availability TO authenticated;
GRANT ALL ON public.seller_availability TO service_role;
ALTER TABLE public.seller_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_read_authenticated" ON public.seller_availability
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "availability_owner_write" ON public.seller_availability
  FOR ALL TO authenticated USING (auth.uid() = seller_user_id) WITH CHECK (auth.uid() = seller_user_id);
CREATE POLICY "availability_admin_manage" ON public.seller_availability
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS seller_availability_live_idx
  ON public.seller_availability(school_id, is_active, available_until);
CREATE INDEX IF NOT EXISTS seller_availability_category_idx
  ON public.seller_availability(category);

-- ============ Drops + Flash Drops ============
CREATE TABLE IF NOT EXISTS public.drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  event_id uuid REFERENCES public.campus_events(id) ON DELETE SET NULL,
  body text NOT NULL,
  image_url text,
  category text,
  zone_name text,
  price_cents integer,
  cta text NOT NULL DEFAULT 'none',
  is_flash boolean NOT NULL DEFAULT false,
  discount_percent integer,
  discount_cents integer,
  quantity_limit integer,
  quantity_claimed integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drops TO authenticated;
GRANT ALL ON public.drops TO service_role;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drops_read_live" ON public.drops
  FOR SELECT TO authenticated USING (expires_at > now() OR seller_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "drops_owner_write" ON public.drops
  FOR ALL TO authenticated USING (auth.uid() = seller_user_id) WITH CHECK (auth.uid() = seller_user_id);
CREATE POLICY "drops_admin_manage" ON public.drops
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS drops_live_idx ON public.drops(school_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS drops_seller_idx ON public.drops(seller_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS drops_flash_idx ON public.drops(is_flash, expires_at);

CREATE TABLE IF NOT EXISTS public.drop_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (drop_id, user_id)
);
GRANT SELECT, INSERT ON public.drop_claims TO authenticated;
GRANT ALL ON public.drop_claims TO service_role;
ALTER TABLE public.drop_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drop_claims_read_own_or_owner" ON public.drop_claims
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.drops d WHERE d.id = drop_id AND d.seller_user_id = auth.uid())
    OR public.has_role(auth.uid(),'admin')
  );

-- Atomic flash-drop claim: locks the row so quantity can never oversell.
CREATE OR REPLACE FUNCTION public.claim_flash_drop(_drop_id uuid)
RETURNS TABLE(claimed boolean, remaining integer, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_drop public.drops;
BEGIN
  IF v_me IS NULL THEN RETURN QUERY SELECT false, 0, 'sign in required'; RETURN; END IF;
  SELECT * INTO v_drop FROM public.drops WHERE id = _drop_id FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 0, 'not found'; RETURN; END IF;
  IF v_drop.expires_at <= now() THEN RETURN QUERY SELECT false, 0, 'expired'; RETURN; END IF;
  IF v_drop.seller_user_id = v_me THEN RETURN QUERY SELECT false, 0, 'own drop'; RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.drop_claims WHERE drop_id = _drop_id AND user_id = v_me) THEN
    RETURN QUERY SELECT false,
      GREATEST(0, COALESCE(v_drop.quantity_limit, 0) - v_drop.quantity_claimed), 'already claimed';
    RETURN;
  END IF;
  IF v_drop.quantity_limit IS NOT NULL AND v_drop.quantity_claimed >= v_drop.quantity_limit THEN
    RETURN QUERY SELECT false, 0, 'sold out'; RETURN;
  END IF;

  INSERT INTO public.drop_claims(drop_id, user_id) VALUES (_drop_id, v_me);
  UPDATE public.drops SET quantity_claimed = quantity_claimed + 1 WHERE id = _drop_id
    RETURNING * INTO v_drop;

  INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (v_drop.seller_user_id, 'drop.claimed',
            jsonb_build_object('drop_id', _drop_id));

  RETURN QUERY SELECT true,
    CASE WHEN v_drop.quantity_limit IS NULL THEN NULL::integer
         ELSE GREATEST(0, v_drop.quantity_limit - v_drop.quantity_claimed) END,
    'ok';
END $$;
REVOKE ALL ON FUNCTION public.claim_flash_drop(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_flash_drop(uuid) TO authenticated;

-- ============ Notification preferences ============
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bookings boolean NOT NULL DEFAULT true,
  messages boolean NOT NULL DEFAULT true,
  orders boolean NOT NULL DEFAULT true,
  flash_drops boolean NOT NULL DEFAULT true,
  nearby_availability boolean NOT NULL DEFAULT true,
  favorite_sellers boolean NOT NULL DEFAULT true,
  events boolean NOT NULL DEFAULT true,
  rankings boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,
  max_promos_per_day integer NOT NULL DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_prefs_own" ON public.notification_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ Aggregated campus activity (zone-level counts only) ============
CREATE OR REPLACE FUNCTION public.campus_activity_summary(_school_id uuid)
RETURNS TABLE(zone_name text, available_count integer, drop_count integer, event_count integer, total integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH av AS (
    SELECT COALESCE(NULLIF(zone_name,''),'Campus') AS z, count(*)::int AS c
    FROM public.seller_availability
    WHERE is_active AND (available_until IS NULL OR available_until > now())
      AND (_school_id IS NULL OR school_id = _school_id)
    GROUP BY 1
  ), dr AS (
    SELECT COALESCE(NULLIF(zone_name,''),'Campus') AS z, count(*)::int AS c
    FROM public.drops
    WHERE expires_at > now() AND (_school_id IS NULL OR school_id = _school_id)
    GROUP BY 1
  ), ev AS (
    SELECT COALESCE(NULLIF(location,''),'Campus') AS z, count(*)::int AS c
    FROM public.campus_events
    WHERE status = 'active' AND starts_at > now() - interval '3 hours'
      AND (_school_id IS NULL OR school_id = _school_id)
    GROUP BY 1
  ), zones AS (
    SELECT z FROM av UNION SELECT z FROM dr UNION SELECT z FROM ev
  )
  SELECT zones.z,
         COALESCE(av.c,0), COALESCE(dr.c,0), COALESCE(ev.c,0),
         COALESCE(av.c,0) + COALESCE(dr.c,0) + COALESCE(ev.c,0)
  FROM zones
  LEFT JOIN av ON av.z = zones.z
  LEFT JOIN dr ON dr.z = zones.z
  LEFT JOIN ev ON ev.z = zones.z
  ORDER BY 5 DESC
  LIMIT 40
$$;
REVOKE ALL ON FUNCTION public.campus_activity_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.campus_activity_summary(uuid) TO authenticated;