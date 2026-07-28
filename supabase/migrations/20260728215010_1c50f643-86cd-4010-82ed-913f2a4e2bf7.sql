-- Realtime for notifications inbox
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper: mark read
CREATE OR REPLACE FUNCTION public.mark_notification_read(_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.notifications SET read_at = COALESCE(read_at, now())
   WHERE id = _id AND user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c int;
BEGIN
  UPDATE public.notifications SET read_at = now()
   WHERE user_id = auth.uid() AND read_at IS NULL;
  GET DIAGNOSTICS c = ROW_COUNT;
  RETURN c;
END $$;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;

-- New message → notify other conversation members
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(user_id, kind, payload)
  SELECT cm.user_id, 'message.new',
         jsonb_build_object(
           'conversation_id', NEW.conversation_id,
           'message_id', NEW.id,
           'sender_user_id', NEW.sender_user_id,
           'preview', left(NEW.body, 140)
         )
    FROM public.conversation_members cm
   WHERE cm.conversation_id = NEW.conversation_id
     AND cm.user_id <> NEW.sender_user_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS messages_notify_trg ON public.messages;
CREATE TRIGGER messages_notify_trg AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- Order status change → notify buyer + seller (skip the actor)
CREATE OR REPLACE FUNCTION public.notify_order_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_kind text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'cancelled' THEN v_kind := 'order.cancelled';
    ELSIF NEW.status = 'completed' THEN v_kind := 'order.completed';
    ELSIF NEW.status = 'accepted' THEN v_kind := 'order.accepted';
    ELSIF NEW.status = 'declined' THEN v_kind := 'order.declined';
    ELSE v_kind := 'order.status';
    END IF;

    INSERT INTO public.notifications(user_id, kind, payload)
    SELECT uid, v_kind,
           jsonb_build_object('order_id', NEW.id, 'status', NEW.status,
                              'reason', NEW.cancel_reason)
      FROM unnest(ARRAY[NEW.buyer_user_id, NEW.seller_user_id]) AS uid
     WHERE uid IS NOT NULL AND uid <> COALESCE(v_actor, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     AND NEW.payment_status = 'refunded' THEN
    INSERT INTO public.notifications(user_id, kind, payload)
    SELECT uid, 'order.refunded',
           jsonb_build_object('order_id', NEW.id, 'refunded_at', NEW.refunded_at)
      FROM unnest(ARRAY[NEW.buyer_user_id, NEW.seller_user_id]) AS uid
     WHERE uid IS NOT NULL AND uid <> COALESCE(v_actor, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS orders_notify_status_trg ON public.orders;
CREATE TRIGGER orders_notify_status_trg AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status();

-- Listing moderation change → notify seller
CREATE OR REPLACE FUNCTION public.notify_listing_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     AND NEW.moderation_status IN ('approved','rejected','removed') THEN
    INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (NEW.seller_user_id, 'listing.' || NEW.moderation_status,
            jsonb_build_object('listing_id', NEW.id, 'title', NEW.title,
                               'status', NEW.moderation_status));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS listings_notify_moderation_trg ON public.listings;
CREATE TRIGGER listings_notify_moderation_trg AFTER UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.notify_listing_moderation();

-- New verified review → notify subject
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.subject_user_id IS NOT NULL AND NEW.subject_user_id <> NEW.reviewer_user_id THEN
    INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (NEW.subject_user_id, 'review.new',
            jsonb_build_object('review_id', NEW.id, 'order_id', NEW.order_id,
                               'rating', NEW.rating));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS reviews_notify_trg ON public.reviews;
CREATE TRIGGER reviews_notify_trg AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_review();

-- Report status change → notify reporter
CREATE OR REPLACE FUNCTION public.notify_report_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (NEW.reporter_user_id, 'report.update',
            jsonb_build_object('report_id', NEW.id, 'status', NEW.status,
                               'target_type', NEW.target_type));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS reports_notify_trg ON public.reports;
CREATE TRIGGER reports_notify_trg AFTER UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_report_update();

-- Dispute opened / updated → notify buyer + seller (skip actor)
CREATE OR REPLACE FUNCTION public.notify_dispute_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_buyer uuid; v_seller uuid; v_kind text;
BEGIN
  SELECT buyer_user_id, seller_user_id INTO v_buyer, v_seller
    FROM public.orders WHERE id = NEW.order_id;

  IF TG_OP = 'INSERT' THEN
    v_kind := 'dispute.new';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_kind := 'dispute.update';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications(user_id, kind, payload)
  SELECT uid, v_kind,
         jsonb_build_object('dispute_id', NEW.id, 'order_id', NEW.order_id,
                            'status', NEW.status, 'reason', NEW.reason)
    FROM unnest(ARRAY[v_buyer, v_seller]) AS uid
   WHERE uid IS NOT NULL AND uid <> COALESCE(v_actor, '00000000-0000-0000-0000-000000000000'::uuid);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS disputes_notify_trg ON public.disputes;
CREATE TRIGGER disputes_notify_trg AFTER INSERT OR UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.notify_dispute_change();

-- Profile: verification confirmed
CREATE OR REPLACE FUNCTION public.notify_profile_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     AND NEW.verification_status = 'verified' THEN
    INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (NEW.id, 'verify.confirmed',
            jsonb_build_object('school_name', NEW.school_name));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_notify_trg ON public.profiles;
CREATE TRIGGER profiles_notify_trg AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_profile_change();

-- Business onboarding complete → seller.completed
CREATE OR REPLACE FUNCTION public.notify_business_onboarding()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.onboarding_step IS DISTINCT FROM OLD.onboarding_step
     AND NEW.onboarding_step >= 5 AND COALESCE(OLD.onboarding_step,0) < 5 THEN
    INSERT INTO public.notifications(user_id, kind, payload)
    VALUES (NEW.owner_user_id, 'seller.completed',
            jsonb_build_object('business_id', NEW.id, 'name', NEW.name));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS businesses_notify_trg ON public.businesses;
CREATE TRIGGER businesses_notify_trg AFTER UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.notify_business_onboarding();