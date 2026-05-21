-- ============================================================
-- Re-enable RLS on rate_limit_events
--
-- The original migration (20260205124500_rate_limits.sql) enabled
-- RLS but it was subsequently disabled. The table is written to
-- only via SECURITY DEFINER trigger functions, which bypass RLS
-- regardless of policies. No policies are added — anon and
-- authenticated roles have no direct access path to this table.
-- ============================================================

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
