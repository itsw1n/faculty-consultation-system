create function public.list_my_consultations(status_filter public.consultation_status default null, result_limit int default 20)
returns table (id uuid, student_name text, faculty_name text, purpose text, notes text, consultation_status public.consultation_status, slot_date date, start_time time, end_time time, mode public.consultation_mode, location text)
language sql stable security definer set search_path = '' as $$
  select c.id, student.full_name, faculty.full_name, c.purpose, c.notes, c.status, slot.date, slot.start_time, slot.end_time, slot.mode, slot.location
  from public.consultations c
  join public.profiles student on student.id=c.student_id
  join public.profiles faculty on faculty.id=c.faculty_id
  join public.availability_slots slot on slot.id=c.availability_slot_id
  where (c.student_id=(select auth.uid()) or c.faculty_id=(select auth.uid()) or public.is_admin())
    and (status_filter is null or c.status=status_filter)
  order by slot.date desc, slot.start_time desc, c.id
  limit least(greatest(result_limit,1),50)
$$;

create function public.decide_consultation(target_consultation_id uuid, approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare consultation public.consultations%rowtype;
begin
  select * into consultation from public.consultations where id=target_consultation_id for update;
  if not found or consultation.faculty_id<>(select auth.uid()) then raise exception using errcode='42501',message='Consultation not available'; end if;
  if consultation.status<>'PENDING' then raise exception using errcode='23514',message='Request is no longer pending'; end if;
  update public.availability_slots set status=case when approve then 'BOOKED'::public.availability_status else 'OPEN'::public.availability_status end where id=consultation.availability_slot_id and status='RESERVED';
  if not found then raise exception using errcode='40001',message='Slot state changed'; end if;
  update public.consultations set status=case when approve then 'APPROVED'::public.consultation_status else 'REJECTED'::public.consultation_status end where id=consultation.id;
  insert into public.notifications(recipient_id,type,title,message,entity_type,entity_id) values(consultation.student_id,case when approve then 'CONSULTATION_APPROVED' else 'CONSULTATION_REJECTED' end,case when approve then 'Consultation approved' else 'Consultation request declined' end,case when approve then 'Your consultation schedule is confirmed.' else 'Your requested time was not approved.' end,'consultation',consultation.id);
end $$;

create function public.cancel_consultation(target_consultation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare consultation public.consultations%rowtype;
begin
  select * into consultation from public.consultations where id=target_consultation_id for update;
  if not found or consultation.student_id<>(select auth.uid()) then raise exception using errcode='42501',message='Consultation not available'; end if;
  if consultation.status not in ('PENDING','APPROVED') then raise exception using errcode='23514',message='Consultation cannot be cancelled'; end if;
  update public.availability_slots set status='OPEN' where id=consultation.availability_slot_id and status in ('RESERVED','BOOKED');
  update public.consultations set status='CANCELLED',cancelled_at=now() where id=consultation.id;
  insert into public.notifications(recipient_id,type,title,message,entity_type,entity_id) values(consultation.faculty_id,'CONSULTATION_CANCELLED','Consultation cancelled','A student cancelled a consultation request.','consultation',consultation.id);
end $$;

create function public.complete_consultation(target_consultation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare consultation public.consultations%rowtype;
begin
  select * into consultation from public.consultations where id=target_consultation_id for update;
  if not found or consultation.faculty_id<>(select auth.uid()) then raise exception using errcode='42501',message='Consultation not available'; end if;
  if consultation.status<>'APPROVED' then raise exception using errcode='23514',message='Only approved consultations can be completed'; end if;
  update public.availability_slots set status='CLOSED' where id=consultation.availability_slot_id and status='BOOKED';
  update public.consultations set status='COMPLETED',completed_at=now() where id=consultation.id;
end $$;

revoke all on function public.list_my_consultations(public.consultation_status,int), public.decide_consultation(uuid,boolean), public.cancel_consultation(uuid), public.complete_consultation(uuid) from public;
grant execute on function public.list_my_consultations(public.consultation_status,int), public.decide_consultation(uuid,boolean), public.cancel_consultation(uuid), public.complete_consultation(uuid) to authenticated;
