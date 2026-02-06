-- ============================================================
-- PSK <-> PointStack company unification
-- ============================================================

-- Mapping column between legacy PSK companies and unified PointStack companies
ALTER TABLE public.psk_companies
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_psk_companies_pointstack_company_id
  ON public.psk_companies (pointstack_company_id)
  WHERE pointstack_company_id IS NOT NULL;

-- Add pointstack_company_id to PSK tables for unified references
ALTER TABLE public.psk_projects
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

ALTER TABLE public.psk_clients
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

ALTER TABLE public.psk_tasks
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

ALTER TABLE public.psk_time_entries
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

ALTER TABLE public.psk_files
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

ALTER TABLE public.psk_notes
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

ALTER TABLE public.psk_budget_line_items
  ADD COLUMN IF NOT EXISTS pointstack_company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_psk_projects_pointstack_company_id
  ON public.psk_projects (pointstack_company_id);

CREATE INDEX IF NOT EXISTS idx_psk_clients_pointstack_company_id
  ON public.psk_clients (pointstack_company_id);

CREATE INDEX IF NOT EXISTS idx_psk_tasks_pointstack_company_id
  ON public.psk_tasks (pointstack_company_id);

CREATE INDEX IF NOT EXISTS idx_psk_time_entries_pointstack_company_id
  ON public.psk_time_entries (pointstack_company_id);

CREATE INDEX IF NOT EXISTS idx_psk_files_pointstack_company_id
  ON public.psk_files (pointstack_company_id);

CREATE INDEX IF NOT EXISTS idx_psk_notes_pointstack_company_id
  ON public.psk_notes (pointstack_company_id);

CREATE INDEX IF NOT EXISTS idx_psk_budget_line_items_pointstack_company_id
  ON public.psk_budget_line_items (pointstack_company_id);

-- 1) Create PointStack companies for legacy PSK companies that do not yet exist
INSERT INTO public.pointstack_companies (
  name,
  slug,
  owner_id,
  invite_code,
  created_at,
  updated_at
)
SELECT
  pc.name,
  pc.slug,
  pc.owner_id,
  COALESCE(NULLIF(replace(pc.invite_code::text, '-', ''), ''), encode(gen_random_bytes(6), 'hex')),
  pc.created_at,
  pc.updated_at
FROM public.psk_companies pc
WHERE pc.pointstack_company_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.pointstack_companies c
    WHERE c.slug = pc.slug
  );

-- 2) Link PSK companies to PointStack companies
WITH ranked_matches AS (
  SELECT
    pc.id AS psk_company_id,
    c.id AS pointstack_company_id,
    ROW_NUMBER() OVER (
      PARTITION BY pc.id
      ORDER BY
        CASE WHEN c.slug = pc.slug THEN 0 ELSE 1 END,
        c.created_at ASC,
        c.id ASC
    ) AS rn
  FROM public.psk_companies pc
  JOIN public.pointstack_companies c
    ON c.slug = pc.slug
    OR (c.owner_id = pc.owner_id AND LOWER(c.name) = LOWER(pc.name))
  WHERE pc.pointstack_company_id IS NULL
)
UPDATE public.psk_companies pc
SET pointstack_company_id = rm.pointstack_company_id
FROM ranked_matches rm
WHERE pc.id = rm.psk_company_id
  AND rm.rn = 1;

-- 3) Ensure every PointStack company also has a PSK mirror row (for backward compatibility)
INSERT INTO public.psk_companies (
  name,
  slug,
  owner_id,
  invite_code,
  created_at,
  updated_at,
  pointstack_company_id
)
SELECT
  c.name,
  c.slug,
  c.owner_id,
  gen_random_uuid(),
  c.created_at,
  c.updated_at,
  c.id
FROM public.pointstack_companies c
LEFT JOIN public.psk_companies pc
  ON pc.pointstack_company_id = c.id
WHERE pc.id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.psk_companies pc2
    WHERE pc2.slug = c.slug
  );

-- 4) Re-link any still-unmapped PSK companies by slug/owner
WITH ranked_matches AS (
  SELECT
    pc.id AS psk_company_id,
    c.id AS pointstack_company_id,
    ROW_NUMBER() OVER (
      PARTITION BY pc.id
      ORDER BY
        CASE WHEN c.slug = pc.slug THEN 0 ELSE 1 END,
        c.created_at ASC,
        c.id ASC
    ) AS rn
  FROM public.psk_companies pc
  JOIN public.pointstack_companies c
    ON c.slug = pc.slug
    OR (c.owner_id = pc.owner_id AND LOWER(c.name) = LOWER(pc.name))
  WHERE pc.pointstack_company_id IS NULL
)
UPDATE public.psk_companies pc
SET pointstack_company_id = rm.pointstack_company_id
FROM ranked_matches rm
WHERE pc.id = rm.psk_company_id
  AND rm.rn = 1;

