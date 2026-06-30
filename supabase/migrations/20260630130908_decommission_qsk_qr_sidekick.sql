-- ============================================================
-- Decommission the legacy QR Sidekick (qsk) subsystem.
-- ============================================================
-- QR Sidekick is now a separate, self-hosted open-source project and no longer
-- uses this Supabase project. The qsk_* tables and their credential functions
-- are dead, and were the source of the critical credential-exposure finding
-- (anon/authenticated could call the SECURITY DEFINER credential functions).
-- Dropping them removes the attack surface entirely.
--
-- NOTE: the QR Sidekick listing on the tools/community page is app content and
-- is unaffected by this migration.
-- ============================================================

DROP TABLE IF EXISTS public.qsk_equipment_configs CASCADE;
DROP TABLE IF EXISTS public.qsk_station_credentials CASCADE;
DROP TABLE IF EXISTS public.qsk_invitations CASCADE;
DROP TABLE IF EXISTS public.qsk_stations CASCADE;
DROP TABLE IF EXISTS public.qsk_organization_members CASCADE;
DROP TABLE IF EXISTS public.qsk_organizations CASCADE;

DROP FUNCTION IF EXISTS public.get_shared_credentials(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.save_shared_credentials(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.delete_shared_credentials(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_shared_credentials(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.encrypt_credential(text) CASCADE;
DROP FUNCTION IF EXISTS public.decrypt_credential(text) CASCADE;
DROP FUNCTION IF EXISTS public.qsk_is_org_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.qsk_is_station_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.qsk_user_org_ids() CASCADE;
DROP FUNCTION IF EXISTS public.qsk_user_station_ids() CASCADE;
DROP FUNCTION IF EXISTS public.qsk_update_updated_at() CASCADE;
