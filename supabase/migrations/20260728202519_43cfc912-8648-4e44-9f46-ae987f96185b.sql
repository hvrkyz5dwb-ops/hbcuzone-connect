
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS price_type text NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS campus_name text,
  ADD COLUMN IF NOT EXISTS fulfillment text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quantity integer,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS fulfillment_time text,
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS favorite_count integer NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE public.listings
    ADD CONSTRAINT listings_price_type_chk
    CHECK (price_type IN ('fixed','starting_at','hourly','quote'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.listings
    ADD CONSTRAINT listings_status_chk
    CHECK (status IN ('draft','active','paused','sold_out','removed'));
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN check_violation THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.listings
    ADD CONSTRAINT listings_moderation_chk
    CHECK (moderation_status IN ('pending','approved','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.listings
    ADD CONSTRAINT listings_kind_chk
    CHECK (kind IN ('product','service'));
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN check_violation THEN NULL; END $$;

-- Tighten public read: only active AND approved rows show in the marketplace.
DROP POLICY IF EXISTS listings_public_active ON public.listings;
CREATE POLICY listings_public_active ON public.listings
  FOR SELECT TO public
  USING (status = 'active' AND moderation_status = 'approved');

-- Refresh listing_images public-read to match.
DROP POLICY IF EXISTS li_public_read ON public.listing_images;
CREATE POLICY li_public_read ON public.listing_images
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_images.listing_id
      AND l.status = 'active'
      AND l.moderation_status = 'approved'
  ));

CREATE INDEX IF NOT EXISTS listings_discovery_idx
  ON public.listings (status, moderation_status, category, created_at DESC);

CREATE INDEX IF NOT EXISTS listings_school_idx
  ON public.listings (school_id, status, moderation_status);

-- Keep favorite_count in sync via triggers on favorites.
CREATE OR REPLACE FUNCTION public.listings_bump_favorites()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.listings SET favorite_count = favorite_count + 1 WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.listings SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS favorites_bump ON public.favorites;
CREATE TRIGGER favorites_bump
AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW EXECUTE FUNCTION public.listings_bump_favorites();
