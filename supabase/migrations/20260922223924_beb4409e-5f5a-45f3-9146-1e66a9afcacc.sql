CREATE TABLE public.campus_post_likes (
  post_id uuid NOT NULL REFERENCES public.campus_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

GRANT SELECT ON public.campus_post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.campus_post_likes TO authenticated;
GRANT ALL ON public.campus_post_likes TO service_role;

ALTER TABLE public.campus_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON public.campus_post_likes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Students like as themselves"
  ON public.campus_post_likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students remove their own like"
  ON public.campus_post_likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());