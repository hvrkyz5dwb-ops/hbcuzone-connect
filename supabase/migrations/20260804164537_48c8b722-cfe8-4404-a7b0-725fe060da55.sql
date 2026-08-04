-- 1) Hide email from blanket authenticated reads via column-level privileges
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, full_name, display_name, username, avatar_url, bio, school_name, school_domain, school_id, year, major, graduation_year, status, is_hbcu_student, verification_status, is_suspended, completed_transactions, rating_avg, rating_count, onboarding_completed_at, terms_accepted_at, created_at, updated_at)
  ON public.profiles TO authenticated;

-- Admin-only directory that includes email (definer + has_role gate)
CREATE OR REPLACE FUNCTION public.admin_user_directory()
RETURNS TABLE(id uuid, email text, username text, display_name text, school_name text, is_suspended boolean, verification_status text, rating_avg numeric, rating_count integer, completed_transactions integer, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.username, p.display_name, p.school_name, p.is_suspended, p.verification_status, p.rating_avg, p.rating_count, p.completed_transactions, p.created_at
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.admin_user_directory() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_user_directory() TO authenticated;

-- 2) Booking slots: authenticated students only, not the public internet
DROP POLICY IF EXISTS "slots public read" ON public.service_availability_slots;
CREATE POLICY "slots authenticated read" ON public.service_availability_slots
  FOR SELECT TO authenticated USING (true);

-- 3) SECURITY DEFINER surface: nothing here is ever called by anonymous visitors
REVOKE EXECUTE ON FUNCTION public.admin_perform(text, text, uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_booking_secure(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_order_secure(uuid, integer, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.transition_booking_status(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.transition_order_status(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_suspended(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_all_notifications_read() FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_notification_read(uuid) FROM anon;

-- Trigger-only internals: nobody calls these through the API
REVOKE EXECUTE ON FUNCTION public.bookings_write_status_history() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.messages_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_business_onboarding() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_dispute_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_listing_moderation() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_review() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_order_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_profile_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_report_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.order_items_guard_financials() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.orders_guard_financials() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.orders_write_status_history() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.profiles_guard_protected_columns() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reviews_recompute_subject_rating() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_event_rsvp_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_org_follower_count() FROM anon, authenticated;