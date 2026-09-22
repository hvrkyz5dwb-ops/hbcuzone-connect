GRANT SELECT ON public.listings TO anon;
DROP POLICY IF EXISTS listings_guest_complete_active ON public.listings;
CREATE POLICY listings_guest_complete_active ON public.listings
  FOR SELECT TO anon
  USING (
    status = 'active'
    AND moderation_status = 'approved'
    AND btrim(title) <> ''
    AND btrim(COALESCE(description, '')) <> ''
    AND btrim(category) <> ''
    AND school_id IS NOT NULL
    AND btrim(COALESCE(campus_name, '')) <> ''
    AND EXISTS (
      SELECT 1 FROM public.listing_images image
      WHERE image.listing_id = listings.id
        AND image.url ~ '^https?://'
    )
  );

GRANT SELECT ON public.listing_images TO anon;
DROP POLICY IF EXISTS listing_images_guest_complete_active ON public.listing_images;
CREATE POLICY listing_images_guest_complete_active ON public.listing_images
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.listings listing
    WHERE listing.id = listing_images.listing_id
      AND listing.status = 'active'
      AND listing.moderation_status = 'approved'
      AND btrim(listing.title) <> ''
      AND btrim(COALESCE(listing.description, '')) <> ''
      AND listing.school_id IS NOT NULL
  ));

GRANT SELECT ON public.campus_events TO anon;
DROP POLICY IF EXISTS campus_events_guest_active ON public.campus_events;
CREATE POLICY campus_events_guest_active ON public.campus_events
  FOR SELECT TO anon
  USING (
    status = 'active'
    AND btrim(title) <> ''
    AND btrim(location) <> ''
    AND starts_at >= now() - interval '12 hours'
  );

GRANT SELECT (id, full_name, display_name, username, school_name, school_domain,
  year, graduation_year, status, major, bio, avatar_url, is_hbcu_student,
  completed_transactions, rating_avg, rating_count, created_at, school_id,
  verification_status, account_type, open_to_work, open_to_work_note)
ON public.profiles TO anon;
GRANT SELECT ON public.public_profiles TO anon;
DROP POLICY IF EXISTS profiles_public_read_anon ON public.profiles;
CREATE POLICY profiles_public_read_anon ON public.profiles
  FOR SELECT TO anon
  USING (
    COALESCE(is_suspended, false) = false
    AND btrim(COALESCE(username, '')) <> ''
    AND btrim(COALESCE(school_name, '')) <> ''
  );