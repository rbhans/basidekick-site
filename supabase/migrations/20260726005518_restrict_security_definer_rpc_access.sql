-- Keep internal helpers off the public RPC surface while preserving the
-- client-facing PointStack functions used by the current and replacement apps.
revoke all on function public.enforce_rate_limit(text, integer, integer, uuid)
  from public, anon, authenticated;

revoke all on function public.join_pointstack_company_by_invite(text)
  from public, anon;
grant execute on function public.join_pointstack_company_by_invite(text)
  to authenticated;

revoke all on function public.regenerate_pointstack_company_invite_code(uuid)
  from public, anon;
grant execute on function public.regenerate_pointstack_company_invite_code(uuid)
  to authenticated;

revoke all on function public.user_company_ids()
  from public, anon;
grant execute on function public.user_company_ids()
  to authenticated;
