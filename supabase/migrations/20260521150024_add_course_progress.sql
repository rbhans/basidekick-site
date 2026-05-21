-- ============================================================
-- COURSE PROGRESS
-- Per-user lesson completion + last-viewed lesson for each
-- course. Authoritative source when signed in; localStorage
-- handles anon + offline state in the client.
--
-- Schema is intentionally compact: one row per (user, course)
-- with the list of completed lesson slugs. Course/lesson slugs
-- live in MDX content (no FK target) so we keep them as text.
-- ============================================================

CREATE TABLE public.course_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lessons_completed TEXT[] NOT NULL DEFAULT '{}',
  last_lesson_slug TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_slug)
);

CREATE INDEX course_progress_user_idx
  ON public.course_progress (user_id);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own course progress"
  ON public.course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own course progress"
  ON public.course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own course progress"
  ON public.course_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own course progress"
  ON public.course_progress FOR DELETE
  USING (auth.uid() = user_id);
