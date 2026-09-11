create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create function public.submit_application(
  requested_role public.user_role,
  selected_department_id uuid,
  faculty_position_title text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  applicant_id uuid := (select auth.uid());
begin
  if applicant_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if requested_role not in ('STUDENT', 'FACULTY') then
    raise exception using errcode = '22023', message = 'Invalid requested role';
  end if;

  if not exists (select 1 from public.departments where id = selected_department_id) then
    raise exception using errcode = '23503', message = 'Invalid department';
  end if;

  if requested_role = 'FACULTY'
    and (faculty_position_title is null or char_length(btrim(faculty_position_title)) not between 1 and 120)
  then
    raise exception using errcode = '22023', message = 'Faculty position is required';
  end if;

  update public.profiles
  set requested_role = submit_application.requested_role,
      department_id = selected_department_id,
      account_status = 'PENDING'
  where id = applicant_id and account_status is null;

  if not found then
    raise exception using errcode = '23514', message = 'Application cannot be submitted';
  end if;

  if requested_role = 'FACULTY' then
    insert into public.faculty_profiles (user_id, position_title)
    values (applicant_id, btrim(faculty_position_title));
  end if;
end;
$$;

revoke all on function public.submit_application(public.user_role, uuid, text) from public;
grant execute on function public.submit_application(public.user_role, uuid, text) to authenticated;
