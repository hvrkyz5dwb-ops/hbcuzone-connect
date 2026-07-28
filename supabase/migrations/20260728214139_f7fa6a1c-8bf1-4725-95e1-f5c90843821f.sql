-- Admin visibility on moderation surfaces
DROP POLICY IF EXISTS reports_admin_read ON public.reports;
CREATE POLICY reports_admin_read ON public.reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS disputes_admin_read ON public.disputes;
CREATE POLICY disputes_admin_read ON public.disputes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS listings_admin_read ON public.listings;
CREATE POLICY listings_admin_read ON public.listings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS listings_admin_update ON public.listings;
CREATE POLICY listings_admin_update ON public.listings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS orders_admin_read ON public.orders;
CREATE POLICY orders_admin_read ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Constrain valid report reasons and targets
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_target_type_chk;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_chk
  CHECK (target_type IN ('user','listing','message','review','order','business'));

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reason_chk;
ALTER TABLE public.reports ADD CONSTRAINT reports_reason_chk
  CHECK (char_length(reason) BETWEEN 1 AND 1000);

-- Admin action helper: single privileged entrypoint that logs to admin_actions
CREATE OR REPLACE FUNCTION public.admin_perform(
  _action text, _target_type text, _target_id uuid, _note text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF NOT public.has_role(v_me, 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;

  IF _action = 'listing.approve' THEN
    UPDATE public.listings SET moderation_status='approved', status='active', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'listing.reject' THEN
    UPDATE public.listings SET moderation_status='rejected', status='paused', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'listing.remove' THEN
    UPDATE public.listings SET moderation_status='removed', status='removed', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'user.suspend' THEN
    UPDATE public.profiles SET is_suspended=true, suspended_reason=_note, suspended_at=now(), updated_at=now() WHERE id=_target_id;
    UPDATE public.listings SET status='paused', updated_at=now() WHERE seller_user_id=_target_id AND status='active';
  ELSIF _action = 'user.restore' THEN
    UPDATE public.profiles SET is_suspended=false, suspended_reason=NULL, suspended_at=NULL, updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'report.resolve' THEN
    UPDATE public.reports SET status='resolved', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'report.dismiss' THEN
    UPDATE public.reports SET status='dismissed', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'dispute.resolve' THEN
    UPDATE public.disputes SET status='resolved', resolution_note=_note, updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'dispute.reject' THEN
    UPDATE public.disputes SET status='rejected', resolution_note=_note, updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'review.remove' THEN
    DELETE FROM public.reviews WHERE id=_target_id;
  ELSE
    RAISE EXCEPTION 'unknown admin action: %', _action;
  END IF;

  INSERT INTO public.admin_actions(admin_user_id, action, target_type, target_id, note)
    VALUES (v_me, _action, _target_type, _target_id, _note);
END $$;

REVOKE ALL ON FUNCTION public.admin_perform(text, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_perform(text, text, uuid, text) TO authenticated;