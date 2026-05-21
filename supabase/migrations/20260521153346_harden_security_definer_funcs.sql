-- ============================================================
-- Security hardening for SECURITY DEFINER functions
--
-- Addresses two classes of Supabase linter warnings:
--
-- 1. function_search_path_mutable (lint=0011): SECURITY DEFINER
--    functions with a mutable search_path can be tricked by a
--    caller-controlled search_path into looking up tables in a
--    malicious schema. Pinning search_path to `public, pg_temp`
--    keeps current behavior while blocking that attack.
--
-- 2. anon_security_definer_function_executable (lint=0028) and
--    authenticated_security_definer_function_executable (lint=0029):
--    trigger-only SECURITY DEFINER functions get exposed as
--    PostgREST RPC endpoints by default. Triggers fire as the
--    function owner regardless of caller grants, so revoking
--    EXECUTE from anon/authenticated cleanly removes the public
--    RPC surface without affecting trigger behavior.
--
-- Functions deliberately NOT touched here:
--   - qsk_is_org_admin / qsk_is_station_admin / qsk_user_org_ids /
--     qsk_user_station_ids / user_company_ids — these are called
--     from RLS policies and need EXECUTE for anon/authenticated.
--   - increment_post_view_count, join_pointstack_company_by_invite,
--     regenerate_pointstack_company_invite_code,
--     {get,save,delete,has}_shared_credentials,
--     apply_endorsement_score_delta — intentional client-callable
--     RPCs that perform their own auth checks.
--   - handle_new_user — auth.users trigger.
--   - encrypt_credential / decrypt_credential — kept executable
--     to authenticated since save/get_shared_credentials may
--     invoke them; anon access is blocked by SECURITY DEFINER
--     internal checks. Revoke separately if confirmed unneeded.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Pin search_path on every flagged function
-- ------------------------------------------------------------
ALTER FUNCTION public.update_wiki_collection_updated_at()        SET search_path = public, pg_temp;
ALTER FUNCTION public.update_facet_article_count()               SET search_path = public, pg_temp;
ALTER FUNCTION public.update_news_article_vote_count()           SET search_path = public, pg_temp;
ALTER FUNCTION public.update_news_article_comment_count()        SET search_path = public, pg_temp;
ALTER FUNCTION public.update_news_comment_vote_count()           SET search_path = public, pg_temp;
ALTER FUNCTION public.wiki_articles_search_trigger()             SET search_path = public, pg_temp;
ALTER FUNCTION public.update_tag_article_count()                 SET search_path = public, pg_temp;
ALTER FUNCTION public.update_category_article_count()            SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_timestamp()              SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_post_upvote_count()      SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_post_comment_count()     SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_comment_upvote_count()   SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_project_like_count()     SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_conversation_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION public.pointstack_update_user_reputation()        SET search_path = public, pg_temp;
ALTER FUNCTION public.update_equipment_submissions_updated_at()  SET search_path = public, pg_temp;
ALTER FUNCTION public.update_equipment_notes_updated_at()        SET search_path = public, pg_temp;
ALTER FUNCTION public.update_equipment_note_upvotes()            SET search_path = public, pg_temp;
ALTER FUNCTION public.update_resource_upvote_count()             SET search_path = public, pg_temp;
ALTER FUNCTION public.update_resource_comment_count()            SET search_path = public, pg_temp;
ALTER FUNCTION public.prevent_self_admin_elevation()             SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 2. Revoke public RPC access from trigger-only functions
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.apply_endorsement_score_delta()              FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pointstack_update_comment_upvote_count()     FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pointstack_update_conversation_timestamp()   FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pointstack_update_post_comment_count()       FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pointstack_update_post_upvote_count()        FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pointstack_update_user_post_count()          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pointstack_update_user_reputation()          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_self_admin_elevation()               FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rate_limit_babel_contributions()             FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rate_limit_equipment_submissions()           FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_babel_contribution_updated_at()       FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_equipment_note_upvotes()              FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_equipment_notes_updated_at()          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_equipment_submissions_updated_at()    FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_news_article_comment_count()          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_news_article_vote_count()             FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_news_comment_vote_count()             FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_resource_comment_count()              FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_resource_upvote_count()               FROM anon, authenticated;

-- enforce_rate_limit is called by SECURITY DEFINER trigger wrappers,
-- which inherit their own privileges. Revoking EXECUTE blocks direct
-- RPC abuse (e.g., calling it with another user's id).
REVOKE EXECUTE ON FUNCTION public.enforce_rate_limit(text, integer, integer, uuid) FROM anon, authenticated;
