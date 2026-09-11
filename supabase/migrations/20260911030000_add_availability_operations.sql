revoke insert, update, delete on table public.availability_slots from authenticated;
drop policy availability_faculty_insert on public.availability_slots;
drop policy availability_faculty_update on public.availability_slots;
drop policy availability_faculty_delete_open on public.availability_slots;

create function public.create_availability(
  slot_date date, slot_start_time time, slot_end_time time,
  slot_mode public.consultation_mode, slot_location text default null, slot_meeting_link text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_slot_id uuid; faculty_user_id uuid := (select auth.uid());
begin
  if not exists (select 1 from public.profiles where id = faculty_user_id and role = 'FACULTY' and account_status = 'APPROVED') then
    raise exception using errcode = '42501', message = 'Approved faculty access required';
  end if;
  if slot_date < current_date then raise exception using errcode = '22023', message = 'Availability cannot be in the past'; end if;
  insert into public.availability_slots (faculty_id, date, start_time, end_time, mode, location, meeting_link)
  values (faculty_user_id, slot_date, slot_start_time, slot_end_time, slot_mode, nullif(btrim(slot_location), ''), nullif(btrim(slot_meeting_link), ''))
  returning id into new_slot_id;
  return new_slot_id;
end;
$$;

create function public.delete_open_availability(target_slot_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.availability_slots where id = target_slot_id and faculty_id = (select auth.uid()) and status = 'OPEN';
  if not found then raise exception using errcode = '23514', message = 'Open availability not found'; end if;
end;
$$;

revoke all on function public.create_availability(date, time, time, public.consultation_mode, text, text) from public;
revoke all on function public.delete_open_availability(uuid) from public;
grant execute on function public.create_availability(date, time, time, public.consultation_mode, text, text) to authenticated;
grant execute on function public.delete_open_availability(uuid) to authenticated;
