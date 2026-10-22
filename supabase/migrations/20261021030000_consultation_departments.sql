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
  purpose text,
  notes text,
  consultation_status public.consultation_status,
  slot_date date,
  start_time time,
  end_time time,
  mode public.consultation_mode,
  location text,
  created_at timestamptz,
  student_department text,
  faculty_department text
)
language sql stable security definer set search_path = '' as $$
select
  consultation.id,
  student.full_name,
  faculty.full_name,
  case when public.is_admin() then consultation.category else consultation.purpose end,
  case when public.is_admin() then null else consultation.notes end,
  consultation.status,
  slot.date,
  slot.start_time,
  slot.end_time,
  slot.mode,
  slot.location,
  consultation.created_at,
  student_department.name,
  faculty_department.name
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
    or (not public.is_admin() and consultation.purpose ilike '%' || search_text || '%')
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
