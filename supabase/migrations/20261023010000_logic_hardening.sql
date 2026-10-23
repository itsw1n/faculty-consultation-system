create function public.slot_starts_in_future(target_date date, target_start_time time)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_date > (now() at time zone 'Asia/Manila')::date
    or (
      target_date = (now() at time zone 'Asia/Manila')::date
      and target_start_time > (now() at time zone 'Asia/Manila')::time
    )
$$;

create function public.slot_ends_in_future(target_date date, target_end_time time)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_date > (now() at time zone 'Asia/Manila')::date
    or (
      target_date = (now() at time zone 'Asia/Manila')::date
      and target_end_time > (now() at time zone 'Asia/Manila')::time
    )
$$;

create function public.slot_has_history(target_slot_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.consultations where availability_slot_id = target_slot_id
  )
$$;

create function public.require_approved_faculty()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'FACULTY'
      and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Approved faculty access required';
  end if;
end;
$$;

revoke all on function public.slot_starts_in_future(date, time) from public, anon, authenticated;
revoke all on function public.slot_ends_in_future(date, time) from public, anon, authenticated;
revoke all on function public.slot_has_history(uuid) from public, anon, authenticated;
revoke all on function public.require_approved_faculty() from public, anon, authenticated;

create or replace function public.create_availability(
  slot_date date,
  slot_start_time time,
  slot_end_time time,
  slot_mode public.consultation_mode,
  slot_location text default null,
  slot_meeting_link text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_slot_id uuid;
  faculty_user_id uuid := (select auth.uid());
begin
  perform public.require_approved_faculty();
  if slot_date is null
    or slot_start_time is null
    or slot_end_time is null
    or not public.slot_starts_in_future(slot_date, slot_start_time) then
    raise exception using errcode = '22023', message = 'Availability must start in the future';
  end if;
  insert into public.availability_slots (
    faculty_id, date, start_time, end_time, mode, location, meeting_link
  )
  values (
    faculty_user_id,
    slot_date,
    slot_start_time,
    slot_end_time,
    slot_mode,
    nullif(btrim(slot_location), ''),
    nullif(btrim(slot_meeting_link), '')
  )
  returning id into new_slot_id;
  return new_slot_id;
end;
$$;

create or replace function public.update_open_availability(
  target_slot_id uuid,
  slot_date date,
  slot_start_time time,
  slot_end_time time,
  slot_mode public.consultation_mode,
  slot_location text default null,
  slot_meeting_link text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_approved_faculty();
  if slot_date is null
    or slot_start_time is null
    or slot_end_time is null
    or not public.slot_starts_in_future(slot_date, slot_start_time) then
    raise exception using errcode = '22023', message = 'Availability must start in the future';
  end if;
  if not exists (
    select 1 from public.availability_slots
    where id = target_slot_id
      and faculty_id = (select auth.uid())
      and status = 'OPEN'
  ) then
    raise exception using errcode = '23514', message = 'Open availability not found';
  end if;
  if public.slot_has_history(target_slot_id) then
    raise exception using errcode = '23514', message = 'Availability has consultation history';
  end if;
  update public.availability_slots
  set date = slot_date,
      start_time = slot_start_time,
      end_time = slot_end_time,
      mode = slot_mode,
      location = nullif(btrim(slot_location), ''),
      meeting_link = nullif(btrim(slot_meeting_link), '')
  where id = target_slot_id
    and faculty_id = (select auth.uid())
    and status = 'OPEN';
  if not found then
    raise exception using errcode = '23514', message = 'Open availability not found';
  end if;
end;
$$;

create or replace function public.delete_open_availability(target_slot_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_approved_faculty();
  if not exists (
    select 1 from public.availability_slots
    where id = target_slot_id
      and faculty_id = (select auth.uid())
      and status = 'OPEN'
  ) then
    raise exception using errcode = '23514', message = 'Open availability not found';
  end if;
  if public.slot_has_history(target_slot_id) then
    raise exception using errcode = '23514', message = 'Availability has consultation history';
  end if;
  delete from public.availability_slots
  where id = target_slot_id
    and faculty_id = (select auth.uid())
    and status = 'OPEN';
  if not found then
    raise exception using errcode = '23514', message = 'Open availability not found';
  end if;
end;
$$;

create or replace function public.book_consultation(
  target_slot_id uuid,
  consultation_category text,
  consultation_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_user_id uuid := (select auth.uid());
  selected_slot public.availability_slots%rowtype;
  consultation_id uuid;
begin
  if not exists (
    select 1 from public.profiles
    where id = student_user_id
      and role = 'STUDENT'
      and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Approved student access required';
  end if;
  if consultation_category not in ('GRADE', 'CAPSTONE', 'ACADEMIC', 'PERSONAL', 'OTHER')
    or char_length(coalesce(consultation_notes, '')) > 2000 then
    raise exception using errcode = '22023', message = 'Invalid consultation details';
  end if;
  update public.availability_slots slot
  set status = 'RESERVED'
  where slot.id = target_slot_id
    and slot.status = 'OPEN'
    and public.slot_starts_in_future(slot.date, slot.start_time)
    and exists (
      select 1 from public.profiles owner
      where owner.id = slot.faculty_id
        and owner.role = 'FACULTY'
        and owner.account_status = 'APPROVED'
    )
  returning * into selected_slot;
  if not found then
    raise exception using errcode = '40001', message = 'Slot is no longer available';
  end if;
  insert into public.consultations(
    student_id, faculty_id, availability_slot_id, category, notes
  )
  values (
    student_user_id,
    selected_slot.faculty_id,
    selected_slot.id,
    consultation_category,
    nullif(btrim(consultation_notes), '')
  )
  returning id into consultation_id;
  insert into public.notifications(
    recipient_id, type, title, message, entity_type, entity_id
  )
  values (
    selected_slot.faculty_id,
    'CONSULTATION_REQUEST',
    'New consultation request',
    'A student requested one of your available time slots.',
    'consultation',
    consultation_id
  );
  return consultation_id;
end;
$$;

create or replace function public.list_faculty_slots(
  target_faculty_id uuid,
  range_start date,
  range_end date
)
returns table (
  id uuid,
  slot_date date,
  start_time time,
  end_time time,
  slot_status public.availability_status,
  mode public.consultation_mode,
  location text,
  faculty_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.date, s.start_time, s.end_time, s.status, s.mode, s.location, p.full_name
  from public.availability_slots s
  join public.profiles p on p.id = s.faculty_id
  where s.faculty_id = target_faculty_id
    and s.date between range_start and range_end
    and public.slot_starts_in_future(s.date, s.start_time)
    and exists (
      select 1 from public.profiles viewer
      where viewer.id = (select auth.uid())
        and viewer.role = 'STUDENT'
        and viewer.account_status = 'APPROVED'
    )
  order by s.date, s.start_time
$$;

drop function if exists public.list_own_availability();

create function public.list_own_availability()
returns table (
  id uuid,
  date date,
  start_time time,
  end_time time,
  status public.availability_status,
  mode public.consultation_mode,
  location text,
  meeting_link text,
  student_name text,
  category text,
  has_history boolean
)
language sql
stable
security definer
set search_path = ''
as $$
select
  slot.id,
  slot.date,
  slot.start_time,
  slot.end_time,
  slot.status,
  slot.mode,
  slot.location,
  slot.meeting_link,
  student.full_name,
  consultation.category,
  exists (
    select 1 from public.consultations history
    where history.availability_slot_id = slot.id
  ) as has_history
from public.availability_slots slot
left join public.consultations consultation
  on consultation.availability_slot_id = slot.id
  and consultation.status in ('PENDING', 'APPROVED')
left join public.profiles student on student.id = consultation.student_id
where slot.faculty_id = (select auth.uid())
  and public.slot_starts_in_future(slot.date, slot.start_time)
  and exists (
    select 1 from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'FACULTY'
      and profile.account_status = 'APPROVED'
  )
order by slot.date, slot.start_time
limit 100
$$;

drop function if exists public.search_my_consultations(
  text,
  public.consultation_status,
  timestamptz,
  uuid,
  int
);

create function public.search_my_consultations(
  search_text text default '',
  status_filter public.consultation_status default null,
  cursor_created_at timestamptz default null,
  cursor_id uuid default null,
  result_limit int default 20
)
returns table(
  id uuid,
  student_name text,
  faculty_name text,
  category text,
  notes text,
  consultation_status public.consultation_status,
  slot_date date,
  start_time time,
  end_time time,
  mode public.consultation_mode,
  location text,
  meeting_link text,
  created_at timestamptz,
  student_department text,
  faculty_department text,
  outcome text
)
language sql
stable
security definer
set search_path = ''
as $$
select
  consultation.id,
  student.full_name,
  faculty.full_name,
  consultation.category,
  case when public.is_admin() then null else consultation.notes end,
  consultation.status,
  slot.date,
  slot.start_time,
  slot.end_time,
  slot.mode,
  slot.location,
  case when public.is_admin() then null else slot.meeting_link end,
  consultation.created_at,
  student_department.name,
  faculty_department.name,
  case when public.is_admin() then null else consultation.outcome end
from public.consultations consultation
join public.profiles student on student.id = consultation.student_id
join public.profiles faculty on faculty.id = consultation.faculty_id
join public.availability_slots slot on slot.id = consultation.availability_slot_id
left join public.departments student_department on student_department.id = student.department_id
left join public.departments faculty_department on faculty_department.id = faculty.department_id
where (
    consultation.student_id = (select auth.uid())
    or consultation.faculty_id = (select auth.uid())
    or public.is_admin()
  )
  and (status_filter is null or consultation.status = status_filter)
  and (
    search_text = ''
    or consultation.category ilike '%' || search_text || '%'
    or student.full_name ilike '%' || search_text || '%'
    or faculty.full_name ilike '%' || search_text || '%'
  )
  and (
    cursor_created_at is null
    or (consultation.created_at, consultation.id) < (cursor_created_at, cursor_id)
  )
order by consultation.created_at desc, consultation.id desc
limit least(greatest(result_limit, 1), 50)
$$;

drop function if exists public.list_my_upcoming_consultations(int);

create function public.list_my_upcoming_consultations(result_limit int default 5)
returns table(
  id uuid,
  student_name text,
  faculty_name text,
  category text,
  notes text,
  consultation_status public.consultation_status,
  slot_date date,
  start_time time,
  end_time time,
  mode public.consultation_mode,
  location text,
  meeting_link text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if not exists (
    select 1 from public.profiles profile
    where profile.id = caller
      and profile.role = 'FACULTY'
      and profile.account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Faculty access required';
  end if;

  return query
  select
    consultation.id,
    student.full_name,
    faculty.full_name,
    consultation.category,
    consultation.notes,
    consultation.status,
    slot.date,
    slot.start_time,
    slot.end_time,
    slot.mode,
    slot.location,
    slot.meeting_link,
    consultation.created_at
  from public.consultations consultation
  join public.profiles student on student.id = consultation.student_id
  join public.profiles faculty on faculty.id = consultation.faculty_id
  join public.availability_slots slot on slot.id = consultation.availability_slot_id
  where consultation.faculty_id = caller
    and consultation.status = 'APPROVED'
    and public.slot_ends_in_future(slot.date, slot.end_time)
  order by slot.date, slot.start_time, consultation.id
  limit least(greatest(result_limit, 1), 10);
end;
$$;

drop function if exists public.get_consultation_detail(uuid);

create function public.get_consultation_detail(target_id uuid)
returns table(
  id uuid,
  student_name text,
  faculty_name text,
  category text,
  description text,
  outcome text,
  consultation_status public.consultation_status,
  slot_date date,
  start_time time,
  end_time time,
  mode public.consultation_mode,
  location text,
  meeting_link text
)
language sql
stable
security definer
set search_path = ''
as $$
select
  consultation.id,
  student.full_name,
  faculty.full_name,
  consultation.category,
  case when public.is_admin() then null else consultation.notes end,
  case when public.is_admin() then null else consultation.outcome end,
  consultation.status,
  slot.date,
  slot.start_time,
  slot.end_time,
  slot.mode,
  slot.location,
  slot.meeting_link
from public.consultations consultation
join public.profiles student on student.id = consultation.student_id
join public.profiles faculty on faculty.id = consultation.faculty_id
join public.availability_slots slot on slot.id = consultation.availability_slot_id
where consultation.id = target_id
  and (
    consultation.student_id = (select auth.uid())
    or consultation.faculty_id = (select auth.uid())
  )
  and exists (
    select 1 from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.account_status = 'APPROVED'
  )
$$;

create or replace function public.consultation_summary(start_date date, end_date date)
returns table(
  slot_date date,
  department text,
  category text,
  status public.consultation_status,
  total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if start_date is null
    or end_date is null
    or end_date < start_date
    or end_date > start_date + 365 then
    raise exception using errcode = '22023', message = 'Invalid date range';
  end if;
  return query
  select
    slot.date,
    coalesce(department.code, 'UNASSIGNED'),
    consultation.category,
    consultation.status,
    count(*)
  from public.consultations consultation
  join public.availability_slots slot on slot.id = consultation.availability_slot_id
  join public.profiles student on student.id = consultation.student_id
  left join public.departments department on department.id = student.department_id
  where slot.date between start_date and end_date
  group by slot.date, department.code, consultation.category, consultation.status
  order by slot.date, department.code, consultation.category, consultation.status;
end;
$$;

create or replace function public.faculty_dashboard_summary()
returns table(
  pending bigint,
  open_slots bigint,
  next_open_date date,
  next_open_start_time time,
  next_open_end_time time
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if not exists (
    select 1 from public.profiles
    where id = caller
      and role = 'FACULTY'
      and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Faculty access required';
  end if;

  return query
  select
    (select count(*) from public.consultations where faculty_id = caller and status = 'PENDING'),
    (
      select count(*)
      from public.availability_slots
      where faculty_id = caller
        and status = 'OPEN'
        and public.slot_starts_in_future(date, start_time)
    ),
    next_slot.date,
    next_slot.start_time,
    next_slot.end_time
  from (select 1) anchor
  left join lateral (
    select slot.date, slot.start_time, slot.end_time
    from public.availability_slots slot
    where slot.faculty_id = caller
      and slot.status = 'OPEN'
      and public.slot_starts_in_future(slot.date, slot.start_time)
    order by slot.date, slot.start_time, slot.id
    limit 1
  ) next_slot on true;
end;
$$;

create or replace function public.admin_dashboard_summary()
returns table(
  students bigint,
  faculty bigint,
  consultations bigint,
  pending bigint,
  approved bigint,
  completed bigint,
  rejected bigint,
  cancelled bigint,
  open_slots bigint,
  faculty_without_future_slots bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;

  return query
  select
    (select count(*) from public.profiles where role = 'STUDENT' and account_status = 'APPROVED'),
    (select count(*) from public.profiles where role = 'FACULTY' and account_status = 'APPROVED'),
    (select count(*) from public.consultations),
    (select count(*) from public.consultations where status = 'PENDING'),
    (select count(*) from public.consultations where status = 'APPROVED'),
    (select count(*) from public.consultations where status = 'COMPLETED'),
    (select count(*) from public.consultations where status = 'REJECTED'),
    (select count(*) from public.consultations where status = 'CANCELLED'),
    (
      select count(*)
      from public.availability_slots
      where status = 'OPEN'
        and public.slot_starts_in_future(date, start_time)
    ),
    (
      select count(*)
      from public.profiles faculty_profile
      where faculty_profile.role = 'FACULTY'
        and faculty_profile.account_status = 'APPROVED'
        and not exists (
          select 1
          from public.availability_slots slot
          where slot.faculty_id = faculty_profile.id
            and slot.status in ('OPEN', 'RESERVED', 'BOOKED')
            and public.slot_ends_in_future(slot.date, slot.end_time)
        )
    );
end;
$$;

revoke all on function public.create_availability(date, time, time, public.consultation_mode, text, text) from public;
revoke all on function public.update_open_availability(uuid, date, time, time, public.consultation_mode, text, text) from public;
revoke all on function public.delete_open_availability(uuid) from public;
revoke all on function public.book_consultation(uuid, text, text) from public;
revoke all on function public.list_faculty_slots(uuid, date, date) from public;
revoke all on function public.list_own_availability() from public;
revoke all on function public.search_my_consultations(text, public.consultation_status, timestamptz, uuid, int) from public;
revoke all on function public.list_my_upcoming_consultations(int) from public;
revoke all on function public.get_consultation_detail(uuid) from public;
revoke all on function public.consultation_summary(date, date) from public;
revoke all on function public.faculty_dashboard_summary() from public;
revoke all on function public.admin_dashboard_summary() from public;

grant execute on function public.create_availability(date, time, time, public.consultation_mode, text, text) to authenticated;
grant execute on function public.update_open_availability(uuid, date, time, time, public.consultation_mode, text, text) to authenticated;
grant execute on function public.delete_open_availability(uuid) to authenticated;
grant execute on function public.book_consultation(uuid, text, text) to authenticated;
grant execute on function public.list_faculty_slots(uuid, date, date) to authenticated;
grant execute on function public.list_own_availability() to authenticated;
grant execute on function public.search_my_consultations(text, public.consultation_status, timestamptz, uuid, int) to authenticated;
grant execute on function public.list_my_upcoming_consultations(int) to authenticated;
grant execute on function public.get_consultation_detail(uuid) to authenticated;
grant execute on function public.consultation_summary(date, date) to authenticated;
grant execute on function public.faculty_dashboard_summary() to authenticated;
grant execute on function public.admin_dashboard_summary() to authenticated;
