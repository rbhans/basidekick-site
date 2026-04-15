-- ============================================================
-- Cleanup: Drop unused PSK (Project SideKick) and Forum tables
-- ============================================================
-- PSK was replaced by PointStack. Forum was never launched.
-- wiki_suggestions depended on forum_threads.
-- wiki_article_revisions / wiki_pages / wiki_votes are v1 relics
-- replaced by wiki_articles + facets system.
--
-- QSK tables are intentionally kept.
-- All pointstack_* tables are intentionally kept.
-- All current wiki_* tables (articles, facets, collections, comments, categories) are kept.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. DROP PSK TRIGGERS (before dropping tables/functions)
-- ============================================================

DROP TRIGGER IF EXISTS update_psk_companies_updated_at ON psk_companies;
DROP TRIGGER IF EXISTS set_psk_projects_created_by ON psk_projects;
DROP TRIGGER IF EXISTS set_psk_tasks_created_by ON psk_tasks;
DROP TRIGGER IF EXISTS set_psk_time_entries_created_by ON psk_time_entries;
DROP TRIGGER IF EXISTS set_psk_budget_line_items_created_by ON psk_budget_line_items;
DROP TRIGGER IF EXISTS set_psk_files_created_by ON psk_files;

-- ============================================================
-- 2. DROP FORUM TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_forum_post_created ON forum_posts;
DROP TRIGGER IF EXISTS on_forum_post_deleted ON forum_posts;
DROP TRIGGER IF EXISTS rate_limit_forum_threads_trigger ON forum_threads;
DROP TRIGGER IF EXISTS rate_limit_forum_posts_trigger ON forum_posts;
DROP TRIGGER IF EXISTS rate_limit_wiki_suggestions_trigger ON wiki_suggestions;
DROP TRIGGER IF EXISTS refresh_forum_thread_stats_trigger ON forum_posts;

-- ============================================================
-- 3. DROP PSK TABLES (children first due to FKs)
-- ============================================================

-- Remove from realtime publication first
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE psk_companies;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE psk_company_members;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

DROP TABLE IF EXISTS public.psk_notes CASCADE;
DROP TABLE IF EXISTS public.psk_files CASCADE;
DROP TABLE IF EXISTS public.psk_budget_line_items CASCADE;
DROP TABLE IF EXISTS public.psk_time_entries CASCADE;
DROP TABLE IF EXISTS public.psk_tasks CASCADE;
DROP TABLE IF EXISTS public.psk_projects CASCADE;
DROP TABLE IF EXISTS public.psk_clients CASCADE;
DROP TABLE IF EXISTS public.psk_company_members CASCADE;
DROP TABLE IF EXISTS public.psk_companies CASCADE;

-- Original generic projects table (pre-PSK)
DROP TABLE IF EXISTS public.projects CASCADE;

-- ============================================================
-- 4. DROP FORUM & WIKI-SUGGESTION TABLES
-- ============================================================

-- wiki_suggestions references forum_threads, drop first
DROP TABLE IF EXISTS public.wiki_suggestions CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.forum_threads CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;

-- ============================================================
-- 5. DROP OLD WIKI V1 TABLES (replaced by wiki_articles + facets)
-- ============================================================

DROP TABLE IF EXISTS public.wiki_page_tags CASCADE;
DROP TABLE IF EXISTS public.wiki_votes CASCADE;
DROP TABLE IF EXISTS public.wiki_pages CASCADE;
DROP TABLE IF EXISTS public.wiki_article_revisions CASCADE;

-- ============================================================
-- 6. DROP DEAD FUNCTIONS
-- ============================================================

-- PSK company functions (replaced by pointstack equivalents)
DROP FUNCTION IF EXISTS public.join_company_by_invite(uuid);
DROP FUNCTION IF EXISTS public.regenerate_company_invite_code(uuid);
DROP FUNCTION IF EXISTS public.generate_company_slug(text);
DROP FUNCTION IF EXISTS public.set_created_by();

-- Forum functions
DROP FUNCTION IF EXISTS public.refresh_forum_thread_stats();
DROP FUNCTION IF EXISTS public.increment_forum_thread_view(uuid);
DROP FUNCTION IF EXISTS public.rate_limit_forum_threads();
DROP FUNCTION IF EXISTS public.rate_limit_forum_posts();
DROP FUNCTION IF EXISTS public.rate_limit_wiki_suggestions();
DROP FUNCTION IF EXISTS public.increment_user_post_count();
DROP FUNCTION IF EXISTS public.decrement_user_post_count();

-- ============================================================
-- 7. REWRITE join_pointstack_company_by_invite TO REMOVE PSK REFS
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_pointstack_company_by_invite(invite_code_param text)
RETURNS UUID AS $$
DECLARE
  target_company_id UUID;
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

  RETURN target_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 8. CLEAN UP profiles.post_count (only tracked forum posts)
-- ============================================================

-- Reset all post_count values since the forum trigger that maintained
-- them is gone. The column itself stays in case it's repurposed later.
UPDATE public.profiles SET post_count = 0 WHERE post_count > 0;

COMMIT;
