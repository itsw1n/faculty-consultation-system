create or replace function public.mark_email_failed(target_id uuid, error_message text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.email_outbox
  set last_error = left(error_message, 500),
      last_error_at = now(),
      locked_until = now() + interval '10 minutes'
  where id = target_id and sent_at is null
$$;

revoke all on function public.mark_email_failed(uuid, text) from public, anon, authenticated;
grant execute on function public.mark_email_failed(uuid, text) to service_role;
