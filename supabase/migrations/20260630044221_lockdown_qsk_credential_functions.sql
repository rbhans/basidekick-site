-- ============================================================
-- CRITICAL: lock down the legacy QR Sidekick (qsk) credential functions.
-- ============================================================
-- get/save/delete/has_shared_credentials and encrypt/decrypt_credential are
-- SECURITY DEFINER (owner postgres) and were EXECUTE-able by anon + authenticated.
-- SECURITY DEFINER bypasses RLS, and these functions do NOT re-check
-- authorization, so any caller (even anonymous, via the public anon key) could:
--   - get_shared_credentials(<station_id>)    -> decrypted username/password for ANY station
--   - save_shared_credentials(...)            -> overwrite ANY station's credentials
--   - delete_shared_credentials(<station_id>) -> wipe ANY station's credentials
--   - decrypt_credential(<ciphertext>)        -> decrypt arbitrary ciphertext with the server key
--
-- QR Sidekick no longer uses this Supabase project (it is now a self-hosted,
-- separate open-source app), so NO live consumer needs these functions. The
-- safest fix is to revoke direct execution from both client roles entirely;
-- only service_role (server-side, RLS-exempt) retains access.
--
-- Guarded with to_regprocedure(...) so it is a no-op on databases where these
-- legacy objects do not exist (e.g. a fresh rebuild from migrations).
-- ============================================================

DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.get_shared_credentials(uuid)',
    'public.save_shared_credentials(uuid, text, text)',
    'public.delete_shared_credentials(uuid)',
    'public.has_shared_credentials(uuid)',
    'public.encrypt_credential(text)',
    'public.decrypt_credential(text)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn);
    END IF;
  END LOOP;
END $$;
