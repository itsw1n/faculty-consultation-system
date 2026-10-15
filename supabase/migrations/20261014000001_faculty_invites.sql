create function public.invite_faculty(
  invite_emails text[],
  invite_department_id uuid,
  invite_position_title text
)
returns table (email text, invited boolean, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
  clean text;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if not exists (select 1 from public.departments where id = invite_department_id) then
    raise exception using errcode = '23503', message = 'Invalid department';
  end if;
  if invite_position_title is null or char_length(btrim(invite_position_title)) not between 1 and 120 then
    raise exception using errcode = '22023', message = 'Faculty position is required';
  end if;
  if coalesce(array_length(invite_emails, 1), 0) < 1
     or coalesce(array_length(invite_emails, 1), 0) > 50 then
    raise exception using errcode = '22023', message = 'Invite between 1 and 50 emails';
  end if;

  foreach candidate in array invite_emails loop
    clean := lower(btrim(candidate));
    email := clean;
    invited := false;
    reason := null;
    if clean = '' or clean not like '%@%' or clean like '%@%@%' or not public.is_approved_email(clean) then
      reason := 'Not a school email';
    elsif exists (select 1 from public.profiles where lower(profiles.email) = clean and role = 'FACULTY' and account_status = 'APPROVED') then
      reason := 'Already faculty';
    else
      begin
        insert into public.faculty_invites (email, department_id, position_title, invited_by)
        values (clean, invite_department_id, btrim(invite_position_title), (select auth.uid()))
        on conflict (email) do update
          set department_id = excluded.department_id,
              position_title = excluded.position_title,
              invited_by = excluded.invited_by,
              consumed_at = null;
        invited := true;
      exception when others then
        reason := 'Could not save invite';
      end;
    end if;
    return next;
  end loop;
end;
$$;

revoke all on function public.invite_faculty(text[], uuid, text) from public;
grant execute on function public.invite_faculty(text[], uuid, text) to authenticated;
