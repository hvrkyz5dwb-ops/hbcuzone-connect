DROP POLICY IF EXISTS "pins_public_read_active" ON public.campus_live_pins;

CREATE POLICY "pins_read_active_authenticated"
ON public.campus_live_pins
FOR SELECT
TO authenticated
USING (
  status = 'active'
  AND moderation_status = 'approved'
  AND expires_at > now()
);

REVOKE SELECT ON public.campus_live_pins FROM anon;