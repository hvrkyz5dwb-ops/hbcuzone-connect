DROP POLICY IF EXISTS listing_images_guest_complete_active ON public.listing_images;

DROP POLICY IF EXISTS li_public_read ON public.listing_images;
CREATE POLICY li_public_read
ON public.listing_images
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = listing_images.listing_id
      AND l.status = 'active'
      AND l.moderation_status = 'approved'
  )
);

DROP POLICY IF EXISTS listings_guest_complete_active ON public.listings;
CREATE POLICY listings_guest_complete_active
ON public.listings
FOR SELECT
TO anon
USING (
  status = 'active'
  AND moderation_status = 'approved'
  AND btrim(title) <> ''
  AND btrim(COALESCE(description, '')) <> ''
  AND btrim(category) <> ''
  AND school_id IS NOT NULL
  AND btrim(COALESCE(campus_name, '')) <> ''
);
