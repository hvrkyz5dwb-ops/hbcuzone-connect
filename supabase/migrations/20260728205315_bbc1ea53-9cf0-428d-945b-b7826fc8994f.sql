
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============ ORDERS: extend ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS fulfillment_method text,
  ADD COLUMN IF NOT EXISTS subtotal_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_fee_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS meetup_location text,
  ADD COLUMN IF NOT EXISTS note text;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pending','accepted','preparing','ready_for_pickup','out_for_delivery','completed','cancelled','refunded','disputed')
);
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_kind_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_kind_check CHECK (kind IN ('product','service'));
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (
  payment_status IN ('pending','held','captured','refunded','failed')
);

-- ============ BOOKINGS: extend ============
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS buyer_user_id uuid,
  ADD COLUMN IF NOT EXISTS seller_user_id uuid,
  ADD COLUMN IF NOT EXISTS slot_start timestamptz,
  ADD COLUMN IF NOT EXISTS slot_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS decline_reason text;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (
  status IN ('pending','accepted','declined','completed','cancelled','no_show')
);

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
  listing_id WITH =,
  tstzrange(slot_start, slot_end) WITH &&
) WHERE (status IN ('pending','accepted') AND slot_start IS NOT NULL AND slot_end IS NOT NULL);

-- ============ SERVICE AVAILABILITY SLOTS ============
CREATE TABLE IF NOT EXISTS public.service_availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL,
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  booking_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (slot_end > slot_start)
);
GRANT SELECT ON public.service_availability_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_availability_slots TO authenticated;
GRANT ALL ON public.service_availability_slots TO service_role;
ALTER TABLE public.service_availability_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "slots public read" ON public.service_availability_slots;
CREATE POLICY "slots public read" ON public.service_availability_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "slots seller manage" ON public.service_availability_slots;
CREATE POLICY "slots seller manage" ON public.service_availability_slots FOR ALL
  USING (auth.uid() = seller_user_id) WITH CHECK (auth.uid() = seller_user_id);
CREATE INDEX IF NOT EXISTS slots_listing_start_idx
  ON public.service_availability_slots (listing_id, slot_start);

-- ============ STATUS HISTORY ============
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_status_history TO authenticated;
GRANT ALL ON public.order_status_history TO service_role;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "history participant read" ON public.order_status_history;
CREATE POLICY "history participant read" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o
          WHERE o.id = order_id
            AND (o.buyer_user_id = auth.uid() OR o.seller_user_id = auth.uid()))
);
CREATE INDEX IF NOT EXISTS order_hist_order_idx ON public.order_status_history (order_id, created_at);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_status_history TO authenticated;
GRANT ALL ON public.booking_status_history TO service_role;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bhistory participant read" ON public.booking_status_history;
CREATE POLICY "bhistory participant read" ON public.booking_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b
          WHERE b.id = booking_id
            AND (b.buyer_user_id = auth.uid() OR b.seller_user_id = auth.uid()))
);
CREATE INDEX IF NOT EXISTS booking_hist_bk_idx ON public.booking_status_history (booking_id, created_at);

-- ============ FINANCIAL GUARD ============
CREATE OR REPLACE FUNCTION public.orders_guard_financials()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.total_cents := OLD.total_cents;
  NEW.subtotal_cents := OLD.subtotal_cents;
  NEW.platform_fee_cents := OLD.platform_fee_cents;
  NEW.processing_fee_cents := OLD.processing_fee_cents;
  NEW.buyer_user_id := OLD.buyer_user_id;
  NEW.seller_user_id := OLD.seller_user_id;
  NEW.listing_id := OLD.listing_id;
  NEW.kind := OLD.kind;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS orders_guard_financials_trg ON public.orders;
CREATE TRIGGER orders_guard_financials_trg BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_guard_financials();

CREATE OR REPLACE FUNCTION public.order_items_guard_financials()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.unit_price_cents := OLD.unit_price_cents;
  NEW.qty := OLD.qty;
  NEW.listing_id := OLD.listing_id;
  NEW.order_id := OLD.order_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS order_items_guard_trg ON public.order_items;
CREATE TRIGGER order_items_guard_trg BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.order_items_guard_financials();

-- ============ STATUS HISTORY TRIGGERS ============
CREATE OR REPLACE FUNCTION public.orders_write_status_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.order_status_history(order_id, from_status, to_status, changed_by)
      VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history(order_id, from_status, to_status, changed_by, note)
      VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.cancel_reason);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS orders_status_history_trg ON public.orders;
CREATE TRIGGER orders_status_history_trg AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_write_status_history();

CREATE OR REPLACE FUNCTION public.bookings_write_status_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.booking_status_history(booking_id, from_status, to_status, changed_by)
      VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.booking_status_history(booking_id, from_status, to_status, changed_by, note)
      VALUES (NEW.id, OLD.status, NEW.status, auth.uid(),
              COALESCE(NEW.cancel_reason, NEW.decline_reason));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bookings_status_history_trg ON public.bookings;
