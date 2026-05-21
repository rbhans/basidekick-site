-- ============================================================
-- Drop licenses table — paid product plan retired.
-- Verified zero rows before drop. Future paid features will
-- start with a fresh schema rather than carry this baggage.
-- Date: 2026-05-21
-- ============================================================

DROP INDEX IF EXISTS public.licenses_user_id_idx;
DROP INDEX IF EXISTS public.idx_licenses_user_id;
DROP INDEX IF EXISTS public.idx_licenses_order_id;
DROP INDEX IF EXISTS public.idx_licenses_key;

DROP TABLE IF EXISTS public.licenses;
