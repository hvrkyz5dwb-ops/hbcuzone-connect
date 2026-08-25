-- 1. businesses: restrict public read to authenticated students
DROP POLICY IF EXISTS biz_public_read_active ON public.businesses;
CREATE POLICY biz_public_read_active ON public.businesses
  FOR SELECT TO authenticated USING (is_active = true);
REVOKE ALL ON public.businesses FROM anon;

-- 2. listings: public marketplace reads require an authenticated student session
DROP POLICY IF EXISTS listings_public_active ON public.listings;
CREATE POLICY listings_public_active ON public.listings
  FOR SELECT TO authenticated
  USING (status = 'active' AND moderation_status = 'approved');
REVOKE ALL ON public.listings FROM anon;

-- 3. service_availability: schedules require authentication
DROP POLICY IF EXISTS sa_public_read ON public.service_availability;
CREATE POLICY sa_public_read ON public.service_availability
  FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.service_availability FROM anon;

-- 4. campus_places: published places readable by authenticated only; contact PII never to anon
DROP POLICY IF EXISTS places_public_read ON public.campus_places;
CREATE POLICY places_public_read ON public.campus_places
  FOR SELECT TO authenticated USING (is_published = true);
REVOKE ALL ON public.campus_places FROM anon;

-- 5. explicit admin reject/delete path + submitter cleanup for unpublished submissions
DROP POLICY IF EXISTS places_admin_delete ON public.campus_places;
CREATE POLICY places_admin_delete ON public.campus_places
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS places_own_delete_pending ON public.campus_places;
CREATE POLICY places_own_delete_pending ON public.campus_places
  FOR DELETE TO authenticated USING (submitted_by = auth.uid() AND is_published = false);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_places TO authenticated;
GRANT SELECT ON public.businesses TO authenticated;
GRANT SELECT ON public.listings TO authenticated;
GRANT SELECT ON public.service_availability TO authenticated;