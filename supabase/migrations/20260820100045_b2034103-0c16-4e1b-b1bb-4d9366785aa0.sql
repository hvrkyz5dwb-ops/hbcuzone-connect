DROP POLICY IF EXISTS "comments readable" ON public.event_comments;
CREATE POLICY "comments readable" ON public.event_comments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.campus_events e WHERE e.id = event_comments.event_id AND COALESCE(e.status,'active') NOT IN ('cancelled','removed','hidden')));

DROP POLICY IF EXISTS "recaps readable" ON public.event_recaps;
CREATE POLICY "recaps readable" ON public.event_recaps FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.campus_events e WHERE e.id = event_recaps.event_id AND COALESCE(e.status,'active') NOT IN ('cancelled','removed','hidden')));