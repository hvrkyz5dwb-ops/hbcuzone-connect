-- 1. Moderation queue for content held for human review
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id text,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_text text NOT NULL,
  category text NOT NULL,
  decision text NOT NULL DEFAULT 'held',
  status text NOT NULL DEFAULT 'open',
  reviewer_user_id uuid,
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.moderation_queue TO authenticated;
GRANT ALL ON public.moderation_queue TO service_role;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS modq_admin_read ON public.moderation_queue;
CREATE POLICY modq_admin_read ON public.moderation_queue FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS modq_admin_update ON public.moderation_queue;
CREATE POLICY modq_admin_update ON public.moderation_queue FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Reports: snapshot + moderation trail, and reporters may update their own details
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS content_snapshot text,
  ADD COLUMN IF NOT EXISTS moderation_note text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid;
DROP POLICY IF EXISTS reports_self_update ON public.reports;
CREATE POLICY reports_self_update ON public.reports FOR UPDATE TO authenticated
  USING (reporter_user_id = auth.uid()) WITH CHECK (reporter_user_id = auth.uid());

-- 3. Support tickets get a human-readable identifier
ALTER TABLE public.public_support_messages
  ADD COLUMN IF NOT EXISTS ticket_code text;
CREATE OR REPLACE FUNCTION public.set_support_ticket_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := 'PU-' || to_char(now(), 'YYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_support_ticket_code() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_support_ticket_code ON public.public_support_messages;
CREATE TRIGGER trg_support_ticket_code BEFORE INSERT ON public.public_support_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_support_ticket_code();
UPDATE public.public_support_messages SET ticket_code = 'PU-' || to_char(created_at, 'YYMMDD') || '-' ||
  upper(substr(replace(id::text, '-', ''), 1, 6)) WHERE ticket_code IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS public_support_messages_ticket_code_key
  ON public.public_support_messages (ticket_code);

-- 4. Backend enforcement of blocking
CREATE OR REPLACE FUNCTION public.is_blocked_between(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users b
    WHERE (b.blocker_user_id = _a AND b.blocked_user_id = _b)
       OR (b.blocker_user_id = _b AND b.blocked_user_id = _a)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_blocked_between(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_blocked_between(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.conversation_has_block(_conversation_id uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members m
    WHERE m.conversation_id = _conversation_id
      AND m.user_id <> _uid
      AND public.is_blocked_between(_uid, m.user_id)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.conversation_has_block(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.conversation_has_block(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS msg_block_guard ON public.messages;
CREATE POLICY msg_block_guard ON public.messages AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.conversation_has_block(conversation_id, auth.uid()));

DROP POLICY IF EXISTS listings_block_guard ON public.listings;
CREATE POLICY listings_block_guard ON public.listings AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), seller_user_id));

DROP POLICY IF EXISTS events_block_guard ON public.campus_events;
CREATE POLICY events_block_guard ON public.campus_events AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), creator_user_id));

DROP POLICY IF EXISTS drops_block_guard ON public.drops;
CREATE POLICY drops_block_guard ON public.drops AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), seller_user_id));

DROP POLICY IF EXISTS reviews_block_guard ON public.reviews;
CREATE POLICY reviews_block_guard ON public.reviews AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), reviewer_user_id));

DROP POLICY IF EXISTS comments_block_guard ON public.event_comments;
CREATE POLICY comments_block_guard ON public.event_comments AS RESTRICTIVE FOR SELECT TO authenticated
  USING (auth.uid() IS NULL OR NOT public.is_blocked_between(auth.uid(), user_id));