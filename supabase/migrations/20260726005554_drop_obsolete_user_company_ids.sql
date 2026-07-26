-- This helper referenced the retired psk_company_members table and is no longer
-- used by any policy or client. Remove the dead RPC surface.
drop function if exists public.user_company_ids();
