-- ============================================================
-- User-submitted wiki contributions (new entries + edit suggestions)
-- Moderation queue mirroring babel_contributions.
-- Date: 2026-05-21
-- ============================================================

CREATE TABLE public.wiki_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('edit', 'new_entry')),
  target_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,

  -- Proposed content (full snapshot — admin diffs against current article for edits)
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
  submitter_notes TEXT,

  -- Review state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  approved_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wiki_contributions_edit_has_target CHECK (
    (type = 'edit' AND target_article_id IS NOT NULL) OR
    (type = 'new_entry' AND target_article_id IS NULL)
  )
);

CREATE INDEX idx_wiki_contributions_status ON public.wiki_contributions(status);
CREATE INDEX idx_wiki_contributions_user ON public.wiki_contributions(user_id);
CREATE INDEX idx_wiki_contributions_target ON public.wiki_contributions(target_article_id);
CREATE INDEX idx_wiki_contributions_created ON public.wiki_contributions(created_at DESC);

ALTER TABLE public.wiki_contributions ENABLE ROW LEVEL SECURITY;

-- SELECT: users see own; admins see all
CREATE POLICY "Users view own wiki contributions"
  ON public.wiki_contributions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view all wiki contributions"
  ON public.wiki_contributions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: authenticated users insert own pending submission
CREATE POLICY "Users insert own wiki contribution"
  ON public.wiki_contributions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND approved_article_id IS NULL
  );

-- UPDATE: admins only (status + reviewer fields). API uses service-role anyway;
-- this keeps direct-from-client tampering impossible.
CREATE POLICY "Admins update wiki contributions"
  ON public.wiki_contributions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- updated_at trigger (reuses existing update_updated_at_column function)
CREATE TRIGGER update_wiki_contributions_updated_at
  BEFORE UPDATE ON public.wiki_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Rate limit: 10 submissions per hour per user. Mirrors babel/equipment pattern.
CREATE OR REPLACE FUNCTION public.rate_limit_wiki_contributions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.enforce_rate_limit('wiki_contribution', 10, 3600, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.rate_limit_wiki_contributions() FROM anon, authenticated;

DROP TRIGGER IF EXISTS wiki_contributions_rate_limit ON public.wiki_contributions;
CREATE TRIGGER wiki_contributions_rate_limit
  BEFORE INSERT ON public.wiki_contributions
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_wiki_contributions();
