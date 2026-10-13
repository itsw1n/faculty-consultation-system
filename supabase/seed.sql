-- Local development seed. This file runs only with `supabase db reset`
-- on your own machine. It is never applied to hosted environments,
-- which receive migrations only. Do not move these rows into a migration.
--
-- The wildcard allows any email domain locally so the team can sign in
-- with personal Google accounts. Strict domain checks still run in tests:
-- every pgTAP test removes this row before asserting.
insert into public.approved_email_domains (domain, note)
values ('*', 'LOCAL DEV ONLY - allow any email domain')
on conflict (domain) do nothing;
