-- ============ CAMPUS EVENTS ============
CREATE TABLE public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id),
  org_id uuid,
  title text NOT NULL,
  description text,
  cover_url text,
  category text NOT NULL DEFAULT 'community',
  location text NOT NULL DEFAULT '',
  lat double precision,
  lng double precision,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  host_name text,
  contact_info text,
  status text NOT NULL DEFAULT 'active',
  cancel_reason text,
  rsvp_count integer NOT NULL DEFAULT 0,
  -- hidden monetization scaffolding (inactive until enabled)
  is_featured boolean NOT NULL DEFAULT false,
  boost_tier integer NOT NULL DEFAULT 0,
  ticketing_enabled boolean NOT NULL DEFAULT false,
  ticket_price_cents integer,
  vendor_booths_enabled boolean NOT NULL DEFAULT false,
  volunteer_recruiting boolean NOT NULL DEFAULT false,
  hiring_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_events TO authenticated;
GRANT ALL ON public.campus_events TO service_role;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events readable when active"
  ON public.campus_events FOR SELECT TO authenticated
  USING (status = 'active' OR creator_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "verified students create events"
  ON public.campus_events FOR INSERT TO authenticated
  WITH CHECK (
    creator_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_suspended = false AND p.verification_status = 'verified'
    )
  );
CREATE POLICY "creators update own events"
  ON public.campus_events FOR UPDATE TO authenticated
  USING (creator_user_id = auth.uid()) WITH CHECK (creator_user_id = auth.uid());
CREATE POLICY "admins update any event"
  ON public.campus_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "creators delete own events"
  ON public.campus_events FOR DELETE TO authenticated
  USING (creator_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX campus_events_school_start_idx ON public.campus_events (school_id, starts_at);
CREATE INDEX campus_events_status_idx ON public.campus_events (status);

-- ============ RSVPS ============
CREATE TABLE public.event_rsvps (
  event_id uuid NOT NULL REFERENCES public.campus_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visible_to_friends boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvps readable" ON public.event_rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "own rsvp insert" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own rsvp update" ON public.event_rsvps FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own rsvp delete" ON public.event_rsvps FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_event_rsvp_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.campus_events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.campus_events SET rsvp_count = GREATEST(rsvp_count - 1, 0) WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER event_rsvps_count AFTER INSERT OR DELETE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.sync_event_rsvp_count();

-- ============ COMMENTS ============
CREATE TABLE public.event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.campus_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_comments TO authenticated;
GRANT ALL ON public.event_comments TO service_role;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments readable" ON public.event_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "own comment insert" ON public.event_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own comment delete" ON public.event_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ RECAP PHOTOS ============
CREATE TABLE public.event_recaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.campus_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.event_recaps TO authenticated;
GRANT ALL ON public.event_recaps TO service_role;
ALTER TABLE public.event_recaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recaps readable" ON public.event_recaps FOR SELECT TO authenticated USING (true);
CREATE POLICY "own recap insert" ON public.event_recaps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own recap delete" ON public.event_recaps FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ STUDENT ORGANIZATIONS ============
CREATE TABLE public.student_orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'org',
  bio text,
  avatar_url text,
  contact_email text,
  instagram text,
  is_verified boolean NOT NULL DEFAULT false,
  follower_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_orgs TO authenticated;
GRANT ALL ON public.student_orgs TO service_role;
ALTER TABLE public.student_orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs readable" ON public.student_orgs FOR SELECT TO authenticated USING (true);
CREATE POLICY "create own org" ON public.student_orgs FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "owner or admin updates org" ON public.student_orgs FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owner or admin deletes org" ON public.student_orgs FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.campus_events
  ADD CONSTRAINT campus_events_org_fk FOREIGN KEY (org_id) REFERENCES public.student_orgs(id) ON DELETE SET NULL;

CREATE TABLE public.org_follows (
  org_id uuid NOT NULL REFERENCES public.student_orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.org_follows TO authenticated;
GRANT ALL ON public.org_follows TO service_role;
ALTER TABLE public.org_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows readable" ON public.org_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "own follow insert" ON public.org_follows FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own follow delete" ON public.org_follows FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_org_follower_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.student_orgs SET follower_count = follower_count + 1 WHERE id = NEW.org_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.student_orgs SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.org_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER org_follows_count AFTER INSERT OR DELETE ON public.org_follows
FOR EACH ROW EXECUTE FUNCTION public.sync_org_follower_count();

CREATE TABLE public.org_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.student_orgs(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.org_announcements TO authenticated;
GRANT ALL ON public.org_announcements TO service_role;
ALTER TABLE public.org_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements readable" ON public.org_announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "org owner posts announcement" ON public.org_announcements FOR INSERT TO authenticated
  WITH CHECK (author_user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.student_orgs o WHERE o.id = org_id AND o.owner_user_id = auth.uid()
  ));
CREATE POLICY "org owner deletes announcement" ON public.org_announcements FOR DELETE TO authenticated
  USING (author_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER campus_events_updated_at BEFORE UPDATE ON public.campus_events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER student_orgs_updated_at BEFORE UPDATE ON public.student_orgs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- realtime for live RSVP updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;