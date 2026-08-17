
-- 1) public_profiles view runs as the querying user
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Allow signed-in users to read non-suspended profile rows.
-- Column-level grants already exclude email, so no PII is exposed.
DROP POLICY IF EXISTS profiles_public_read_authenticated ON public.profiles;
CREATE POLICY profiles_public_read_authenticated
ON public.profiles FOR SELECT TO authenticated
USING (COALESCE(is_suspended, false) = false);

-- 2) boosts: only the listing owner or an admin can read boost spend
DROP POLICY IF EXISTS boosts_read_authenticated ON public.boosts;
CREATE POLICY boosts_read_owner_or_admin
ON public.boosts FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = boosts.listing_id AND l.seller_user_id = auth.uid()
  )
);
