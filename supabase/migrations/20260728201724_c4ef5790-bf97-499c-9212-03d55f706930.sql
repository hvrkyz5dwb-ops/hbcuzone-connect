-- profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS graduation_year integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS completed_transactions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('student','alumni'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (lower(username)) WHERE username IS NOT NULL;

-- Update guard to also protect username/rating fields from tampering by non-admins
CREATE OR REPLACE FUNCTION public.profiles_guard_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.school_id := OLD.school_id;
  NEW.school_name := OLD.school_name;
  NEW.school_domain := OLD.school_domain;
  NEW.is_hbcu_student := OLD.is_hbcu_student;
  NEW.verification_status := OLD.verification_status;
  NEW.is_suspended := OLD.is_suspended;
  NEW.suspended_reason := OLD.suspended_reason;
  NEW.suspended_at := OLD.suspended_at;
  NEW.completed_transactions := OLD.completed_transactions;
  NEW.rating_avg := OLD.rating_avg;
  NEW.rating_count := OLD.rating_count;
  RETURN NEW;
END;
$$;

-- businesses additions
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS campus_name text,
  ADD COLUMN IF NOT EXISTS fulfillment text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS contact_method text NOT NULL DEFAULT 'plugu_dm',
  ADD COLUMN IF NOT EXISTS rules_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 0;

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_onboarding_step_check;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_onboarding_step_check
  CHECK (onboarding_step BETWEEN 0 AND 5);

-- Draft businesses (is_active=false) still owned by the creator; existing owner policies already allow read/update/delete.
-- Ensure only one business per owner during onboarding phase.
CREATE UNIQUE INDEX IF NOT EXISTS businesses_owner_slug_key
  ON public.businesses (owner_user_id, slug);

-- Public-safe profile view (no email, no suspension reason).
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT
  id,
  username,
  COALESCE(display_name, full_name) AS display_name,
  school_name,
  graduation_year,
  year,
  major,
  status,
  bio,
  avatar_url,
  is_hbcu_student,
  verification_status,
  completed_transactions,
  rating_avg,
  rating_count,
  created_at
FROM public.profiles
WHERE COALESCE(is_suspended, false) = false;

-- Grant read on the view to signed-in students only (matches profiles self-read spirit).
GRANT SELECT ON public.public_profiles TO authenticated;

-- Allow authenticated users to read any non-suspended profile row via the view.
-- The view is security_invoker, so we need a matching SELECT policy on profiles.
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (COALESCE(is_suspended, false) = false);