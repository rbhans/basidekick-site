-- ============================================================
-- ADD USER ROLES
-- Replaces the boolean is_admin flag with a role enum column
-- that supports member / moderator / admin levels.
--
-- Rewritten to handle ALL dependent policies that accumulated
-- on the remote DB before this migration was applied.
-- ============================================================

-- 1. Add the new column (default every existing user to 'member')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'moderator', 'admin'));

-- 2. Backfill: promote existing admins
UPDATE public.profiles SET role = 'admin' WHERE is_admin = true;

-- 3. Update the self-elevation protection trigger to guard role
CREATE OR REPLACE FUNCTION prevent_self_admin_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their own role
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF auth.uid() = NEW.id THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 4. Drop every RLS policy that references profiles.is_admin,
--    then recreate with role = 'admin'. Using DROP IF EXISTS so
--    local dev (fresh DB) is safe.
-- ------------------------------------------------------------

-- babel_contributions
DROP POLICY IF EXISTS "Admins can read all contributions" ON public.babel_contributions;
CREATE POLICY "Admins can read all contributions"
  ON public.babel_contributions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update contributions" ON public.babel_contributions;
CREATE POLICY "Admins can update contributions"
  ON public.babel_contributions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- equipment_submissions
DROP POLICY IF EXISTS "Admins can read equipment submissions" ON public.equipment_submissions;
CREATE POLICY "Admins can read equipment submissions"
  ON public.equipment_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update equipment submissions" ON public.equipment_submissions;
CREATE POLICY "Admins can update equipment submissions"
  ON public.equipment_submissions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- wiki_suggestions
DROP POLICY IF EXISTS "Admins can update wiki suggestions" ON public.wiki_suggestions;
CREATE POLICY "Admins can update wiki suggestions"
  ON public.wiki_suggestions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- The tables below may not yet exist on fresh dev databases (their
-- create migrations run after this one). On the live DB they exist
-- because they were applied out-of-order via the SQL editor. Wrap
-- each in a DO block that checks for the table before touching it.

-- wiki_facet_groups / wiki_facets / wiki_article_facets
DO $$
BEGIN
  IF to_regclass('public.wiki_facet_groups') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can manage facet groups" ON public.wiki_facet_groups;
    CREATE POLICY "Admins can manage facet groups"
      ON public.wiki_facet_groups FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF to_regclass('public.wiki_facets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can manage facets" ON public.wiki_facets;
    CREATE POLICY "Admins can manage facets"
      ON public.wiki_facets FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF to_regclass('public.wiki_article_facets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can manage article facets" ON public.wiki_article_facets;
    CREATE POLICY "Admins can manage article facets"
      ON public.wiki_article_facets FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF to_regclass('public.wiki_collections') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can manage collections" ON public.wiki_collections;
    CREATE POLICY "Admins can manage collections"
      ON public.wiki_collections FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF to_regclass('public.wiki_collection_articles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can manage collection articles" ON public.wiki_collection_articles;
    CREATE POLICY "Admins can manage collection articles"
      ON public.wiki_collection_articles FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF to_regclass('public.news_articles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can update articles" ON public.news_articles;
    CREATE POLICY "Admins can update articles"
      ON public.news_articles FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

    DROP POLICY IF EXISTS "Admins can delete articles" ON public.news_articles;
    CREATE POLICY "Admins can delete articles"
      ON public.news_articles FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  IF to_regclass('public.content_reports') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can read all reports" ON public.content_reports;
    CREATE POLICY "Admins can read all reports"
      ON public.content_reports FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

    DROP POLICY IF EXISTS "Admins can update reports" ON public.content_reports;
    CREATE POLICY "Admins can update reports"
      ON public.content_reports FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- ------------------------------------------------------------
-- 5. Drop the old column — role is now the source of truth
-- ------------------------------------------------------------
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;
