create function public.list_faculty_slots(target_faculty_id uuid, range_start date, range_end date)
returns table (id uuid, slot_date date, start_time time, end_time time, slot_status public.availability_status, mode public.consultation_mode, location text)
language sql stable security definer set search_path = '' as $$
  select s.id,s.date,s.start_time,s.end_time,s.status,s.mode,s.location
  from public.availability_slots s
  where s.faculty_id=target_faculty_id and s.date between range_start and range_end
    and exists(select 1 from public.profiles viewer where viewer.id=(select auth.uid()) and viewer.role='STUDENT' and viewer.account_status='APPROVED')
  order by s.date,s.start_time
$$;
revoke all on function public.list_faculty_slots(uuid,date,date) from public;
grant execute on function public.list_faculty_slots(uuid,date,date) to authenticated;
