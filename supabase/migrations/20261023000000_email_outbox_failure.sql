alter table public.email_outbox add column last_error text;
alter table public.email_outbox add column last_error_at timestamptz;

create or replace function public.mark_email_sent(target_id uuid)
returns void language sql security definer set search_path='' as $$
  update public.email_outbox
  set sent_at=now(),locked_until=null,last_error=null,last_error_at=null
  where id=target_id and sent_at is null
$$;

create function public.mark_email_failed(target_id uuid, error_message text)
returns void language sql security definer set search_path='' as $$
  update public.email_outbox
  set last_error=left(error_message,500),last_error_at=now(),locked_until=now()
  where id=target_id and sent_at is null
$$;

revoke all on function public.mark_email_failed(uuid,text) from public, anon, authenticated;
grant execute on function public.mark_email_failed(uuid,text) to service_role;
