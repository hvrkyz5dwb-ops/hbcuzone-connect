-- Keep reviewer accounts scoped to the real review campus and remove the
-- known fictional marketplace/event rows. Real inventory must come from real
-- verified Talladega students through the normal seller flows.
DO $$
DECLARE
  talladega_id uuid;
BEGIN
  SELECT id
    INTO talladega_id
    FROM public.schools
   WHERE lower(name) = lower('Talladega College')
   LIMIT 1;

  IF talladega_id IS NULL THEN
    RAISE EXCEPTION 'Talladega College must exist before Build 17 reviewer setup';
  END IF;

  UPDATE public.profiles AS p
     SET school_id = talladega_id,
         school_name = 'Talladega College',
         school_domain = 'talladega.edu',
         verification_status = 'verified'
   WHERE lower(coalesce(p.email, '')) IN (
     'appreview@plugudemo.com',
     'appreview@plugu.app'
   );
END $$;

CREATE OR REPLACE FUNCTION public.is_hbcu_member(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.profiles p
      LEFT JOIN auth.users u ON u.id = p.id
     WHERE p.id = _uid
       AND p.verification_status = 'verified'
      AND (p.is_hbcu_student OR lower(u.email) IN ('appreview@plugudemo.com', 'appreview@plugu.app'))
  ) OR public.has_role(_uid, 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.is_hbcu_member(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_hbcu_member(uuid) TO authenticated;

DELETE FROM public.listings
 WHERE id IN (
   '11111111-2222-4333-8444-5555555500c1',
   '11111111-2222-4333-8444-5555555500c2',
   '11111111-2222-4333-8444-5555555500c3',
   '11111111-2222-4333-8444-5555555500d1',
   '11111111-2222-4333-8444-5555555500d2',
   '11111111-2222-4333-8444-5555555500d3'
 )
   AND description LIKE 'Sample listing.%';

DELETE FROM public.campus_events
 WHERE id IN (
   '11111111-2222-4333-8444-5555555500e1',
   '11111111-2222-4333-8444-5555555500e2',
   '11111111-2222-4333-8444-5555555500e3'
 )
   AND description LIKE 'Sample event.%';