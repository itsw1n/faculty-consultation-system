create table public.faculty_invites (
  email text primary key check (char_length(btrim(email)) between 3 and 320),
  department_id uuid not null references public.departments(id) on delete restrict,
  position_title text not null check (char_length(position_title) between 1 and 120),
  invited_by uuid references public.profiles(id) on delete set null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.faculty_invites enable row level security;
revoke all on table public.faculty_invites from anon, authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.faculty_invites%rowtype;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  if public.is_approved_email(new.email) then
    select * into invite from public.faculty_invites
    where lower(email) = lower(new.email) and consumed_at is null
    limit 1;
    if found then
      update public.profiles
      set role = 'FACULTY',
          account_status = 'APPROVED',
          department_id = invite.department_id
      where id = new.id and account_status is null;
      if found then
        insert into public.faculty_profiles (user_id, position_title)
        values (new.id, invite.position_title)
        on conflict (user_id) do update set position_title = excluded.position_title;
        update public.faculty_invites set consumed_at = now() where email = invite.email;
      end if;
    else
      update public.profiles
      set role = 'STUDENT',
          account_status = 'APPROVED'
      where id = new.id and account_status is null;
    end if;
  end if;
  return new;
end;
$$;

update public.profiles
set role = requested_role,
    account_status = 'APPROVED'
where account_status = 'PENDING'
  and requested_role in ('STUDENT', 'FACULTY')
  and public.is_approved_email(email);

update public.profiles
set account_status = 'REJECTED'
where account_status = 'PENDING';

insert into public.faculty_profiles (user_id, position_title)
select id, 'Faculty'
from public.profiles
where role = 'FACULTY'
  and account_status = 'APPROVED'
  and not exists (select 1 from public.faculty_profiles where user_id = profiles.id);
