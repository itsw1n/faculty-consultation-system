create function public.student_dashboard_summary()
returns table (
  pending bigint,
  upcoming bigint,
  completed bigint,
  next_consultation_id uuid,
  next_faculty_name text,
  next_faculty_department text,
  next_purpose text,
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
    select 1
    from public.profiles
    where id = caller
      and role = 'STUDENT'
      and account_status = 'APPROVED'
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
    next_step.purpose,
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
      c.purpose,
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

revoke all on function public.student_dashboard_summary() from public;
grant execute on function public.student_dashboard_summary() to authenticated;
