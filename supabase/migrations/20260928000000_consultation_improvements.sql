alter table public.consultations add column category text;
update public.consultations set category = 'OTHER';
alter table public.consultations alter column category set not null;
alter table public.consultations add constraint consultation_category_valid
  check (category in ('GRADE','CAPSTONE','ACADEMIC','PERSONAL','OTHER'));
alter table public.consultations add column outcome text
  check (outcome is null or char_length(outcome) <= 2000);

drop policy consultations_participant_read on public.consultations;
create policy consultations_participant_read on public.consultations
for select to authenticated using (
  student_id = (select auth.uid()) or faculty_id = (select auth.uid())
);

create or replace function public.book_consultation(target_slot_id uuid, consultation_purpose text, consultation_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare student_user_id uuid := (select auth.uid()); selected_slot public.availability_slots%rowtype; consultation_id uuid;
begin
  if not exists (select 1 from public.profiles where id = student_user_id and role = 'STUDENT' and account_status = 'APPROVED') then raise exception using errcode='42501', message='Approved student access required'; end if;
  if consultation_purpose not in ('GRADE','CAPSTONE','ACADEMIC','PERSONAL','OTHER') or char_length(coalesce(consultation_notes,'')) > 2000 then raise exception using errcode='22023', message='Invalid consultation details'; end if;
  update public.availability_slots set status='RESERVED' where id=target_slot_id and status='OPEN' returning * into selected_slot;
  if not found then raise exception using errcode='40001', message='Slot is no longer available'; end if;
  insert into public.consultations(student_id,faculty_id,availability_slot_id,purpose,category,notes)
  values(student_user_id,selected_slot.faculty_id,selected_slot.id,consultation_purpose,consultation_purpose,nullif(btrim(consultation_notes),'')) returning id into consultation_id;
  insert into public.notifications(recipient_id,type,title,message,entity_type,entity_id) values(selected_slot.faculty_id,'CONSULTATION_REQUEST','New consultation request','A student requested one of your available time slots.','consultation',consultation_id);
  return consultation_id;
end $$;

create or replace function public.list_my_consultations(status_filter public.consultation_status default null, result_limit int default 20)
returns table (id uuid, student_name text, faculty_name text, purpose text, notes text, consultation_status public.consultation_status, slot_date date, start_time time, end_time time, mode public.consultation_mode, location text)
language sql stable security definer set search_path = '' as $$
  select c.id, student.full_name, faculty.full_name,
    case when public.is_admin() then c.category else c.purpose end,
    case when public.is_admin() then null else c.notes end,
    c.status, slot.date, slot.start_time, slot.end_time, slot.mode, slot.location
  from public.consultations c
  join public.profiles student on student.id=c.student_id
  join public.profiles faculty on faculty.id=c.faculty_id
  join public.availability_slots slot on slot.id=c.availability_slot_id
  where (c.student_id=(select auth.uid()) or c.faculty_id=(select auth.uid()) or public.is_admin())
    and (status_filter is null or c.status=status_filter)
  order by slot.date desc, slot.start_time desc, c.id
  limit least(greatest(result_limit,1),50)
$$;

create or replace function public.search_my_consultations(search_text text default '',status_filter public.consultation_status default null,cursor_created_at timestamptz default null,cursor_id uuid default null,result_limit int default 20)
returns table(id uuid,student_name text,faculty_name text,purpose text,notes text,consultation_status public.consultation_status,slot_date date,start_time time,end_time time,mode public.consultation_mode,location text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
select c.id,student.full_name,faculty.full_name,
  case when public.is_admin() then c.category else c.purpose end,
  case when public.is_admin() then null else c.notes end,
  c.status,slot.date,slot.start_time,slot.end_time,slot.mode,slot.location,c.created_at
from public.consultations c join public.profiles student on student.id=c.student_id join public.profiles faculty on faculty.id=c.faculty_id join public.availability_slots slot on slot.id=c.availability_slot_id
where (c.student_id=(select auth.uid()) or c.faculty_id=(select auth.uid()) or public.is_admin())
and (status_filter is null or c.status=status_filter)
and (search_text='' or c.category ilike '%'||search_text||'%' or (not public.is_admin() and c.purpose ilike '%'||search_text||'%') or student.full_name ilike '%'||search_text||'%' or faculty.full_name ilike '%'||search_text||'%')
and (cursor_created_at is null or (c.created_at,c.id)<(cursor_created_at,cursor_id))
order by c.created_at desc,c.id desc limit least(greatest(result_limit,1),50)
$$;

create function public.get_consultation_detail(target_id uuid)
returns table(id uuid, student_name text, faculty_name text, category text, description text, outcome text,
  consultation_status public.consultation_status, slot_date date, start_time time, end_time time, mode public.consultation_mode, location text)
language sql stable security definer set search_path='' as $$
select c.id, student.full_name, faculty.full_name, c.category, c.notes, c.outcome,
  c.status, slot.date, slot.start_time, slot.end_time, slot.mode, slot.location
from public.consultations c
join public.profiles student on student.id=c.student_id
join public.profiles faculty on faculty.id=c.faculty_id
join public.availability_slots slot on slot.id=c.availability_slot_id
where c.id=target_id and (c.student_id=(select auth.uid()) or c.faculty_id=(select auth.uid()))
  and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.account_status='APPROVED')
$$;
revoke all on function public.get_consultation_detail(uuid) from public;
grant execute on function public.get_consultation_detail(uuid) to authenticated;

create function public.complete_consultation_with_outcome(target_consultation_id uuid, outcome_text text default null)
returns void language plpgsql security definer set search_path='' as $$
declare consultation public.consultations%rowtype;
begin
  select * into consultation from public.consultations where id=target_consultation_id for update;
  if not found or consultation.faculty_id<>(select auth.uid()) then raise exception using errcode='42501',message='Consultation not available'; end if;
  if consultation.status<>'APPROVED' or char_length(coalesce(outcome_text,''))>2000 then raise exception using errcode='23514',message='Consultation cannot be completed'; end if;
  update public.availability_slots set status='CLOSED' where id=consultation.availability_slot_id and status='BOOKED';
  if not found then raise exception using errcode='40001',message='Slot state changed'; end if;
  update public.consultations set status='COMPLETED',completed_at=now(),outcome=nullif(btrim(outcome_text),'') where id=consultation.id;
end $$;
revoke all on function public.complete_consultation_with_outcome(uuid,text) from public;
grant execute on function public.complete_consultation_with_outcome(uuid,text) to authenticated;
revoke execute on function public.complete_consultation(uuid) from authenticated;

create function public.consultation_summary(start_date date, end_date date)
returns table(slot_date date, department text, category text, status public.consultation_status, total bigint)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception using errcode='42501',message='Admin access required'; end if;
  if start_date is null or end_date is null or end_date<start_date or end_date>start_date+366 then raise exception using errcode='22023',message='Invalid date range'; end if;
  return query select s.date, d.code, c.category, c.status, count(*)
  from public.consultations c join public.availability_slots s on s.id=c.availability_slot_id
  join public.profiles p on p.id=c.student_id join public.departments d on d.id=p.department_id
  where s.date between start_date and end_date
  group by s.date,d.code,c.category,c.status order by s.date,d.code,c.category,c.status;
end $$;
revoke all on function public.consultation_summary(date,date) from public;
grant execute on function public.consultation_summary(date,date) to authenticated;

create function public.admin_consultation_count()
returns bigint language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception using errcode='42501',message='Admin access required'; end if;
  return (select count(*) from public.consultations);
end $$;
revoke all on function public.admin_consultation_count() from public;
grant execute on function public.admin_consultation_count() to authenticated;