CREATE TRIGGER bookings_status_history_trg AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_write_status_history();

-- ============ RPCs ============
CREATE OR REPLACE FUNCTION public.create_order_secure(
  _listing_id uuid, _qty integer, _fulfillment_method text,
  _note text, _meetup_location text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_listing public.listings;
  v_subtotal integer; v_platform integer; v_processing integer; v_total integer;
  v_order_id uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  IF _qty IS NULL OR _qty < 1 THEN _qty := 1; END IF;
  SELECT * INTO v_listing FROM public.listings WHERE id = _listing_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'listing not found'; END IF;
  IF v_listing.status <> 'active' OR v_listing.moderation_status <> 'approved' THEN
    RAISE EXCEPTION 'listing not available'; END IF;
  IF v_listing.seller_user_id = v_me THEN RAISE EXCEPTION 'cannot buy your own listing'; END IF;
  IF v_listing.kind <> 'product' THEN RAISE EXCEPTION 'use create_booking_secure for services'; END IF;

  v_subtotal := v_listing.price_cents * _qty;
  v_platform := ROUND(v_subtotal * 0.08);
  v_processing := ROUND(v_subtotal * 0.029) + 30;
  v_total := v_subtotal + v_platform + v_processing;

  INSERT INTO public.orders(
    buyer_user_id, seller_user_id, listing_id, kind, status, payment_status,
    subtotal_cents, platform_fee_cents, processing_fee_cents, total_cents,
    fulfillment_method, meetup_location, note
  ) VALUES (
    v_me, v_listing.seller_user_id, v_listing.id, 'product', 'pending', 'held',
    v_subtotal, v_platform, v_processing, v_total,
    _fulfillment_method, _meetup_location, _note
  ) RETURNING id INTO v_order_id;

  INSERT INTO public.order_items(order_id, listing_id, qty, unit_price_cents)
    VALUES (v_order_id, v_listing.id, _qty, v_listing.price_cents);

  INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (v_listing.seller_user_id, 'order.new',
            jsonb_build_object('order_id', v_order_id, 'listing_id', v_listing.id));

  RETURN v_order_id;
END $$;
GRANT EXECUTE ON FUNCTION public.create_order_secure(uuid,integer,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_booking_secure(
  _slot_id uuid, _note text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_slot public.service_availability_slots;
  v_listing public.listings;
  v_subtotal integer; v_platform integer; v_processing integer; v_total integer;
  v_order_id uuid; v_booking_id uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  SELECT * INTO v_slot FROM public.service_availability_slots WHERE id = _slot_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'slot not found'; END IF;
  IF v_slot.is_booked THEN RAISE EXCEPTION 'slot already booked'; END IF;
  SELECT * INTO v_listing FROM public.listings WHERE id = v_slot.listing_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'listing not found'; END IF;
  IF v_listing.seller_user_id = v_me THEN RAISE EXCEPTION 'cannot book your own listing'; END IF;

  v_subtotal := v_listing.price_cents;
  v_platform := ROUND(v_subtotal * 0.08);
  v_processing := ROUND(v_subtotal * 0.029) + 30;
  v_total := v_subtotal + v_platform + v_processing;

  INSERT INTO public.orders(
    buyer_user_id, seller_user_id, listing_id, kind, status, payment_status,
    subtotal_cents, platform_fee_cents, processing_fee_cents, total_cents,
    fulfillment_method
  ) VALUES (
    v_me, v_listing.seller_user_id, v_listing.id, 'service', 'pending', 'held',
    v_subtotal, v_platform, v_processing, v_total, 'appointment'
  ) RETURNING id INTO v_order_id;

  INSERT INTO public.bookings(
    order_id, listing_id, buyer_user_id, seller_user_id,
    slot_start, slot_end, scheduled_at, duration_min, status
  ) VALUES (
    v_order_id, v_listing.id, v_me, v_listing.seller_user_id,
    v_slot.slot_start, v_slot.slot_end, v_slot.slot_start,
    GREATEST(1, (EXTRACT(EPOCH FROM (v_slot.slot_end - v_slot.slot_start)) / 60)::int),
    'pending'
  ) RETURNING id INTO v_booking_id;

  UPDATE public.service_availability_slots
    SET is_booked = true, booking_id = v_booking_id
    WHERE id = v_slot.id;

  INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (v_listing.seller_user_id, 'booking.new',
            jsonb_build_object('booking_id', v_booking_id, 'order_id', v_order_id));

  RETURN v_order_id;
END $$;
GRANT EXECUTE ON FUNCTION public.create_booking_secure(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.transition_order_status(
  _order_id uuid, _next text, _note text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_o public.orders;
  v_is_seller boolean; v_is_buyer boolean; v_allowed boolean := false;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  SELECT * INTO v_o FROM public.orders WHERE id = _order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  v_is_buyer := v_o.buyer_user_id = v_me;
  v_is_seller := v_o.seller_user_id = v_me;
  IF NOT (v_is_buyer OR v_is_seller) THEN RAISE EXCEPTION 'not a participant'; END IF;

  IF v_is_seller AND (
    (v_o.status = 'pending'          AND _next IN ('accepted','cancelled')) OR
    (v_o.status = 'accepted'         AND _next IN ('preparing','cancelled')) OR
    (v_o.status = 'preparing'        AND _next IN ('ready_for_pickup','out_for_delivery','cancelled')) OR
    (v_o.status = 'ready_for_pickup' AND _next IN ('completed','cancelled')) OR
    (v_o.status = 'out_for_delivery' AND _next IN ('completed','cancelled'))
  ) THEN v_allowed := true; END IF;

  IF v_is_buyer AND (
    (v_o.status IN ('pending','accepted','preparing','ready_for_pickup','out_for_delivery') AND _next = 'disputed') OR
    (v_o.status IN ('ready_for_pickup','out_for_delivery') AND _next = 'completed') OR
    (v_o.status IN ('pending','accepted') AND _next = 'cancelled')
  ) THEN v_allowed := true; END IF;

  IF NOT v_allowed THEN RAISE EXCEPTION 'invalid transition % -> %', v_o.status, _next; END IF;

  UPDATE public.orders
    SET status = _next,
        cancel_reason = CASE WHEN _next = 'cancelled' THEN _note ELSE cancel_reason END,
        cancelled_by = CASE WHEN _next = 'cancelled' THEN v_me ELSE cancelled_by END,
        cancelled_at = CASE WHEN _next = 'cancelled' THEN now() ELSE cancelled_at END,
        payment_status = CASE WHEN _next = 'completed' THEN 'captured'
                              WHEN _next = 'cancelled' THEN 'refunded'
                              WHEN _next = 'refunded' THEN 'refunded'
                              ELSE payment_status END,
        updated_at = now()
    WHERE id = _order_id;

  INSERT INTO public.notifications(user_id, kind, payload) VALUES (
    CASE WHEN v_is_seller THEN v_o.buyer_user_id ELSE v_o.seller_user_id END,
    'order.status',
    jsonb_build_object('order_id', _order_id, 'status', _next, 'note', _note)
  );
END $$;
GRANT EXECUTE ON FUNCTION public.transition_order_status(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.transition_booking_status(
  _booking_id uuid, _next text, _reason text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_b public.bookings;
  v_is_seller boolean; v_is_buyer boolean; v_allowed boolean := false;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  SELECT * INTO v_b FROM public.bookings WHERE id = _booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'booking not found'; END IF;
  v_is_buyer := v_b.buyer_user_id = v_me;
  v_is_seller := v_b.seller_user_id = v_me;
  IF NOT (v_is_buyer OR v_is_seller) THEN RAISE EXCEPTION 'not a participant'; END IF;

  IF v_is_seller AND (
    (v_b.status = 'pending'  AND _next IN ('accepted','declined','cancelled')) OR
    (v_b.status = 'accepted' AND _next IN ('completed','no_show','cancelled'))
  ) THEN v_allowed := true; END IF;
  IF v_is_buyer AND (
    (v_b.status IN ('pending','accepted') AND _next = 'cancelled')
  ) THEN v_allowed := true; END IF;

  IF NOT v_allowed THEN RAISE EXCEPTION 'invalid booking transition % -> %', v_b.status, _next; END IF;

  UPDATE public.bookings
    SET status = _next,
        cancel_reason = CASE WHEN _next = 'cancelled' THEN _reason ELSE cancel_reason END,
        decline_reason = CASE WHEN _next = 'declined' THEN _reason ELSE decline_reason END,
        updated_at = now()
    WHERE id = _booking_id;

  IF _next IN ('cancelled','declined') THEN
    UPDATE public.service_availability_slots
      SET is_booked = false, booking_id = NULL
      WHERE booking_id = _booking_id;
  END IF;

  IF _next IN ('declined','cancelled') THEN
    UPDATE public.orders SET status = 'cancelled', payment_status = 'refunded', updated_at = now()
      WHERE id = v_b.order_id;
  ELSIF _next = 'completed' OR _next = 'no_show' THEN
    UPDATE public.orders SET status = 'completed', payment_status = 'captured', updated_at = now()
      WHERE id = v_b.order_id;
  ELSIF _next = 'accepted' THEN
    UPDATE public.orders SET status = 'accepted', updated_at = now() WHERE id = v_b.order_id;
  END IF;

  INSERT INTO public.notifications(user_id, kind, payload) VALUES (
    CASE WHEN v_is_seller THEN v_b.buyer_user_id ELSE v_b.seller_user_id END,
    'booking.status',
    jsonb_build_object('booking_id', _booking_id, 'status', _next, 'reason', _reason)
  );
END $$;
GRANT EXECUTE ON FUNCTION public.transition_booking_status(uuid,text,text) TO authenticated;

-- ============ REALTIME ============
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_status_history; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.service_availability_slots; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
