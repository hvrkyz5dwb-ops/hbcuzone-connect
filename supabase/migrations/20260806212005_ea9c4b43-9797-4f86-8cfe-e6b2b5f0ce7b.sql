-- 1. Launch subscription plans
INSERT INTO public.subscription_plans (code, name, price_cents, features, is_active)
VALUES
  ('free', 'Free Seller', 0, '{"fee_percent": 5, "cycle": "monthly", "placement": "standard"}'::jsonb, true),
  ('pro', 'Verified Pro', 1999, '{"fee_percent": 2, "cycle": "semester", "valid_days": 150, "placement": "pinned_top", "featured_slide": true, "promo_scope": "campus"}'::jsonb, true),
  ('kingpin', 'KingPin Seller', 9999, '{"fee_percent": 0, "cycle": "year", "valid_days": 365, "placement": "highest", "featured_slide": true, "promo_scope": "campus"}'::jsonb, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 2. Promotion targeting scope on seller subscriptions (admin-controlled)
ALTER TABLE public.seller_subscriptions
  ADD COLUMN IF NOT EXISTS promo_scope text NOT NULL DEFAULT 'campus';
ALTER TABLE public.seller_subscriptions
  DROP CONSTRAINT IF EXISTS seller_subscriptions_promo_scope_check;
ALTER TABLE public.seller_subscriptions
  ADD CONSTRAINT seller_subscriptions_promo_scope_check
  CHECK (promo_scope IN ('campus','nearby','state','regional','national'));

CREATE POLICY "ss_admin_all"
ON public.seller_subscriptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Promo codes
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text,
  discount_percent integer NOT NULL,
  applies_to text NOT NULL DEFAULT 'subscription',
  max_redemptions integer,
  per_account_limit integer NOT NULL DEFAULT 1,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_discount_check CHECK (discount_percent BETWEEN 1 AND 100),
  CONSTRAINT promo_codes_applies_to_check CHECK (applies_to IN ('subscription','boost','all'))
);
GRANT SELECT, INSERT, UPDATE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_codes_admin_all"
ON public.promo_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Promo code redemptions (recorded server-side only, after confirmed payment)
CREATE TABLE public.promo_code_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_key text NOT NULL,
  original_cents integer NOT NULL,
  discount_cents integer NOT NULL,
  final_cents integer NOT NULL,
  stripe_session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX promo_redemptions_session_unique
  ON public.promo_code_redemptions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
GRANT SELECT ON public.promo_code_redemptions TO authenticated;
GRANT ALL ON public.promo_code_redemptions TO service_role;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_redemptions_self_read"
ON public.promo_code_redemptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 5. Launch promo code: 50% off subscriptions
INSERT INTO public.promo_codes (code, description, discount_percent, applies_to, per_account_limit)
VALUES ('Havn$hvt', 'Launch partner code — 50% off seller subscriptions', 50, 'subscription', 1)
ON CONFLICT (code) DO NOTHING;

-- 6. Server-side promo validation (active, expiry, total + per-account limits)
CREATE OR REPLACE FUNCTION public.validate_promo_code(_code text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.promo_codes%rowtype;
  total int;
  mine int;
BEGIN
  SELECT * INTO c FROM public.promo_codes WHERE lower(code) = lower(trim(_code));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'That promo code isn''t recognized — check the spelling and try again.');
  END IF;
  IF NOT c.is_active THEN
    RETURN jsonb_build_object('valid', false, 'message', 'This promo code is no longer active.');
  END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'message', 'This promo code has expired.');
  END IF;
  IF c.max_redemptions IS NOT NULL THEN
    SELECT count(*) INTO total FROM public.promo_code_redemptions WHERE code_id = c.id;
    IF total >= c.max_redemptions THEN
      RETURN jsonb_build_object('valid', false, 'message', 'This promo code has been fully redeemed.');
    END IF;
  END IF;
  SELECT count(*) INTO mine FROM public.promo_code_redemptions WHERE code_id = c.id AND user_id = _user_id;
  IF mine >= c.per_account_limit THEN
    RETURN jsonb_build_object('valid', false, 'message', 'You''ve already used this promo code on your account.');
  END IF;
  RETURN jsonb_build_object(
    'valid', true,
    'code_id', c.id,
    'code', c.code,
    'discount_percent', c.discount_percent,
    'applies_to', c.applies_to,
    'message', 'Promo Code Applied — ' || c.discount_percent || '% Off'
  );
