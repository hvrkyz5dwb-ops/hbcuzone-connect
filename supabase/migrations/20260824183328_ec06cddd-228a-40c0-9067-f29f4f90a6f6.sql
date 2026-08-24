DROP POLICY IF EXISTS "rsvps readable" ON public.event_rsvps;
CREATE POLICY "rsvps readable" ON public.event_rsvps FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.campus_events e WHERE e.id = event_rsvps.event_id AND e.creator_user_id = auth.uid())
);