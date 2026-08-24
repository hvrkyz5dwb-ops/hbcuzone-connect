-- 1. Policy acceptance ledger
CREATE TABLE IF NOT EXISTS public.policy_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version text NOT NULL,
  terms_url text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, policy_version)
);

GRANT SELECT, INSERT ON public.policy_acceptances TO authenticated;
GRANT ALL ON public.policy_acceptances TO service_role;

ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own policy acceptances" ON public.policy_acceptances;
CREATE POLICY "Users read own policy acceptances"
  ON public.policy_acceptances FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users record own policy acceptance" ON public.policy_acceptances;
CREATE POLICY "Users record own policy acceptance"
  ON public.policy_acceptances FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Richer reports + duplicate prevention
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reported_user_id uuid;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reason_code text;

DELETE FROM public.reports a
  USING public.reports b
 WHERE a.ctid < b.ctid
   AND a.reporter_user_id = b.reporter_user_id
   AND a.target_type = b.target_type
   AND a.target_id = b.target_id;

CREATE UNIQUE INDEX IF NOT EXISTS reports_unique_per_reporter
  ON public.reports (reporter_user_id, target_type, target_id);

-- 3. Notify admins on new reports and new blocks
CREATE OR REPLACE FUNCTION public.notify_admins_of_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, payload)
  SELECT ur.user_id, 'moderation.report',
         jsonb_build_object(
           'report_id', NEW.id,
           'target_type', NEW.target_type,
           'target_id', NEW.target_id,
           'reported_user_id', NEW.reported_user_id,
           'reporter_user_id', NEW.reporter_user_id,
           'reason', NEW.reason
         )
    FROM public.user_roles ur
   WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reports_notify_admins ON public.reports;
CREATE TRIGGER reports_notify_admins
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_report();

CREATE OR REPLACE FUNCTION public.notify_admins_of_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, payload)
  SELECT ur.user_id, 'moderation.block',
         jsonb_build_object(
           'blocker_user_id', NEW.blocker_user_id,
           'blocked_user_id', NEW.blocked_user_id
         )
    FROM public.user_roles ur
   WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blocks_notify_admins ON public.blocked_users;
CREATE TRIGGER blocks_notify_admins
AFTER INSERT ON public.blocked_users
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_block();