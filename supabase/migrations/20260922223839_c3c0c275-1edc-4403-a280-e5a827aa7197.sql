CREATE TABLE public.campus_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  school_name text,
  body text NOT NULL,
  visibility text NOT NULL DEFAULT 'campus' CHECK (visibility IN ('campus','public')),
  tag text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campus_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.campus_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campus_posts_school_idx ON public.campus_posts (school_id, created_at DESC);
CREATE INDEX campus_post_comments_post_idx ON public.campus_post_comments (post_id, created_at);

GRANT SELECT ON public.campus_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_posts TO authenticated;
GRANT ALL ON public.campus_posts TO service_role;

GRANT SELECT ON public.campus_post_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_post_comments TO authenticated;
GRANT ALL ON public.campus_post_comments TO service_role;

ALTER TABLE public.campus_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts are readable by anyone"
  ON public.campus_posts FOR SELECT TO anon
  USING (status = 'active' AND visibility = 'public');

CREATE POLICY "Signed-in students read active posts"
  ON public.campus_posts FOR SELECT TO authenticated
  USING (status = 'active');

CREATE POLICY "Students create their own posts"
  ON public.campus_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors update their own posts"
  ON public.campus_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors delete their own posts"
  ON public.campus_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Comments on public posts are readable by anyone"
  ON public.campus_post_comments FOR SELECT TO anon
  USING (status = 'active' AND EXISTS (
    SELECT 1 FROM public.campus_posts p
    WHERE p.id = post_id AND p.status = 'active' AND p.visibility = 'public'
  ));

CREATE POLICY "Signed-in students read active comments"
  ON public.campus_post_comments FOR SELECT TO authenticated
  USING (status = 'active');

CREATE POLICY "Students create their own comments"
  ON public.campus_post_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors update their own comments"
  ON public.campus_post_comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors delete their own comments"
  ON public.campus_post_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid());