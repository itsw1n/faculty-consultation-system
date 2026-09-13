create function public.search_my_consultations(search_text text default '',status_filter public.consultation_status default null,cursor_created_at timestamptz default null,cursor_id uuid default null,result_limit int default 20)
returns table(id uuid,student_name text,faculty_name text,purpose text,notes text,consultation_status public.consultation_status,slot_date date,start_time time,end_time time,mode public.consultation_mode,location text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
select c.id,student.full_name,faculty.full_name,c.purpose,c.notes,c.status,slot.date,slot.start_time,slot.end_time,slot.mode,slot.location,c.created_at
from public.consultations c join public.profiles student on student.id=c.student_id join public.profiles faculty on faculty.id=c.faculty_id join public.availability_slots slot on slot.id=c.availability_slot_id
where (c.student_id=(select auth.uid()) or c.faculty_id=(select auth.uid()) or public.is_admin())
and (status_filter is null or c.status=status_filter)
and (search_text='' or c.purpose ilike '%'||search_text||'%' or student.full_name ilike '%'||search_text||'%' or faculty.full_name ilike '%'||search_text||'%')
and (cursor_created_at is null or (c.created_at,c.id)<(cursor_created_at,cursor_id))
order by c.created_at desc,c.id desc limit least(greatest(result_limit,1),50)
$$;
revoke all on function public.search_my_consultations(text,public.consultation_status,timestamptz,uuid,int) from public;
grant execute on function public.search_my_consultations(text,public.consultation_status,timestamptz,uuid,int) to authenticated;
