-- Supabase grants function execution to API roles by default. Explicitly
-- remove those grants for databases that installed the preceding migration.
revoke all on function public.claim_first_admin(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_first_admin(uuid, text) to service_role;
