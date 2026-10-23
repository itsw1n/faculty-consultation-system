-- The development seed supplies the only wildcard domain. Hosted databases
-- have the explicit allowlist, so the same rule applies at account creation.
grant execute on function public.is_approved_email(text) to anon;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_approved_email(new.email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role, account_status)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'STUDENT',
    'APPROVED'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Keep historical invite rows for audit, but stop accepting or consuming them.
revoke all on function public.invite_faculty(text[], uuid, text) from authenticated;

create function public.promote_registered_faculty(
  target_email text,
  new_department_id uuid,
  new_position_title text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles%rowtype;
  normalized_email text := lower(btrim(target_email));
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if not public.is_approved_email(normalized_email) then
    return 'DOMAIN_NOT_ALLOWED';
  end if;
  if not exists (select 1 from public.departments where id = new_department_id) then
    raise exception using errcode = '23503', message = 'Invalid department';
  end if;
  if new_position_title is null or char_length(btrim(new_position_title)) not between 1 and 120 then
    raise exception using errcode = '22023', message = 'Faculty position is required';
  end if;

  select * into target
  from public.profiles
  where lower(email) = normalized_email
  for update;
  if not found then return 'NOT_REGISTERED'; end if;
  if target.role = 'FACULTY' and target.account_status = 'APPROVED' then
    return 'ALREADY_FACULTY';
  end if;
  if target.role <> 'STUDENT' or target.account_status <> 'APPROVED' then
    return 'NOT_ELIGIBLE';
  end if;
  if not exists (
    select 1 from auth.users
    where id = target.id and email_confirmed_at is not null
  ) then
    return 'NOT_VERIFIED';
  end if;

  update public.profiles
  set role = 'FACULTY', department_id = new_department_id
  where id = target.id;
  insert into public.faculty_profiles (user_id, position_title)
  values (target.id, btrim(new_position_title))
  on conflict (user_id) do update set position_title = excluded.position_title;
  return 'PROMOTED';
end;
$$;

revoke all on function public.promote_registered_faculty(text, uuid, text) from public;
grant execute on function public.promote_registered_faculty(text, uuid, text) to authenticated;

-- Browser callers can invoke authenticated RPCs directly. The server checks
-- INITIAL_ADMIN_EMAIL, then calls this version using a private service key.
drop function public.claim_first_admin(text);
create function public.claim_first_admin(target_user_id uuid, expected_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_email text;
begin
  perform pg_advisory_xact_lock(hashtext('claim_first_admin'));
  if exists (
    select 1 from public.profiles
    where role = 'ADMIN' and account_status = 'APPROVED'
  ) then
    raise exception using errcode = '23514', message = 'An administrator already exists';
  end if;
  select p.email into target_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = target_user_id and u.email_confirmed_at is not null
  for update of p;
  if target_email is null or lower(target_email) <> lower(btrim(expected_email)) then
    raise exception using errcode = '42501', message = 'Admin claim is not available for this account';
  end if;
  if not public.is_approved_email(target_email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;
  update public.profiles
  set role = 'ADMIN', account_status = 'APPROVED'
  where id = target_user_id;
end;
$$;

revoke all on function public.claim_first_admin(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_first_admin(uuid, text) to service_role;

-- The preceding position-title migration may already be installed locally.
-- Apply the current-role filter change here so that installation is append-only.
drop function public.list_application_page(text, public.account_status, public.user_role, uuid, timestamptz, uuid, int);
create function public.list_application_page(search_text text default '', status_filter public.account_status default null, role_filter public.user_role default null, department_filter uuid default null, cursor_created_at timestamptz default null, cursor_id uuid default null, result_limit int default 20)
returns table(id uuid, full_name text, email text, requested_role public.user_role, account_status public.account_status, department_name text, created_at timestamptz, role public.user_role, department_id uuid, position_title text)
language sql stable security definer set search_path='' as $$
select p.id, p.full_name, p.email, p.requested_role, p.account_status, d.name, p.created_at, p.role, p.department_id, fp.position_title
from public.profiles p
left join public.departments d on d.id = p.department_id
left join public.faculty_profiles fp on fp.user_id = p.id
where public.is_admin()
  and (status_filter is null or p.account_status = status_filter)
  and (role_filter is null or p.role = role_filter)
  and (department_filter is null or p.department_id = department_filter)
  and (search_text = '' or p.full_name ilike '%' || search_text || '%' or p.email ilike '%' || search_text || '%')
  and (cursor_created_at is null or (p.created_at, p.id) < (cursor_created_at, cursor_id))
order by p.created_at desc, p.id desc
limit least(greatest(result_limit, 1), 50)
$$;

revoke all on function public.list_application_page(text, public.account_status, public.user_role, uuid, timestamptz, uuid, int) from public;
grant execute on function public.list_application_page(text, public.account_status, public.user_role, uuid, timestamptz, uuid, int) to authenticated;
