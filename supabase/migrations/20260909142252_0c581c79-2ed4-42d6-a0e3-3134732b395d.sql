-- Availability posts are the only Pulse surface without a two-way block guard.
DROP POLICY IF EXISTS availability_block_guard ON public.seller_availability;
CREATE POLICY availability_block_guard
  ON public.seller_availability
  FOR SELECT
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), seller_user_id));

-- Named moderation queue surface for administrators / App Review.
CREATE OR REPLACE VIEW public.moderation_reports
WITH (security_invoker = true) AS
SELECT
  r.id,
  r.reporter_user_id,
  r.reported_user_id,
  r.target_type    AS content_type,
  r.target_id      AS content_id,
  r.reason_code,
  r.reason,
  r.details,
  r.content_snapshot,
  r.status,
  r.created_at,
  r.updated_at
FROM public.reports r;

GRANT SELECT ON public.moderation_reports TO authenticated;
GRANT ALL ON public.moderation_reports TO service_role;