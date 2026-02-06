-- ============================================================
-- PointStack company join requests
-- Date: 2026-02-05
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pointstack_company_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.pointstack_companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, user_id)
);

ALTER TABLE public.pointstack_company_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and company managers can view join requests" ON public.pointstack_company_join_requests;
CREATE POLICY "Users and company managers can view join requests"
  ON public.pointstack_company_join_requests FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.pointstack_companies c
      WHERE c.id = pointstack_company_join_requests.company_id
        AND c.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.pointstack_company_members cm
      WHERE cm.company_id = pointstack_company_join_requests.company_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can request to join companies" ON public.pointstack_company_join_requests;
CREATE POLICY "Authenticated users can request to join companies"
  ON public.pointstack_company_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND NOT EXISTS (
      SELECT 1
      FROM public.pointstack_company_members cm
      WHERE cm.company_id = pointstack_company_join_requests.company_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company owners/admins can review join requests" ON public.pointstack_company_join_requests;
CREATE POLICY "Company owners/admins can review join requests"
  ON public.pointstack_company_join_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.pointstack_companies c
      WHERE c.id = pointstack_company_join_requests.company_id
        AND c.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.pointstack_company_members cm
      WHERE cm.company_id = pointstack_company_join_requests.company_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pointstack_companies c
      WHERE c.id = pointstack_company_join_requests.company_id
        AND c.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.pointstack_company_members cm
      WHERE cm.company_id = pointstack_company_join_requests.company_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can cancel their own pending requests" ON public.pointstack_company_join_requests;
CREATE POLICY "Users can cancel their own pending requests"
  ON public.pointstack_company_join_requests FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE INDEX IF NOT EXISTS idx_pointstack_company_join_requests_company
  ON public.pointstack_company_join_requests (company_id);

CREATE INDEX IF NOT EXISTS idx_pointstack_company_join_requests_user
  ON public.pointstack_company_join_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_pointstack_company_join_requests_pending
  ON public.pointstack_company_join_requests (company_id, status)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS pointstack_company_join_requests_updated_at ON public.pointstack_company_join_requests;
CREATE TRIGGER pointstack_company_join_requests_updated_at
  BEFORE UPDATE ON public.pointstack_company_join_requests
  FOR EACH ROW EXECUTE FUNCTION public.pointstack_update_timestamp();
