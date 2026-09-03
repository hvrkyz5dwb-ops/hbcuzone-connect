UPDATE public.listings l
SET school_id = p.school_id, campus_name = p.school_name, updated_at = now()
FROM public.profiles p
WHERE p.id = l.seller_user_id
  AND p.email IN ('demo.maya@plugudemo.com','demo.andre@plugudemo.com');