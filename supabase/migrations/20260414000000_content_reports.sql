-- ============================================================
-- CONTENT REPORTS
-- Unified user-submitted reports / suggestions for atlas entries,
-- wiki articles, and "I want a new atlas entry" requests.
-- Feeds the admin dashboard moderation queue.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN (
    'atlas_point',
    'atlas_equipment',
    'wiki_article',
    'new_atlas_entry'
  )),
  target_id TEXT,
  target_label TEXT,
  target_url TEXT,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_reports_status_created_idx
  ON public.content_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS content_reports_target_idx
  ON public.content_reports (target_type, target_id);

CREATE INDEX IF NOT EXISTS content_reports_user_idx
  ON public.content_reports (user_id);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can create their own reports
CREATE POLICY "Users can create their own reports"
  ON public.content_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own reports
CREATE POLICY "Users can read their own reports"
  ON public.content_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all reports
CREATE POLICY "Admins can read all reports"
  ON public.content_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports (resolve/dismiss/add notes)
CREATE POLICY "Admins can update reports"
  ON public.content_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
