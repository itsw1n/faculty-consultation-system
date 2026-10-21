create function public.admin_dashboard_summary()
returns table(
  students bigint,
  faculty bigint,
  consultations bigint,
  pending bigint,
  approved bigint,
  completed bigint,
  rejected bigint,
  cancelled bigint,
  open_slots bigint,
  faculty_without_future_slots bigint
)
language plpgsql stable security definer set search_path = '' as $$
declare
  local_today date := (now() at time zone 'Asia/Manila')::date;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;

  return query
  select
    (select count(*) from public.profiles where role = 'STUDENT' and account_status = 'APPROVED'),
    (select count(*) from public.profiles where role = 'FACULTY' and account_status = 'APPROVED'),
    (select count(*) from public.consultations),
    (select count(*) from public.consultations where status = 'PENDING'),
    (select count(*) from public.consultations where status = 'APPROVED'),
    (select count(*) from public.consultations where status = 'COMPLETED'),
    (select count(*) from public.consultations where status = 'REJECTED'),
    (select count(*) from public.consultations where status = 'CANCELLED'),
    (
      select count(*)
      from public.availability_slots
      where status = 'OPEN' and date >= local_today
    ),
    (
      select count(*)
      from public.profiles faculty_profile
      where faculty_profile.role = 'FACULTY'
        and faculty_profile.account_status = 'APPROVED'
        and not exists (
          select 1
          from public.availability_slots slot
          where slot.faculty_id = faculty_profile.id
            and slot.date >= local_today
            and slot.status in ('OPEN', 'RESERVED', 'BOOKED')
        )
    );
end;
$$;

revoke all on function public.admin_dashboard_summary() from public;
grant execute on function public.admin_dashboard_summary() to authenticated;
