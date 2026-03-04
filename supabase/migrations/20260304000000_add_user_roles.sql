-- ============================================================
-- ADD USER ROLES
-- Replaces the boolean is_admin flag with a role enum column
-- that supports member / moderator / admin levels.
-- ============================================================

-- 1. Add the new column (default every existing user to 'member')
ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'moderator', 'admin'));

-- 2. Backfill: promote existing admins
UPDATE public.profiles SET role = 'admin' WHERE is_admin = true;

-- 3. Update the self-elevation protection trigger to guard role
CREATE OR REPLACE FUNCTION prevent_self_admin_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their own role
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF auth.uid() = NEW.id THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies for babel_contributions
DROP POLICY IF EXISTS "Admins can read all contributions" ON public.babel_contributions;
CREATE POLICY "Admins can read all contributions"
  ON public.babel_contributions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update contributions" ON public.babel_contributions;
CREATE POLICY "Admins can update contributions"
  ON public.babel_contributions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Update RLS policies for equipment_submissions
DROP POLICY IF EXISTS "Admins can read equipment submissions" ON public.equipment_submissions;
CREATE POLICY "Admins can read equipment submissions"
  ON public.equipment_submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update equipment submissions" ON public.equipment_submissions;
CREATE POLICY "Admins can update equipment submissions"
  ON public.equipment_submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Drop the old column — role is now the source of truth
ALTER TABLE public.profiles DROP COLUMN is_admin;