END;
$$;

-- 7. Featured promotions for the Home carousel.
-- Pro sellers show to students on their own campus; KingPin sellers show
-- according to their admin-set promo_scope. Featured/boosted campus events
-- show to their campus audience.
CREATE OR REPLACE FUNCTION public.featured_promotions(_viewer_school_id uuid DEFAULT NULL)
RETURNS TABLE (
  kind text,
  id uuid,
  name text,
  category text,
  description text,
  image_url text,
  campus text,
  username text,
  verified boolean,
  tier text,
  starts_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_subs AS (
    SELECT ss.user_id, ss.plan_code, ss.promo_scope
    FROM public.seller_subscriptions ss
    WHERE ss.status = 'active'
      AND ss.plan_code IN ('pro','kingpin')
      AND (ss.current_period_end IS NULL OR ss.current_period_end > now())
  ),
  combined AS (
    SELECT
      'business'::text AS kind,
      b.id,
      b.name,
      coalesce(b.category, 'Business') AS category,
      coalesce(nullif(b.description, ''), b.bio) AS description,
      b.avatar_url AS image_url,
      coalesce(b.campus_name, s.name, 'Campus') AS campus,
      p.username,
      (p.verification_status = 'verified') AS verified,
      a.plan_code AS tier,
      NULL::timestamp with time zone AS starts_at
    FROM public.businesses b
    JOIN active_subs a ON a.user_id = b.owner_user_id
    LEFT JOIN public.profiles p ON p.id = b.owner_user_id
    LEFT JOIN public.schools s ON s.id = b.school_id
    WHERE b.is_active
      AND (
        _viewer_school_id IS NULL
        OR b.school_id = _viewer_school_id
        OR (a.plan_code = 'kingpin' AND a.promo_scope IN ('nearby','state','regional','national'))
      )
    UNION ALL
    SELECT
      'event'::text,
      e.id,
      e.title,
      e.category,
      e.description,
      e.cover_url,
      coalesce(s2.name, e.location),
      p2.username,
      (p2.verification_status = 'verified'),
      CASE WHEN e.boost_tier > 0 THEN 'kingpin' ELSE 'pro' END,
      e.starts_at
    FROM public.campus_events e
    LEFT JOIN public.profiles p2 ON p2.id = e.creator_user_id
    LEFT JOIN public.schools s2 ON s2.id = e.school_id
    WHERE e.status = 'active'
      AND e.starts_at > now() - interval '12 hours'
      AND (e.is_featured OR e.boost_tier > 0)
      AND (_viewer_school_id IS NULL OR e.school_id = _viewer_school_id)
  )
  SELECT kind, id, name, category, description, image_url, campus, username, verified, tier, starts_at
  FROM combined
  ORDER BY CASE WHEN tier = 'kingpin' THEN 0 WHEN tier = 'pro' THEN 1 ELSE 2 END, name
  LIMIT 12
$$;

-- 8. Plan ranks for category placement (KingPin highest, Pro pinned near top)
CREATE OR REPLACE FUNCTION public.seller_plan_ranks(_seller_ids uuid[])
RETURNS TABLE (user_id uuid, plan_code text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ss.user_id, ss.plan_code
  FROM public.seller_subscriptions ss
  WHERE ss.user_id = any(_seller_ids)
    AND ss.status = 'active'
    AND ss.plan_code IN ('pro','kingpin')
    AND (ss.current_period_end IS NULL OR ss.current_period_end > now())
$$;