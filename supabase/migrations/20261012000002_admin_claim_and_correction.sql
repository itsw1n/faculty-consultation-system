create function public.claim_first_admin(expected_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_email text;
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtext('claim_first_admin'));

  if exists (select 1 from public.profiles where role = 'ADMIN' and account_status = 'APPROVED') then
    raise exception using errcode = '23514', message = 'An administrator already exists';
  end if;

  select email into caller_email from public.profiles where id = caller_id;
  if caller_email is null or lower(caller_email) <> lower(btrim(expected_email)) then
    raise exception using errcode = '42501', message = 'Admin claim is not available for this account';
  end if;

  if not public.is_approved_email(caller_email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;

  update public.profiles
  set role = 'ADMIN',
      account_status = 'APPROVED'
  where id = caller_id;
end;
$$;

revoke all on function public.claim_first_admin(text) from public;
grant execute on function public.claim_first_admin(text) to authenticated;

create function public.correct_user_account(
  target_user_id uuid,
  new_role public.user_role,
  new_department_id uuid,
  position_title text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception using errcode = '42501', message = 'You cannot change your own account';
  end if;
  if new_role not in ('STUDENT', 'FACULTY') then
    raise exception using errcode = '22023', message = 'Invalid role';
  end if;
  if not exists (select 1 from public.departments where id = new_department_id) then
    raise exception using errcode = '23503', message = 'Invalid department';
  end if;

  select * into target from public.profiles where id = target_user_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Account not found';
  end if;
  if target.account_status <> 'APPROVED' then
    raise exception using errcode = '23514', message = 'Only approved accounts can be corrected';
  end if;

  update public.profiles
  set role = new_role,
      department_id = new_department_id
  where id = target_user_id;

  if new_role = 'FACULTY' then
    if exists (select 1 from public.faculty_profiles where user_id = target_user_id) then
      if position_title is not null and btrim(position_title) <> '' then
        if char_length(btrim(position_title)) not between 1 and 120 then
          raise exception using errcode = '22023', message = 'Invalid faculty position';
        end if;
        update public.faculty_profiles
        set position_title = btrim(position_title)
        where user_id = target_user_id;
      end if;
    else
      if position_title is null or char_length(btrim(position_title)) not between 1 and 120 then
        raise exception using errcode = '22023', message = 'Faculty position is required';
      end if;
      insert into public.faculty_profiles (user_id, position_title)
      values (target_user_id, btrim(position_title));
    end if;
  else
    delete from public.faculty_profiles where user_id = target_user_id;
  end if;
end;
$$;

revoke all on function public.correct_user_account(uuid, public.user_role, uuid, text) from public;
grant execute on function public.correct_user_account(uuid, public.user_role, uuid, text) to authenticated;

drop function public.list_application_page(text,public.account_status,public.user_role,uuid,timestamptz,uuid,int);
create function public.list_application_page(search_text text default '',status_filter public.account_status default null,role_filter public.user_role default null,department_filter uuid default null,cursor_created_at timestamptz default null,cursor_id uuid default null,result_limit int default 20)
returns table(id uuid,full_name text,email text,requested_role public.user_role,account_status public.account_status,department_name text,created_at timestamptz,role public.user_role,department_id uuid)
language sql stable security definer set search_path='' as $$
select p.id,p.full_name,p.email,p.requested_role,p.account_status,d.name,p.created_at,p.role,p.department_id from public.profiles p left join public.departments d on d.id=p.department_id
where public.is_admin() and (status_filter is null or p.account_status=status_filter) and (role_filter is null or p.requested_role=role_filter) and (department_filter is null or p.department_id=department_filter)
and (search_text='' or p.full_name ilike '%'||search_text||'%' or p.email ilike '%'||search_text||'%') and (cursor_created_at is null or (p.created_at,p.id)<(cursor_created_at,cursor_id))
order by p.created_at desc,p.id desc limit least(greatest(result_limit,1),50)
$$;
revoke all on function public.list_application_page(text,public.account_status,public.user_role,uuid,timestamptz,uuid,int) from public;
grant execute on function public.list_application_page(text,public.account_status,public.user_role,uuid,timestamptz,uuid,int) to authenticated;
