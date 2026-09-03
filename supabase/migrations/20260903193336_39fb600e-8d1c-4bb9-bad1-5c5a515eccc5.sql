CREATE OR REPLACE FUNCTION public.admin_perform(_action text, _target_type text, _target_id uuid, _note text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF NOT public.has_role(v_me, 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;

  IF _action = 'listing.approve' THEN
    UPDATE public.listings SET moderation_status='approved', status='active', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'listing.reject' THEN
    UPDATE public.listings SET moderation_status='rejected', status='paused', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'listing.remove' THEN
    UPDATE public.listings SET moderation_status='rejected', status='removed', updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'user.suspend' THEN
    UPDATE public.profiles SET is_suspended=true, suspended_reason=_note, suspended_at=now(), updated_at=now() WHERE id=_target_id;
    UPDATE public.listings SET status='paused', updated_at=now() WHERE seller_user_id=_target_id AND status='active';
  ELSIF _action = 'user.restore' THEN
    UPDATE public.profiles SET is_suspended=false, suspended_reason=NULL, suspended_at=NULL, updated_at=now() WHERE id=_target_id;
  ELSIF _action = 'report.review' THEN
    UPDATE public.reports SET status='reviewing', moderation_note=NULLIF(_note,''), updated_at=now() WHERE id=_target_id;
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
END $function$;

-- Safe demo content so App Review can exercise Report + Block on real records.
DO $seed$
DECLARE
  v_school uuid;
  v_a uuid := '11111111-2222-4333-8444-555555550001';
  v_b uuid := '11111111-2222-4333-8444-555555550002';
BEGIN
  SELECT id INTO v_school FROM public.schools WHERE domain = 'howard.edu' LIMIT 1;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', v_a, 'authenticated', 'authenticated',
     'demo.maya@plugudemo.com', crypt('PlugUDemo2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Maya Brooks"}'::jsonb, now(), now()),
    ('00000000-0000-0000-0000-000000000000', v_b, 'authenticated', 'authenticated',
     'demo.andre@plugudemo.com', crypt('PlugUDemo2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Andre Willis"}'::jsonb, now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name, display_name, username, school_name, school_domain, school_id, verification_status, status, account_type, bio, onboarding_completed_at, terms_accepted_at, is_hbcu_student)
  VALUES
    (v_a, 'demo.maya@plugudemo.com', 'Maya Brooks', 'Maya Brooks', 'mayabrooks', 'Howard University', 'howard.edu', v_school, 'verified', 'student', 'student', 'Braids, twists and silk press on the yard.', now(), now(), true),
    (v_b, 'demo.andre@plugudemo.com', 'Andre Willis', 'Andre Willis', 'andrewillis', 'Howard University', 'howard.edu', v_school, 'verified', 'student', 'student', 'Campus photographer and thrift reseller.', now(), now(), true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.listings (id, seller_user_id, school_id, title, description, category, kind, price_cents, price_type, campus_name, fulfillment, status, moderation_status)
  VALUES
    ('11111111-2222-4333-8444-5555555500a1', v_a, v_school, 'Knotless Braids — Student Rate', 'Knotless braids done in my dorm lounge. Hair not included. About 4 hours.', 'hair', 'service', 8500, 'fixed', 'Howard University', ARRAY['meetup'], 'active', 'approved'),
    ('11111111-2222-4333-8444-5555555500a2', v_a, v_school, 'Silk Press + Trim', 'Wash, silk press and light trim. Book a slot between classes.', 'hair', 'service', 5500, 'fixed', 'Howard University', ARRAY['meetup'], 'active', 'approved'),
    ('11111111-2222-4333-8444-5555555500b1', v_b, v_school, 'Grad Photo Mini Session', '30 minute campus photo session, 15 edited photos delivered in 3 days.', 'photo', 'service', 12000, 'fixed', 'Howard University', ARRAY['meetup'], 'active', 'approved'),
    ('11111111-2222-4333-8444-5555555500b2', v_b, v_school, 'Thrift Styling Session', 'I shop the racks with you and style two full campus fits. Meet at the Yard.', 'clothing', 'service', 4000, 'fixed', 'Howard University', ARRAY['meetup'], 'active', 'approved')
  ON CONFLICT (id) DO NOTHING;
END $seed$;