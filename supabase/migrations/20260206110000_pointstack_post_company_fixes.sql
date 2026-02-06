-- ============================================================
-- PointStack post/company fixes
-- ============================================================

-- Add missing equipment_ids column (idempotent, safe if already applied)
ALTER TABLE public.pointstack_posts
  ADD COLUMN IF NOT EXISTS equipment_ids TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_pointstack_posts_equipment_ids
  ON public.pointstack_posts USING GIN (equipment_ids);

-- Atomic post view increment RPC used by the app
CREATE OR REPLACE FUNCTION public.increment_post_view_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.pointstack_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.increment_post_view_count(uuid) TO anon, authenticated;

-- Keep profile post_count in sync with PointStack post lifecycle
CREATE OR REPLACE FUNCTION public.pointstack_update_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET post_count = COALESCE(post_count, 0) + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET post_count = GREATEST(COALESCE(post_count, 0) - 1, 0)
    WHERE id = OLD.author_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS pointstack_user_post_count_change ON public.pointstack_posts;
CREATE TRIGGER pointstack_user_post_count_change
  AFTER INSERT OR DELETE ON public.pointstack_posts
  FOR EACH ROW EXECUTE FUNCTION public.pointstack_update_user_post_count();

-- Add invite_code to PointStack companies for PSK/PointStack unification
ALTER TABLE public.pointstack_companies
  ADD COLUMN IF NOT EXISTS invite_code TEXT;

UPDATE public.pointstack_companies
SET invite_code = encode(gen_random_bytes(6), 'hex')
WHERE invite_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pointstack_companies_invite_code
  ON public.pointstack_companies (invite_code);

ALTER TABLE public.pointstack_companies
  ALTER COLUMN invite_code SET DEFAULT encode(gen_random_bytes(6), 'hex');

ALTER TABLE public.pointstack_companies
  ALTER COLUMN invite_code SET NOT NULL;

-- Allow owner/admin members to update company records
DROP POLICY IF EXISTS "Owners can update their companies" ON public.pointstack_companies;
DROP POLICY IF EXISTS "Owners/admins can update their companies" ON public.pointstack_companies;
CREATE POLICY "Owners/admins can update their companies"
  ON public.pointstack_companies FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1
      FROM public.pointstack_company_members cm
      WHERE cm.company_id = pointstack_companies.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );
