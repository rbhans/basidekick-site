-- Work / education history shown on user profiles.
-- Mirrors the conventions of equipment_experience + pointstack_posts:
-- public read, owner-only writes via RLS, shared updated_at trigger.

CREATE TABLE IF NOT EXISTS public.work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'work' CHECK (kind IN ('work', 'education')),
  title text NOT NULL,
  organization text NOT NULL,
  organization_url text,
  location text,
  start_date date NOT NULL,
  end_date date,                 -- null => current / ongoing
  is_current boolean DEFAULT false,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_experience_user_id
  ON public.work_experience(user_id);

ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work experience is viewable by everyone"
  ON public.work_experience FOR SELECT
  USING (true);

CREATE POLICY "Users can add work experience"
  ON public.work_experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their work experience"
  ON public.work_experience FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their work experience"
  ON public.work_experience FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER work_experience_updated_at
  BEFORE UPDATE ON public.work_experience
  FOR EACH ROW EXECUTE FUNCTION public.pointstack_update_timestamp();
