-- ============================================================
-- Server-side rate limiting for user-generated content
-- Date: 2026-02-05
-- ============================================================

-- Log table for rate limit checks
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id bigserial primary key,
  user_id uuid not null,
  action text not null,
  occurred_at timestamptz default now()
);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_user_action_time
  ON public.rate_limit_events(user_id, action, occurred_at DESC);

-- Core rate limit enforcement function
CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  p_action text,
  p_max_attempts int,
  p_window_seconds int,
  p_user_id uuid
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_count int;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Rate limit: unauthenticated' USING ERRCODE = 'P0001';
  END IF;

  -- Keep the log bounded per user/action
  DELETE FROM public.rate_limit_events
  WHERE user_id = v_user_id
    AND action = p_action
    AND occurred_at < now() - make_interval(secs => p_window_seconds);

  SELECT COUNT(*) INTO v_count
  FROM public.rate_limit_events
  WHERE user_id = v_user_id
    AND action = p_action
    AND occurred_at >= now() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max_attempts THEN
    RAISE EXCEPTION 'Rate limit exceeded for %', p_action USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.rate_limit_events (user_id, action)
  VALUES (v_user_id, p_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Forum threads: 3 per 5 minutes
CREATE OR REPLACE FUNCTION public.rate_limit_forum_threads()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.enforce_rate_limit('forum_thread', 3, 300, NEW.author_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS forum_threads_rate_limit ON public.forum_threads;
CREATE TRIGGER forum_threads_rate_limit
  BEFORE INSERT ON public.forum_threads
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_forum_threads();

-- Forum posts: 10 per minute
CREATE OR REPLACE FUNCTION public.rate_limit_forum_posts()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.enforce_rate_limit('forum_post', 10, 60, NEW.author_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS forum_posts_rate_limit ON public.forum_posts;
CREATE TRIGGER forum_posts_rate_limit
  BEFORE INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_forum_posts();

-- Wiki suggestions: 5 per hour
CREATE OR REPLACE FUNCTION public.rate_limit_wiki_suggestions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.enforce_rate_limit('wiki_suggest', 5, 3600, NEW.suggested_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS wiki_suggestions_rate_limit ON public.wiki_suggestions;
CREATE TRIGGER wiki_suggestions_rate_limit
  BEFORE INSERT ON public.wiki_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_wiki_suggestions();

-- Babel contributions: 10 per hour
CREATE OR REPLACE FUNCTION public.rate_limit_babel_contributions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.enforce_rate_limit('babel_contribution', 10, 3600, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS babel_contributions_rate_limit ON public.babel_contributions;
CREATE TRIGGER babel_contributions_rate_limit
  BEFORE INSERT ON public.babel_contributions
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_babel_contributions();

-- Equipment submissions: 10 per hour
CREATE OR REPLACE FUNCTION public.rate_limit_equipment_submissions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.enforce_rate_limit('equipment_submission', 10, 3600, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS equipment_submissions_rate_limit ON public.equipment_submissions;
CREATE TRIGGER equipment_submissions_rate_limit
  BEFORE INSERT ON public.equipment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_equipment_submissions();
