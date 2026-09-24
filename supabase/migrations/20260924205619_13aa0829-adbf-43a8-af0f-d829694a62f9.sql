CREATE TABLE public.network_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interests text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  portfolio_url text CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://'),
  goals text CHECK (char_length(goals) <= 500),
  is_discoverable boolean NOT NULL DEFAULT false,
  show_major boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.network_profiles TO authenticated;
GRANT ALL ON public.network_profiles TO service_role;
ALTER TABLE public.network_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY np_read ON public.network_profiles FOR SELECT TO authenticated USING (is_discoverable OR user_id = auth.uid());
CREATE POLICY np_ins ON public.network_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY np_upd ON public.network_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY np_del ON public.network_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.circle_memberships (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle text NOT NULL CHECK (char_length(circle) <= 40),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, circle)
);
GRANT SELECT, INSERT, DELETE ON public.circle_memberships TO authenticated;
GRANT ALL ON public.circle_memberships TO service_role;
ALTER TABLE public.circle_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY cm_read ON public.circle_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY cm_ins ON public.circle_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY cm_del ON public.circle_memberships FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.circle_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle text NOT NULL CHECK (char_length(circle) <= 40),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'discussion' CHECK (kind IN ('discussion','project','resource')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  link_url text CHECK (link_url IS NULL OR link_url ~* '^https?://'),
  school_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX circle_posts_circle_idx ON public.circle_posts (circle, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circle_posts TO authenticated;
GRANT ALL ON public.circle_posts TO service_role;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cp_read ON public.circle_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY cp_ins ON public.circle_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY cp_upd ON public.circle_posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY cp_del ON public.circle_posts FOR DELETE TO authenticated USING (author_id = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE TABLE public.collab_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle text,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 3000),
  skills text[] NOT NULL DEFAULT '{}',
  location text,
  mode text NOT NULL CHECK (mode IN ('remote','in_person','hybrid')),
  timeline text,
  compensation text NOT NULL CHECK (compensation IN ('paid','unpaid','stipend','revenue_share','negotiable')),
  compensation_note text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collab_requests TO authenticated;
GRANT ALL ON public.collab_requests TO service_role;
ALTER TABLE public.collab_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY cr_read ON public.collab_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY cr_ins ON public.collab_requests FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY cr_upd ON public.collab_requests FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY cr_del ON public.collab_requests FOR DELETE TO authenticated USING (author_id = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE TABLE public.collab_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.collab_requests(id) ON DELETE CASCADE,
  responder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, responder_id)
);
GRANT SELECT, INSERT, DELETE ON public.collab_responses TO authenticated;
GRANT ALL ON public.collab_responses TO service_role;
ALTER TABLE public.collab_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY crs_read ON public.collab_responses FOR SELECT TO authenticated USING (
  responder_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collab_requests r WHERE r.id = request_id AND r.author_id = auth.uid()));
CREATE POLICY crs_ins ON public.collab_responses FOR INSERT TO authenticated WITH CHECK (
  responder_id = auth.uid() AND EXISTS (SELECT 1 FROM public.collab_requests r WHERE r.id = request_id AND r.status = 'open' AND r.author_id <> auth.uid()));
CREATE POLICY crs_del ON public.collab_responses FOR DELETE TO authenticated USING (responder_id = auth.uid());

CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id),
  UNIQUE (requester_id, addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY cn_read ON public.connections FOR SELECT TO authenticated USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY cn_ins ON public.connections FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() AND status = 'pending');
CREATE POLICY cn_upd ON public.connections FOR UPDATE TO authenticated USING (addressee_id = auth.uid()) WITH CHECK (addressee_id = auth.uid());
CREATE POLICY cn_del ON public.connections FOR DELETE TO authenticated USING (auth.uid() IN (requester_id, addressee_id));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER t_np BEFORE UPDATE ON public.network_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_cp BEFORE UPDATE ON public.circle_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_cr BEFORE UPDATE ON public.collab_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_cn BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.reports DROP CONSTRAINT reports_target_type_chk;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_chk CHECK (target_type = ANY (ARRAY['user','listing','message','review','order','business','event','post','comment','opportunity','local_business','circle_post','collab_request']));