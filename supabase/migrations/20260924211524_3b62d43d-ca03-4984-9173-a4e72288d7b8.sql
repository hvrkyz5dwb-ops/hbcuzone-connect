CREATE OR REPLACE FUNCTION public.is_hbcu_member(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.id = _uid AND p.verification_status = 'verified'
      AND (p.is_hbcu_student OR lower(u.email) IN ('appreview@plugu.app','appreview@plugudemo.com'))
  ) OR public.has_role(_uid, 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.is_hbcu_member(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_hbcu_member(uuid) TO authenticated;

DROP POLICY np_read ON public.network_profiles;
DROP POLICY np_ins ON public.network_profiles;
DROP POLICY np_upd ON public.network_profiles;
CREATE POLICY np_read ON public.network_profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR (is_discoverable AND public.is_hbcu_member(auth.uid())));
CREATE POLICY np_ins ON public.network_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_hbcu_member(auth.uid()));
CREATE POLICY np_upd ON public.network_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.is_hbcu_member(auth.uid()));

DROP POLICY cm_read ON public.circle_memberships;
DROP POLICY cm_ins ON public.circle_memberships;
CREATE POLICY cm_read ON public.circle_memberships FOR SELECT TO authenticated USING (public.is_hbcu_member(auth.uid()));
CREATE POLICY cm_ins ON public.circle_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_hbcu_member(auth.uid()));

DROP POLICY cp_read ON public.circle_posts;
DROP POLICY cp_ins ON public.circle_posts;
CREATE POLICY cp_read ON public.circle_posts FOR SELECT TO authenticated USING (public.is_hbcu_member(auth.uid()));
CREATE POLICY cp_ins ON public.circle_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND public.is_hbcu_member(auth.uid()));

DROP POLICY cr_read ON public.collab_requests;
DROP POLICY cr_ins ON public.collab_requests;
CREATE POLICY cr_read ON public.collab_requests FOR SELECT TO authenticated USING (author_id = auth.uid() OR public.is_hbcu_member(auth.uid()));
CREATE POLICY cr_ins ON public.collab_requests FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND public.is_hbcu_member(auth.uid()));

DROP POLICY crs_ins ON public.collab_responses;
CREATE POLICY crs_ins ON public.collab_responses FOR INSERT TO authenticated WITH CHECK (
  responder_id = auth.uid() AND public.is_hbcu_member(auth.uid())
  AND EXISTS (SELECT 1 FROM public.collab_requests r WHERE r.id = request_id AND r.status = 'open' AND r.author_id <> auth.uid()));

DROP POLICY cn_ins ON public.connections;
CREATE POLICY cn_ins ON public.connections FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() AND status = 'pending' AND public.is_hbcu_member(auth.uid()));