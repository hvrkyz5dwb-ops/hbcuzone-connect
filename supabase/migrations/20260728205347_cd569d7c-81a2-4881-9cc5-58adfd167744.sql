
REVOKE EXECUTE ON FUNCTION public.create_order_secure(uuid,integer,text,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_booking_secure(uuid,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.transition_order_status(uuid,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.transition_booking_status(uuid,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.orders_guard_financials() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.order_items_guard_financials() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.orders_write_status_history() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bookings_write_status_history() FROM PUBLIC, anon, authenticated;
