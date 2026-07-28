-- 1. last_read_at for per-member unread tracking
ALTER TABLE public.conversation_members
  ADD COLUMN IF NOT EXISTS last_read_at timestamptz NOT NULL DEFAULT now();

-- Allow members to update their own row (currently no UPDATE policy exists)
DROP POLICY IF EXISTS cm_self_update ON public.conversation_members;
CREATE POLICY cm_self_update ON public.conversation_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Block + spam guard on message insert
CREATE OR REPLACE FUNCTION public.messages_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent int;
  v_blocked boolean;
BEGIN
  -- Empty body guard (defence in depth; client also trims)
  IF NEW.body IS NULL OR length(btrim(NEW.body)) = 0 THEN
    RAISE EXCEPTION 'Message body cannot be empty';
  END IF;

  -- Rate limit: max 20 messages / 10 seconds per sender
  SELECT count(*) INTO v_recent
  FROM public.messages
  WHERE sender_user_id = NEW.sender_user_id
    AND created_at > now() - interval '10 seconds';
  IF v_recent >= 20 THEN
    RAISE EXCEPTION 'Slow down — you are sending messages too fast';
  END IF;

  -- Block check: reject if sender is blocked by any other conversation member,
  -- or sender has blocked any other member.
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members cm
    JOIN public.blocked_users bu
      ON (bu.blocker_user_id = cm.user_id AND bu.blocked_user_id = NEW.sender_user_id)
      OR (bu.blocker_user_id = NEW.sender_user_id AND bu.blocked_user_id = cm.user_id)
    WHERE cm.conversation_id = NEW.conversation_id
      AND cm.user_id <> NEW.sender_user_id
  ) INTO v_blocked;
  IF v_blocked THEN
    RAISE EXCEPTION 'Messaging is disabled between you and this user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_guard_trg ON public.messages;
CREATE TRIGGER messages_guard_trg
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.messages_guard();

-- 3. Bump conversation activity on new message (used for inbox sorting)
CREATE OR REPLACE FUNCTION public.messages_bump_conversation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
    SET updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS messages_bump_conv_trg ON public.messages;
CREATE TRIGGER messages_bump_conv_trg
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.messages_bump_conversation();

-- 4. Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_members REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_members'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members';
  END IF;
END $$;