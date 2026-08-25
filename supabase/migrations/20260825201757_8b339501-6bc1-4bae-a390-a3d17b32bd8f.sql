DROP POLICY IF EXISTS orders_participant_update ON public.orders;
DROP POLICY IF EXISTS bookings_participant_update ON public.bookings;
REVOKE UPDATE ON public.orders FROM authenticated;
REVOKE UPDATE ON public.bookings FROM authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.bookings TO service_role;