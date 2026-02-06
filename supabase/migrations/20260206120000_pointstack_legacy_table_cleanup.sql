-- ============================================================
-- PointStack legacy table cleanup
-- ============================================================
-- Projects are now stored in public.pointstack_posts.

DROP TABLE IF EXISTS public.pointstack_project_likes CASCADE;
DROP TABLE IF EXISTS public.pointstack_project_credits CASCADE;
DROP TABLE IF EXISTS public.pointstack_showcase_projects CASCADE;
