-- ============================================================
-- Core schema fixes (licenses, forum stats, avatars, view counts)
-- Date: 2026-02-05
-- ============================================================

-- ============================================================
-- LICENSES TABLE (missing from migrations)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  product_id text not null, -- 'nsk', 'ssk', 'msk'
  license_key text not null,
  lemon_squeezy_order_id text,
  purchased_at timestamptz default now(),
  expires_at timestamptz, -- null = lifetime
  is_active boolean default true
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;
CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_order_id
  ON public.licenses(lemon_squeezy_order_id)
  WHERE lemon_squeezy_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_key ON public.licenses(license_key);

-- ============================================================
-- FORUM THREAD STATS (reply_count + last_post_at)
-- ============================================================

ALTER TABLE public.forum_threads
  ADD COLUMN IF NOT EXISTS reply_count int default 0;

CREATE OR REPLACE FUNCTION public.refresh_forum_thread_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_thread_id uuid;
  posts_count int;
  last_post timestamptz;
BEGIN
  target_thread_id := COALESCE(NEW.thread_id, OLD.thread_id);

  SELECT COUNT(*), MAX(created_at)
  INTO posts_count, last_post
  FROM public.forum_posts
  WHERE thread_id = target_thread_id;

  UPDATE public.forum_threads ft
  SET reply_count = GREATEST(posts_count - 1, 0),
      last_post_at = COALESCE(last_post, ft.created_at)
  WHERE ft.id = target_thread_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS forum_posts_refresh_thread_stats ON public.forum_posts;
CREATE TRIGGER forum_posts_refresh_thread_stats
  AFTER INSERT OR DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.refresh_forum_thread_stats();

-- Backfill reply_count and last_post_at for existing threads
WITH stats AS (
  SELECT thread_id, COUNT(*) AS posts_count, MAX(created_at) AS last_post
  FROM public.forum_posts
  GROUP BY thread_id
)
UPDATE public.forum_threads ft
SET reply_count = GREATEST(COALESCE(stats.posts_count, 0) - 1, 0),
    last_post_at = COALESCE(stats.last_post, ft.created_at)
FROM stats
WHERE ft.id = stats.thread_id;

-- ============================================================
-- FORUM VIEW COUNT RPC (atomic + works for anon)
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_forum_thread_view(thread_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.forum_threads
  SET view_count = view_count + 1
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.increment_forum_thread_view(uuid) TO anon, authenticated;

-- ============================================================
-- AVATAR STORAGE BUCKET + POLICIES
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
