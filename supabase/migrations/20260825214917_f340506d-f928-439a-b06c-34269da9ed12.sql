CREATE OR REPLACE FUNCTION public.guard_report_moderation_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.status := OLD.status;
  NEW.moderation_note := OLD.moderation_note;
  NEW.resolved_at := OLD.resolved_at;
  NEW.resolved_by := OLD.resolved_by;
  NEW.reporter_user_id := OLD.reporter_user_id;
  NEW.target_type := OLD.target_type;
  NEW.target_id := OLD.target_id;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_report_moderation_fields ON public.reports;
CREATE TRIGGER guard_report_moderation_fields
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.guard_report_moderation_fields();