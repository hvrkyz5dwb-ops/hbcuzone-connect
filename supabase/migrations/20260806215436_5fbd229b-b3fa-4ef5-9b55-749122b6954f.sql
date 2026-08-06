-- A) SECURITY DEFINER functions: strip anonymous/public EXECUTE, re-grant only what the app needs
DO $$
DECLARE f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true AND p.prokind = 'f'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM public, anon', f.oid::regprocedure);
  END LOOP;
END $$;

DO $$
DECLARE f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true AND p.prokind = 'f'
      AND p.proname IN (
        'admin_user_directory', 'featured_promotions',
        'is_conversation_member', 'is_suspended',
        'mark_notification_read', 'mark_all_notifications_read',
        'seller_plan_ranks', 'validate_promo_code'
      )
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.oid::regprocedure);
  END LOOP;
END $$;

-- B) Enforce the RSVP "visible to friends" privacy flag
DROP POLICY IF EXISTS "rsvps readable" ON public.event_rsvps;
CREATE POLICY "rsvps readable" ON public.event_rsvps
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR visible_to_friends
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.campus_events e
      WHERE e.id = event_rsvps.event_id
        AND e.creator_user_id = auth.uid()
    )
  );

-- C) Column-restrict profiles: hide email and suspension internals from other users
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (
  id, username, display_name, full_name, avatar_url, bio,
  school_id, school_name, school_domain, year, graduation_year, status, major,
  is_hbcu_student, verification_status, is_suspended,
  rating_avg, rating_count, completed_transactions,
  onboarding_completed_at, terms_accepted_at, created_at, updated_at
) ON public.profiles TO authenticated;

-- D) Reviews: require sign-in to read
DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
CREATE POLICY reviews_read_authenticated ON public.reviews
  FOR SELECT TO authenticated
  USING (true);
REVOKE SELECT ON public.reviews FROM anon;
REVOKE SELECT ON public.reviews_verified FROM anon;

NOTIFY pgrst, 'reload schema';