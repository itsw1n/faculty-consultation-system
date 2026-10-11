create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  event_type text not null check (event_type in ('APPROVED','REJECTED','CANCELLED','REMINDER')),
  event_key text not null unique,
  attempts int not null default 0,
  locked_until timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index email_outbox_pending_idx on public.email_outbox(created_at) where sent_at is null;
alter table public.email_outbox enable row level security;
revoke all on public.email_outbox from anon, authenticated;

create function public.queue_consultation_email()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status is distinct from old.status and new.status in ('APPROVED','REJECTED','CANCELLED') then
    insert into public.email_outbox(consultation_id,recipient_id,event_type,event_key)
    values(new.id,case when new.status='CANCELLED' then new.faculty_id else new.student_id end,
      new.status::text,new.id::text||':'||new.status::text)
    on conflict (event_key) do nothing;
  end if;
  return new;
end $$;
create trigger consultation_queue_email after update of status on public.consultations
for each row execute function public.queue_consultation_email();

create function public.queue_tomorrow_reminders()
returns integer language plpgsql security definer set search_path='' as $$
declare reminder_date date := (now() at time zone 'Asia/Manila')::date + 1; queued integer;
begin
  insert into public.email_outbox(consultation_id,recipient_id,event_type,event_key)
  select c.id, recipient, 'REMINDER', c.id::text||':REMINDER:'||recipient::text
  from public.consultations c
  join public.availability_slots s on s.id=c.availability_slot_id
  cross join lateral (values(c.student_id),(c.faculty_id)) as recipients(recipient)
  where c.status='APPROVED' and s.date=reminder_date
  on conflict (event_key) do nothing;
  get diagnostics queued = row_count;
  return queued;
end $$;

create function public.claim_email_batch(batch_size int default 25)
returns table(id uuid, recipient_email text, event_type text, consultation_date date, start_time time, end_time time)
language plpgsql security definer set search_path='' as $$
begin
  return query
  with claimed as (
    select o.id from public.email_outbox o
    join public.consultations c on c.id=o.consultation_id
    where o.sent_at is null and o.attempts<5 and (o.locked_until is null or o.locked_until<now())
      and (o.event_type<>'REMINDER' or c.status='APPROVED')
      and (o.event_type<>'APPROVED' or c.status in ('APPROVED','COMPLETED'))
      and (o.event_type<>'REJECTED' or c.status='REJECTED')
      and (o.event_type<>'CANCELLED' or c.status='CANCELLED')
    order by o.created_at,o.id limit least(greatest(batch_size,1),50) for update skip locked
  ), updated as (
    update public.email_outbox o set attempts=o.attempts+1,locked_until=now()+interval '10 minutes'
    where o.id in (select claimed.id from claimed)
    returning o.*
  )
  select u.id,p.email,u.event_type,s.date,s.start_time,s.end_time
  from updated u join public.profiles p on p.id=u.recipient_id
  join public.consultations c on c.id=u.consultation_id
  join public.availability_slots s on s.id=c.availability_slot_id
  ;
end $$;

create function public.mark_email_sent(target_id uuid)
returns void language sql security definer set search_path='' as $$
  update public.email_outbox set sent_at=now(),locked_until=null where id=target_id and sent_at is null
$$;
revoke all on function public.queue_tomorrow_reminders(), public.claim_email_batch(int), public.mark_email_sent(uuid) from public, anon, authenticated;
grant execute on function public.queue_tomorrow_reminders(), public.claim_email_batch(int), public.mark_email_sent(uuid) to service_role;
