drop function if exists public.list_own_availability();

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
  purpose text
)
language sql stable security definer set search_path = '' as $$
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
  consultation.purpose
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

revoke all on function public.list_own_availability() from public;
grant execute on function public.list_own_availability() to authenticated;
