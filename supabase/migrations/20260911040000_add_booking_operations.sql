create function public.list_faculty(faculty_search text default '', department_filter uuid default null, result_limit int default 20)
returns table (id uuid, full_name text, avatar_url text, department_id uuid, department_code text, department_name text, position_title text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.department_id, d.code, d.name, fp.position_title
  from public.profiles p join public.faculty_profiles fp on fp.user_id = p.id join public.departments d on d.id = p.department_id
  where p.role = 'FACULTY' and p.account_status = 'APPROVED'
    and (department_filter is null or p.department_id = department_filter)
    and (faculty_search = '' or p.full_name ilike '%' || faculty_search || '%')
    and exists (select 1 from public.profiles viewer where viewer.id = (select auth.uid()) and viewer.account_status = 'APPROVED')
  order by p.full_name, p.id limit least(greatest(result_limit, 1), 50)
$$;

create function public.list_open_faculty_slots(target_faculty_id uuid, range_start date, range_end date)
returns table (id uuid, slot_date date, start_time time, end_time time, mode public.consultation_mode, location text, meeting_link text)
language sql stable security definer set search_path = '' as $$
  select s.id, s.date, s.start_time, s.end_time, s.mode, s.location, s.meeting_link
  from public.availability_slots s where s.faculty_id = target_faculty_id and s.status = 'OPEN' and s.date between range_start and range_end
    and exists (select 1 from public.profiles viewer where viewer.id = (select auth.uid()) and viewer.role = 'STUDENT' and viewer.account_status = 'APPROVED')
  order by s.date, s.start_time
$$;

create function public.book_consultation(target_slot_id uuid, consultation_purpose text, consultation_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare student_user_id uuid := (select auth.uid()); selected_slot public.availability_slots%rowtype; consultation_id uuid;
begin
  if not exists (select 1 from public.profiles where id = student_user_id and role = 'STUDENT' and account_status = 'APPROVED') then raise exception using errcode='42501', message='Approved student access required'; end if;
  if char_length(btrim(consultation_purpose)) not between 1 and 200 then raise exception using errcode='22023', message='Invalid purpose'; end if;
  update public.availability_slots set status='RESERVED' where id=target_slot_id and status='OPEN' returning * into selected_slot;
  if not found then raise exception using errcode='40001', message='Slot is no longer available'; end if;
  insert into public.consultations(student_id,faculty_id,availability_slot_id,purpose,notes) values(student_user_id,selected_slot.faculty_id,selected_slot.id,btrim(consultation_purpose),nullif(btrim(consultation_notes),'')) returning id into consultation_id;
  insert into public.notifications(recipient_id,type,title,message,entity_type,entity_id) values(selected_slot.faculty_id,'CONSULTATION_REQUEST','New consultation request','A student requested one of your available time slots.','consultation',consultation_id);
  return consultation_id;
end $$;

revoke all on function public.list_faculty(text,uuid,int), public.list_open_faculty_slots(uuid,date,date), public.book_consultation(uuid,text,text) from public;
grant execute on function public.list_faculty(text,uuid,int), public.list_open_faculty_slots(uuid,date,date), public.book_consultation(uuid,text,text) to authenticated;
