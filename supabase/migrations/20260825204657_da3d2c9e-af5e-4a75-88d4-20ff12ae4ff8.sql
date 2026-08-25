DROP POLICY IF EXISTS "slots authenticated read" ON public.service_availability_slots;

CREATE POLICY "slots visible to seller, booker, or as open availability"
ON public.service_availability_slots
FOR SELECT
TO authenticated
USING (
  seller_user_id = auth.uid()
  OR (
    is_booked = false
    AND EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = service_availability_slots.listing_id
        AND l.status = 'active'
        AND l.moderation_status = 'approved'
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = service_availability_slots.booking_id
      AND (b.buyer_user_id = auth.uid() OR b.seller_user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);