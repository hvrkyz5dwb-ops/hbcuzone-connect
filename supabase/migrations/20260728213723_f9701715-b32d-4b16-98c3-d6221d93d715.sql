-- One review per (order, reviewer)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_reviewer_unique
  ON public.reviews (order_id, reviewer_user_id);

-- Admin removal
DROP POLICY IF EXISTS reviews_admin_delete ON public.reviews;
CREATE POLICY reviews_admin_delete ON public.reviews
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Aggregate trigger: recompute subject_user_id rating stats
CREATE OR REPLACE FUNCTION public.reviews_recompute_subject_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subject uuid;
BEGIN
  v_subject := COALESCE(NEW.subject_user_id, OLD.subject_user_id);
  IF v_subject IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  UPDATE public.profiles p
     SET rating_avg = COALESCE(s.avg, 0),
         rating_count = COALESCE(s.cnt, 0),
         updated_at = now()
    FROM (
      SELECT AVG(rating)::numeric(4,2) AS avg, COUNT(*)::int AS cnt
        FROM public.reviews WHERE subject_user_id = v_subject
    ) s
   WHERE p.id = v_subject;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS reviews_recompute_ai ON public.reviews;
DROP TRIGGER IF EXISTS reviews_recompute_au ON public.reviews;
DROP TRIGGER IF EXISTS reviews_recompute_ad ON public.reviews;
CREATE TRIGGER reviews_recompute_ai AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.reviews_recompute_subject_rating();
CREATE TRIGGER reviews_recompute_au AFTER UPDATE OF rating, subject_user_id ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.reviews_recompute_subject_rating();
CREATE TRIGGER reviews_recompute_ad AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.reviews_recompute_subject_rating();

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS reviews_set_updated_at ON public.reviews;
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Verified reviews view: joins order kind so UI can label
-- verified purchase (product) vs verified booking (service)
CREATE OR REPLACE VIEW public.reviews_verified
WITH (security_invoker = true) AS
SELECT r.id, r.order_id, r.reviewer_user_id, r.subject_user_id,
       r.rating, r.body, r.created_at, r.updated_at,
       o.kind AS order_kind, o.listing_id,
       CASE WHEN o.kind = 'service' THEN 'verified_booking'
            ELSE 'verified_purchase' END AS verification_kind
  FROM public.reviews r
  JOIN public.orders o ON o.id = r.order_id;

GRANT SELECT ON public.reviews_verified TO anon, authenticated;

-- Backfill aggregates once
UPDATE public.profiles p
   SET rating_avg = COALESCE(s.avg, 0),
       rating_count = COALESCE(s.cnt, 0)
  FROM (
    SELECT subject_user_id,
           AVG(rating)::numeric(4,2) AS avg,
           COUNT(*)::int AS cnt
      FROM public.reviews GROUP BY subject_user_id
  ) s
 WHERE p.id = s.subject_user_id;