ALTER TABLE public.reports DROP CONSTRAINT reports_target_type_chk;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_chk
  CHECK (target_type = ANY (ARRAY['user','listing','message','review','order','business','event']));