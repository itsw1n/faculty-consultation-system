create function public.export_my_faculty_consultations(
  from_date date,
  to_date date
)
returns table(
  consultation_id uuid,
  student_name text,
  category text,
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
  caller_faculty_id uuid := (select auth.uid());
begin
  if caller_faculty_id is null or not exists (
    select 1
    from public.profiles profile
    where profile.id = caller_faculty_id
      and profile.role = 'FACULTY'
      and profile.account_status = 'APPROVED'
  ) then
    raise exception using errcode = '42501', message = 'Approved faculty access required';
  end if;

  if from_date is null or to_date is null or from_date > to_date or to_date - from_date > 365 then
    raise exception using errcode = '22023', message = 'Invalid consultation export date range';
  end if;

  return query
  select
    consultation.id,
    student.full_name,
    consultation.category,
    consultation.status,
    slot.date,
    slot.start_time,
    slot.end_time,
    slot.mode,
    slot.location,
    consultation.created_at
  from public.consultations consultation
  join public.profiles student on student.id = consultation.student_id
  join public.availability_slots slot on slot.id = consultation.availability_slot_id
  where consultation.faculty_id = caller_faculty_id
    and slot.date between from_date and to_date
  order by slot.date desc, slot.start_time desc, consultation.id desc;
end;
$$;

revoke all on function public.export_my_faculty_consultations(date, date) from public, anon;
grant execute on function public.export_my_faculty_consultations(date, date) to authenticated;
