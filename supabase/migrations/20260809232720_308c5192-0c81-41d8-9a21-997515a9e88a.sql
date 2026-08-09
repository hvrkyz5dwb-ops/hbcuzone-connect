-- 1. boosts: hide financial amount from public reads
REVOKE SELECT ON public.boosts FROM anon, authenticated;
GRANT SELECT (id, listing_id, kind, expires_at, created_at) ON public.boosts TO anon, authenticated;
GRANT ALL ON public.boosts TO service_role;

-- 2. profiles: remove email from broadly-readable columns
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. reviews: scope reads to participants or public seller reputation
DROP POLICY IF EXISTS reviews_read_authenticated ON public.reviews;
CREATE POLICY reviews_read_scoped ON public.reviews
FOR SELECT TO authenticated
USING (
  reviewer_user_id = auth.uid()
  OR subject_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (
    NOT public.is_suspended(subject_user_id)
    AND EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.seller_user_id = reviews.subject_user_id
    )
  )
);