-- Remove legacy application, invitation, and duplicate consultation fields.

drop function if exists public.review_applications(uuid[], public.account_status);
drop function if exists public.review_application(uuid, public.account_status);
drop function if exists public.submit_application(public.user_role, uuid, text);
drop function if exists public.invite_faculty(text[], uuid, text);
drop function if exists public.list_faculty(text, uuid, int);
drop function if exists public.list_open_faculty_slots(uuid, date, date);
drop function if exists public.list_my_consultations(public.consultation_status, int);
drop function if exists public.complete_consultation(uuid);

drop function if exists public.list_application_page(
  text,
  public.account_status,
  public.user_role,
  uuid,
  timestamptz,
  uuid,
  int
);
drop function if exists public.list_faculty_page(text, uuid, text, uuid, int);
drop function if exists public.book_consultation(uuid, text, text);
drop function if exists public.search_my_consultations(
  text,
  public.consultation_status,
  timestamptz,
  uuid,
  int
);
drop function if exists public.list_my_upcoming_consultations(int);
drop function if exists public.list_own_availability();
drop function if exists public.student_dashboard_summary();

alter table public.profiles add column position_title text;

update public.profiles profile
set position_title = faculty_profile.position_title
from public.faculty_profiles faculty_profile
where faculty_profile.user_id = profile.id
  and profile.role = 'FACULTY';

update public.profiles
set position_title = 'Faculty'
where role = 'FACULTY'
  and position_title is null;

update public.profiles
set position_title = null
where role is distinct from 'FACULTY';

alter table public.profiles add constraint profiles_position_title_check check (
  (
    role = 'FACULTY'
    and position_title is not null
    and char_length(btrim(position_title)) between 1 and 120
  )
  or (role is distinct from 'FACULTY' and position_title is null)
);

drop index if exists public.profiles_application_queue_idx;
alter table public.profiles drop column avatar_url;
alter table public.profiles drop column requested_role;
alter table public.consultations drop column purpose;
alter table public.approved_email_domains drop column note;

create index profiles_application_queue_idx
  on public.profiles (account_status, role, department_id, created_at desc);

