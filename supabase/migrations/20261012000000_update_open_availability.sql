create function public.update_open_availability(
  target_slot_id uuid, slot_date date, slot_start_time time, slot_end_time time,
  slot_mode public.consultation_mode, slot_location text default null, slot_meeting_link text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if slot_date < current_date then raise exception using errcode = '22023', message = 'Availability cannot be in the past'; end if;
  update public.availability_slots
  set date = slot_date,
      start_time = slot_start_time,
      end_time = slot_end_time,
      mode = slot_mode,
      location = nullif(btrim(slot_location), ''),
      meeting_link = nullif(btrim(slot_meeting_link), '')
  where id = target_slot_id and faculty_id = (select auth.uid()) and status = 'OPEN';
  if not found then raise exception using errcode = '23514', message = 'Open availability not found'; end if;
end;
$$;

revoke all on function public.update_open_availability(uuid, date, time, time, public.consultation_mode, text, text) from public;
grant execute on function public.update_open_availability(uuid, date, time, time, public.consultation_mode, text, text) to authenticated;
