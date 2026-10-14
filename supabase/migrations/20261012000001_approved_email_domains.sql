create table public.approved_email_domains (
  domain text primary key check (char_length(btrim(domain)) between 1 and 160),
  note text not null default '',
  added_at timestamptz not null default now()
);

alter table public.approved_email_domains enable row level security;
revoke all on table public.approved_email_domains from anon, authenticated;

insert into public.approved_email_domains (domain, note) values
  ('student.acd.edu.ph', 'PLACEHOLDER - replace with the confirmed student domain'),
  ('faculty.acd.edu.ph', 'PLACEHOLDER - replace with the confirmed faculty domain');

create function public.is_approved_email(candidate_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with clean as (select lower(btrim(coalesce(candidate_email, ''))) as email)
  select exists (
    select 1 from public.approved_email_domains, clean
    where domain = '*'
       or (clean.email like '%@%'
           and clean.email not like '%@%@%'
           and split_part(clean.email, '@', 2) <> ''
           and domain = split_part(clean.email, '@', 2))
  );
$$;

revoke all on function public.is_approved_email(text) from public;
grant execute on function public.is_approved_email(text) to authenticated;

create or replace function public.submit_application(
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

  if not public.is_approved_email((select email from public.profiles where id = applicant_id)) then
    raise exception using errcode = '22023', message = 'School email required';
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

create or replace function public.review_application(target_user_id uuid, decision public.account_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  application public.profiles%rowtype;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if decision not in ('APPROVED', 'REJECTED') then
    raise exception using errcode = '22023', message = 'Invalid review decision';
  end if;

  select * into application from public.profiles where id = target_user_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Application not found'; end if;
  if application.account_status <> 'PENDING' then
    raise exception using errcode = '23514', message = 'Application is no longer pending';
  end if;
  if decision = 'APPROVED' and not public.is_approved_email(application.email) then
    raise exception using errcode = '22023', message = 'School email required';
  end if;

  update public.profiles
  set account_status = decision,
      role = case when decision = 'APPROVED' then application.requested_role else null end
  where id = target_user_id;

  insert into public.notifications (recipient_id, type, title, message, entity_type, entity_id)
  values (
    target_user_id,
    'APPLICATION_' || decision::text,
    case when decision = 'APPROVED' then 'Application approved' else 'Application not approved' end,
    case when decision = 'APPROVED' then 'Your CampusConnect account is ready.' else 'Contact the school administrator if you need more information.' end,
    'profile', target_user_id
  );
end;
$$;