-- 5) Backfill PointStack memberships from legacy PSK memberships
INSERT INTO public.pointstack_company_members (company_id, user_id, role, joined_at)
SELECT
  pc.pointstack_company_id,
  m.user_id,
  CASE WHEN m.role = 'owner' THEN 'owner' ELSE 'member' END,
  m.joined_at
FROM public.psk_company_members m
JOIN public.psk_companies pc
  ON pc.id = m.company_id
WHERE pc.pointstack_company_id IS NOT NULL
ON CONFLICT (company_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- 6) Backfill pointstack_company_id values in PSK tables
UPDATE public.psk_projects p
SET pointstack_company_id = pc.pointstack_company_id
FROM public.psk_companies pc
WHERE p.pointstack_company_id IS NULL
  AND p.company_id = pc.id
  AND pc.pointstack_company_id IS NOT NULL;

UPDATE public.psk_clients c
SET pointstack_company_id = pc.pointstack_company_id
FROM public.psk_companies pc
WHERE c.pointstack_company_id IS NULL
  AND c.company_id = pc.id
  AND pc.pointstack_company_id IS NOT NULL;

UPDATE public.psk_tasks t
SET pointstack_company_id = p.pointstack_company_id
FROM public.psk_projects p
WHERE t.pointstack_company_id IS NULL
  AND t.project_id = p.id
  AND p.pointstack_company_id IS NOT NULL;

UPDATE public.psk_time_entries te
SET pointstack_company_id = p.pointstack_company_id
FROM public.psk_projects p
WHERE te.pointstack_company_id IS NULL
  AND te.project_id = p.id
  AND p.pointstack_company_id IS NOT NULL;

UPDATE public.psk_files f
SET pointstack_company_id = p.pointstack_company_id
FROM public.psk_projects p
WHERE f.pointstack_company_id IS NULL
  AND f.project_id = p.id
  AND p.pointstack_company_id IS NOT NULL;

UPDATE public.psk_notes n
SET pointstack_company_id = p.pointstack_company_id
FROM public.psk_projects p
WHERE n.pointstack_company_id IS NULL
  AND n.project_id = p.id
  AND p.pointstack_company_id IS NOT NULL;

UPDATE public.psk_budget_line_items b
SET pointstack_company_id = p.pointstack_company_id
FROM public.psk_projects p
WHERE b.pointstack_company_id IS NULL
  AND b.project_id = p.id
  AND p.pointstack_company_id IS NOT NULL;

-- Invite helper for unified companies
CREATE OR REPLACE FUNCTION public.join_pointstack_company_by_invite(invite_code_param text)
RETURNS UUID AS $$
DECLARE
  target_company_id UUID;
  legacy_company_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id INTO target_company_id
  FROM public.pointstack_companies
  WHERE invite_code = invite_code_param
  LIMIT 1;

  IF target_company_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.pointstack_company_members (company_id, user_id, role)
  VALUES (target_company_id, auth.uid(), 'member')
  ON CONFLICT (company_id, user_id) DO NOTHING;

  SELECT id INTO legacy_company_id
  FROM public.psk_companies
  WHERE pointstack_company_id = target_company_id
  LIMIT 1;

  IF legacy_company_id IS NOT NULL THEN
    INSERT INTO public.psk_company_members (company_id, user_id, role)
    VALUES (legacy_company_id, auth.uid(), 'member')
    ON CONFLICT (company_id, user_id) DO NOTHING;
  END IF;

  RETURN target_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.join_pointstack_company_by_invite(text) TO authenticated;

-- Invite regeneration helper for unified companies
CREATE OR REPLACE FUNCTION public.regenerate_pointstack_company_invite_code(company_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  generated_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.pointstack_companies
    WHERE id = company_id_param
      AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the company owner can regenerate invite codes';
  END IF;

  LOOP
    generated_code := encode(gen_random_bytes(6), 'hex');
    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.pointstack_companies
      WHERE invite_code = generated_code
    );
  END LOOP;

  UPDATE public.pointstack_companies
  SET invite_code = generated_code
  WHERE id = company_id_param;

  RETURN generated_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.regenerate_pointstack_company_invite_code(UUID) TO authenticated;