drop table public.faculty_profiles;
drop table public.faculty_invites;
drop table public.examples;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_approved_email(new.email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;

  insert into public.profiles (id, email, full_name, role, account_status)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'STUDENT',
    'APPROVED'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.promote_registered_faculty(
  target_email text,
  new_department_id uuid,
  new_position_title text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles%rowtype;
  normalized_email text := lower(btrim(target_email));
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if not public.is_approved_email(normalized_email) then
    return 'DOMAIN_NOT_ALLOWED';
  end if;
  if not exists (select 1 from public.departments where id = new_department_id) then
    raise exception using errcode = '23503', message = 'Invalid department';
  end if;
  if new_position_title is null or char_length(btrim(new_position_title)) not between 1 and 120 then
    raise exception using errcode = '22023', message = 'Faculty position is required';
  end if;

  select * into target
  from public.profiles
  where lower(email) = normalized_email
  for update;
  if not found then return 'NOT_REGISTERED'; end if;
  if target.role = 'FACULTY' and target.account_status = 'APPROVED' then
    return 'ALREADY_FACULTY';
  end if;
  if target.role <> 'STUDENT' or target.account_status <> 'APPROVED' then
    return 'NOT_ELIGIBLE';
  end if;
  if not exists (
    select 1 from auth.users
    where id = target.id and email_confirmed_at is not null
  ) then
    return 'NOT_VERIFIED';
  end if;

  update public.profiles
  set role = 'FACULTY',
      department_id = new_department_id,
      position_title = btrim(new_position_title)
  where id = target.id;
  return 'PROMOTED';
end;
$$;

create or replace function public.correct_user_account(
  target_user_id uuid,
  new_role public.user_role,
  new_department_id uuid,
  position_title text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles%rowtype;
  new_position_title text;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception using errcode = '42501', message = 'You cannot change your own account';
  end if;
  if new_role not in ('STUDENT', 'FACULTY') then
    raise exception using errcode = '22023', message = 'Invalid role';
  end if;
  if not exists (select 1 from public.departments where id = new_department_id) then
    raise exception using errcode = '23503', message = 'Invalid department';
  end if;

  select * into target from public.profiles where id = target_user_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Account not found';
  end if;
  if target.account_status <> 'APPROVED' or target.role = 'ADMIN' then
    raise exception using errcode = '23514', message = 'This account cannot be edited here';
  end if;
  if not public.is_approved_email(target.email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;
  if new_role = 'FACULTY' and not exists (
    select 1 from auth.users where id = target_user_id and email_confirmed_at is not null
  ) then
    raise exception using errcode = '23514', message = 'Email verification is required';
  end if;
  if target.role = 'FACULTY' and new_role = 'STUDENT' and (
    exists (
      select 1 from public.consultations
      where faculty_id = target_user_id and status in ('PENDING', 'APPROVED')
    )
    or exists (
      select 1 from public.availability_slots
      where faculty_id = target_user_id and date >= current_date
        and status in ('OPEN', 'RESERVED', 'BOOKED')
    )
  ) then
    raise exception using errcode = '23514', message = 'Resolve active Faculty work first';
  end if;

  if new_role = 'FACULTY' then
    if position_title is null or btrim(position_title) = '' then
      if target.role <> 'FACULTY' or target.position_title is null then
        raise exception using errcode = '22023', message = 'Faculty position is required';
      end if;
      new_position_title := target.position_title;
    else
      if char_length(btrim(position_title)) not between 1 and 120 then
        raise exception using errcode = '22023', message = 'Invalid faculty position';
      end if;
      new_position_title := btrim(position_title);
    end if;
  else
    new_position_title := null;
  end if;

  update public.profiles
  set role = new_role,
      department_id = new_department_id,
      position_title = new_position_title
  where id = target_user_id;
end;
$$;

create function public.list_application_page(
  search_text text default '',
  status_filter public.account_status default null,
  role_filter public.user_role default null,
  department_filter uuid default null,
  cursor_created_at timestamptz default null,
  cursor_id uuid default null,
  result_limit int default 20
)
returns table(
  id uuid,
  full_name text,
  email text,
  account_status public.account_status,
  department_name text,
  created_at timestamptz,
  role public.user_role,
  department_id uuid,
  position_title text
)
language sql
stable
security definer
set search_path = ''
as $$
select
  p.id,
  p.full_name,
  p.email,
  p.account_status,
  d.name,
  p.created_at,
  p.role,
  p.department_id,
  p.position_title
from public.profiles p
left join public.departments d on d.id = p.department_id
where public.is_admin()
  and (status_filter is null or p.account_status = status_filter)
  and (role_filter is null or p.role = role_filter)
  and (department_filter is null or p.department_id = department_filter)
  and (search_text = '' or p.full_name ilike '%' || search_text || '%' or p.email ilike '%' || search_text || '%')
  and (cursor_created_at is null or (p.created_at, p.id) < (cursor_created_at, cursor_id))
order by p.created_at desc, p.id desc
limit least(greatest(result_limit, 1), 50)
$$;

create function public.list_faculty_page(
  faculty_search text default '',
  department_filter uuid default null,
  cursor_name text default null,
  cursor_id uuid default null,
  result_limit int default 20
)
returns table(id uuid, full_name text, department_name text, position_title text)
language sql
stable
security definer
set search_path = ''
as $$
select p.id, p.full_name, d.name, p.position_title
from public.profiles p
join public.departments d on d.id = p.department_id
where p.role = 'FACULTY' and p.account_status = 'APPROVED'
  and exists (
    select 1 from public.profiles viewer
    where viewer.id = (select auth.uid()) and viewer.account_status = 'APPROVED'
  )
  and (department_filter is null or p.department_id = department_filter)
  and (faculty_search = '' or p.full_name ilike '%' || faculty_search || '%')
  and (cursor_name is null or (lower(p.full_name), p.id) > (lower(cursor_name), cursor_id))
order by lower(p.full_name), p.id
limit least(greatest(result_limit, 1), 50)
$$;

create function public.book_consultation(
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
    where id = student_user_id and role = 'STUDENT' and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Approved student access required';
  end if;
  if consultation_category not in ('GRADE', 'CAPSTONE', 'ACADEMIC', 'PERSONAL', 'OTHER')
    or char_length(coalesce(consultation_notes, '')) > 2000 then
    raise exception using errcode = '22023', message = 'Invalid consultation details';
  end if;
  update public.availability_slots
  set status = 'RESERVED'
  where id = target_slot_id and status = 'OPEN'
  returning * into selected_slot;
  if not found then
    raise exception using errcode = '40001', message = 'Slot is no longer available';
  end if;
  insert into public.consultations(student_id, faculty_id, availability_slot_id, category, notes)
  values (
    student_user_id,
    selected_slot.faculty_id,
    selected_slot.id,
    consultation_category,
    nullif(btrim(consultation_notes), '')
  )
  returning id into consultation_id;
  insert into public.notifications(recipient_id, type, title, message, entity_type, entity_id)
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
    where profile.id = caller and profile.role = 'FACULTY' and profile.account_status = 'APPROVED'
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
end;
$$;

create function public.list_own_availability()
returns table(
  id uuid,
  date date,
  start_time time,
  end_time time,
  status public.availability_status,
  mode public.consultation_mode,
  location text,
  meeting_link text,
  student_name text,
  category text
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
  consultation.category
from public.availability_slots slot
left join public.consultations consultation
  on consultation.availability_slot_id = slot.id
  and consultation.status in ('PENDING', 'APPROVED')
left join public.profiles student on student.id = consultation.student_id
where slot.faculty_id = (select auth.uid())
  and exists (
    select 1 from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'FACULTY'
      and profile.account_status = 'APPROVED'
  )
  and slot.date >= current_date
order by slot.date, slot.start_time
limit 100
$$;

create function public.student_dashboard_summary()
returns table(
  pending bigint,
  upcoming bigint,
  completed bigint,
  next_consultation_id uuid,
  next_faculty_name text,
  next_faculty_department text,
  next_category text,
  next_slot_date date,
  next_start_time time,
  next_end_time time,
  next_mode public.consultation_mode,
  next_location text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  local_now timestamp := (now() at time zone 'Asia/Manila');
  local_date date := local_now::date;
  local_time time := local_now::time;
begin
  if not exists (
    select 1 from public.profiles
    where id = caller and role = 'STUDENT' and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Student access required';
  end if;

  return query
  select
    (select count(*) from public.consultations c where c.student_id = caller and c.status = 'PENDING'),
    (
      select count(*)
      from public.consultations c
      join public.availability_slots s on s.id = c.availability_slot_id
      where c.student_id = caller
        and c.status = 'APPROVED'
        and (s.date > local_date or (s.date = local_date and s.end_time > local_time))
    ),
    (select count(*) from public.consultations c where c.student_id = caller and c.status = 'COMPLETED'),
    next_step.id,
    next_step.faculty_name,
    next_step.faculty_department,
    next_step.category,
    next_step.slot_date,
    next_step.start_time,
    next_step.end_time,
    next_step.mode,
    next_step.location
  from (select 1) anchor
  left join lateral (
    select
      c.id,
      faculty.full_name as faculty_name,
      department.name as faculty_department,
      c.category,
      s.date as slot_date,
      s.start_time,
      s.end_time,
      s.mode,
      s.location
    from public.consultations c
    join public.profiles faculty on faculty.id = c.faculty_id
    left join public.departments department on department.id = faculty.department_id
    join public.availability_slots s on s.id = c.availability_slot_id
    where c.student_id = caller
      and c.status = 'APPROVED'
      and (s.date > local_date or (s.date = local_date and s.end_time > local_time))
    order by s.date, s.start_time, c.id
    limit 1
  ) next_step on true;
end;
$$;

revoke all on function public.list_application_page(
  text,
  public.account_status,
  public.user_role,
  uuid,
  timestamptz,
  uuid,
  int
) from public;
grant execute on function public.list_application_page(
  text,
  public.account_status,
  public.user_role,
  uuid,
  timestamptz,
  uuid,
  int
) to authenticated;

revoke all on function public.list_faculty_page(text, uuid, text, uuid, int) from public;
grant execute on function public.list_faculty_page(text, uuid, text, uuid, int) to authenticated;

revoke all on function public.book_consultation(uuid, text, text) from public;
grant execute on function public.book_consultation(uuid, text, text) to authenticated;

revoke all on function public.search_my_consultations(
  text,
  public.consultation_status,
  timestamptz,
  uuid,
  int
) from public;
grant execute on function public.search_my_consultations(
  text,
  public.consultation_status,
  timestamptz,
  uuid,
  int
) to authenticated;

revoke all on function public.list_my_upcoming_consultations(int) from public;
grant execute on function public.list_my_upcoming_consultations(int) to authenticated;

revoke all on function public.list_own_availability() from public;
grant execute on function public.list_own_availability() to authenticated;

revoke all on function public.student_dashboard_summary() from public;
grant execute on function public.student_dashboard_summary() to authenticated;
