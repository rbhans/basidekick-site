-- ============================================================
-- Security hardening (2026-06-29)
-- ============================================================
-- Source: full security evaluation of basidekick-site.
--
-- The app writes to most tables directly from the browser via PostgREST, so
-- RLS + WITH CHECK is the only authorization boundary. Several policies were
-- missing a WITH CHECK (or had one that constrained the wrong column), which
-- allowed authenticated users to forge fields, escalate their own state, or
-- write into other users' storage folders.
--
-- Every block is idempotent (DROP POLICY IF EXISTS before CREATE) so it
-- deterministically corrects whatever policy is currently live, regardless of
-- prior apply order.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- M2. news_articles: prevent forging the "AI-curated" badge.
-- The authenticated INSERT policy only bound submitted_by, so a user could
-- POST is_ai_submitted=true via PostgREST and impersonate the AI curator.
-- The service-role curator bypasses RLS and is unaffected.
-- (is_published is intentionally left at its column default; auto-publish of
-- user submissions is a product decision and is NOT changed here.)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can submit articles" ON public.news_articles;
CREATE POLICY "Authenticated users can submit articles"
  ON public.news_articles FOR INSERT
  WITH CHECK (auth.uid() = submitted_by AND is_ai_submitted IS NOT TRUE);

-- ------------------------------------------------------------
-- M3. profiles: add a WITH CHECK so the self-service UPDATE cannot change the
-- caller's own role. Previously there was no WITH CHECK; role escalation was
-- blocked only by the prevent_self_admin_elevation trigger. This adds an
-- RLS-level backstop so the admin boundary no longer depends on a single
-- trigger. Admins change roles via the service role, which bypasses RLS.
-- (The subquery reads the pre-update committed role, so NEW.role must equal
-- the current role -> the role column is effectively immutable to its owner.)
-- ------------------------------------------------------------
-- NOTE: the LIVE policy is named "profiles_update_own" (verified against the
-- running DB), NOT the schema.sql name. Drop both names so this is correct
-- regardless of which is present, then recreate under the live name.
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

-- ------------------------------------------------------------
-- M5. storage.objects: bind uploads to the uploader's own folder.
-- These INSERT policies only checked auth.role()='authenticated', letting a
-- user write objects under another user's "{uid}/..." prefix. The matching
-- UPDATE/DELETE policies already enforce folder == auth.uid(); this aligns
-- INSERT with them. All client upload keys are "${user.id}/...".
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
CREATE POLICY "Authenticated users can upload equipment images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'equipment-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users can upload pointstack post files" ON storage.objects;
CREATE POLICY "Authenticated users can upload pointstack post files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pointstack-posts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users can upload pointstack images" ON storage.objects;
CREATE POLICY "Authenticated users can upload pointstack images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pointstack-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- pointstack-files is a private bucket with no current client upload path;
-- bind it too so the secure default holds if an upload path is added later.
DROP POLICY IF EXISTS "Authenticated users can upload pointstack files" ON storage.objects;
CREATE POLICY "Authenticated users can upload pointstack files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pointstack-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ------------------------------------------------------------
-- L1. pointstack_job_applications: stop applicants from mutating their own
-- application status (e.g. self-"accepted"). Only the job poster may change
-- status; the applicant may still edit their own non-status fields.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their applications" ON public.pointstack_job_applications;
CREATE POLICY "Users can update their applications"
  ON public.pointstack_job_applications FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.pointstack_jobs j
      WHERE j.id = job_id AND j.posted_by = auth.uid()
    )
  )
  WITH CHECK (
    -- Job poster may change anything (including status)
    EXISTS (
      SELECT 1 FROM public.pointstack_jobs j
      WHERE j.id = job_id AND j.posted_by = auth.uid()
    )
    -- Applicant may update their own row but not change status
    OR (
      auth.uid() = user_id
      AND status = (
        SELECT a.status FROM public.pointstack_job_applications a
        WHERE a.id = pointstack_job_applications.id
      )
    )
  );

-- ------------------------------------------------------------
-- L2. wiki facet/collection admin policies: add WITH CHECK to the FOR ALL
-- policies. USING-only on FOR ALL leaves the INSERT branch unconstrained, so a
-- non-admin could insert taxonomy rows. Recreate with matching USING + CHECK.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage facet groups" ON public.wiki_facet_groups;
CREATE POLICY "Admins can manage facet groups" ON public.wiki_facet_groups
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage facets" ON public.wiki_facets;
CREATE POLICY "Admins can manage facets" ON public.wiki_facets
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage article facets" ON public.wiki_article_facets;
CREATE POLICY "Admins can manage article facets" ON public.wiki_article_facets
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage collections" ON public.wiki_collections;
CREATE POLICY "Admins can manage collections" ON public.wiki_collections
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage collection articles" ON public.wiki_collection_articles;
CREATE POLICY "Admins can manage collection articles" ON public.wiki_collection_articles
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

COMMIT;
