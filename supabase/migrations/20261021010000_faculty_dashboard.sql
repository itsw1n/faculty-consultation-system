create function public.faculty_dashboard_summary()
returns table(
  pending bigint,
  open_slots bigint,
  next_open_date date,
  next_open_start_time time,
  next_open_end_time time
)
language plpgsql stable security definer set search_path = '' as $$
declare
  local_today date := (now() at time zone 'Asia/Manila')::date;
  caller uuid := (select auth.uid());
begin
  if not exists (
    select 1 from public.profiles
    where id = caller and role = 'FACULTY' and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Faculty access required';
  end if;

  return query
  select
    (select count(*) from public.consultations where faculty_id = caller and status = 'PENDING'),
    (select count(*) from public.availability_slots where faculty_id = caller and status = 'OPEN' and date >= local_today),
    next_slot.date,
    next_slot.start_time,
    next_slot.end_time
  from (select 1) anchor
  left join lateral (
    select slot.date, slot.start_time, slot.end_time
    from public.availability_slots slot
    where slot.faculty_id = caller
      and slot.status = 'OPEN'
      and slot.date >= local_today
    order by slot.date, slot.start_time, slot.id
    limit 1
  ) next_slot on true;
end $$;

revoke all on function public.faculty_dashboard_summary() from public;
grant execute on function public.faculty_dashboard_summary() to authenticated;

create function public.list_my_upcoming_consultations(result_limit int default 5)
returns table(
  id uuid,
  student_name text,
  faculty_name text,
  purpose text,
  notes text,
  consultation_status public.consultation_status,
  slot_date date,
  start_time time,
  end_time time,
  mode public.consultation_mode,
  location text,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := (select auth.uid());
begin
  if not exists (
    select 1 from public.profiles profile
    where profile.id = caller and profile.role = 'FACULTY' and profile.account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Faculty access required';
  end if;

  return query
  select
    consultation.id,
    student.full_name,
    faculty.full_name,
    consultation.purpose,
    consultation.notes,
    consultation.status,
    slot.date,
    slot.start_time,
    slot.end_time,
    slot.mode,
    slot.location,
    consultation.created_at
  from public.consultations consultation
  join public.profiles student on student.id = consultation.student_id
  join public.profiles faculty on faculty.id = consultation.faculty_id
  join public.availability_slots slot on slot.id = consultation.availability_slot_id
  where consultation.faculty_id = caller
    and consultation.status = 'APPROVED'
    and slot.date >= (now() at time zone 'Asia/Manila')::date
  order by slot.date, slot.start_time, consultation.id
  limit least(greatest(result_limit, 1), 10);
end $$;

revoke all on function public.list_my_upcoming_consultations(int) from public;
grant execute on function public.list_my_upcoming_consultations(int) to authenticated;
