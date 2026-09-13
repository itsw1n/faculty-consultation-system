revoke select on table public.availability_slots from authenticated;
create function public.list_own_availability()
returns table(id uuid,date date,start_time time,end_time time,status public.availability_status,mode public.consultation_mode,location text,meeting_link text)
language sql stable security definer set search_path='' as $$
select s.id,s.date,s.start_time,s.end_time,s.status,s.mode,s.location,s.meeting_link from public.availability_slots s
where s.faculty_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='FACULTY' and p.account_status='APPROVED')
and s.date>=current_date order by s.date,s.start_time limit 100
$$;
create function public.count_own_open_availability()
returns bigint language sql stable security definer set search_path='' as $$
select count(*) from public.availability_slots s where s.faculty_id=(select auth.uid()) and s.status='OPEN' and s.date>=current_date
$$;
revoke all on function public.list_own_availability(),public.count_own_open_availability() from public;
grant execute on function public.list_own_availability(),public.count_own_open_availability() to authenticated;
