create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = (select auth.uid())
      and p.role = 'ADMIN'
      and p.account_status = 'APPROVED'
      and u.email_confirmed_at is not null
      and public.is_approved_email(u.email)
  );
$$;

create or replace function public.correct_user_account(
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
  if target.account_status <> 'APPROVED' or target.role = 'ADMIN' then
    raise exception using errcode = '23514', message = 'This account cannot be edited here';
  end if;
  if not public.is_approved_email(target.email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;
  if new_role = 'FACULTY' and not exists (
    select 1 from auth.users where id = target_user_id and email_confirmed_at is not null
  ) then
    raise exception using errcode = '23514', message = 'Email verification is required';
  end if;
  if target.role = 'FACULTY' and new_role = 'STUDENT' and (
    exists (
      select 1 from public.consultations
      where faculty_id = target_user_id and status in ('PENDING', 'APPROVED')
    )
    or exists (
      select 1 from public.availability_slots
      where faculty_id = target_user_id and date >= current_date
        and status in ('OPEN', 'RESERVED', 'BOOKED')
    )
  ) then
    raise exception using errcode = '23514', message = 'Resolve active Faculty work first';
  end if;

  update public.profiles
  set role = new_role, department_id = new_department_id
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
