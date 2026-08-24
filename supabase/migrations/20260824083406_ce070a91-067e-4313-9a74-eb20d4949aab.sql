CREATE TABLE IF NOT EXISTS public.public_support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.public_support_messages TO service_role;

ALTER TABLE public.public_support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read public support messages" ON public.public_support_messages;
CREATE POLICY "Admins read public support messages"
  ON public.public_support_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.public_support_messages TO authenticated;