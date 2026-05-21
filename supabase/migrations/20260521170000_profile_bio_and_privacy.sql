-- ============================================================
-- Profile bio + privacy toggle for completions visibility
-- Date: 2026-05-21
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS show_completions BOOLEAN NOT NULL DEFAULT false;

-- No RLS changes — profiles already permits owner self-update.
-- show_completions is enforced at query time by the public profile page;
-- course_progress remains user-only-readable (no public read policy).
