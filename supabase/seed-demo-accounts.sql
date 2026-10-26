-- Temporary local-only accounts for a clean live demonstration.
-- This file is intentionally not a migration and never runs in hosted Supabase.
-- It creates or updates only these four accounts; it does not add slots,
-- consultations, notifications, or email-outbox rows.
do $seed_demo_accounts$
declare
  v_admin_id uuid := 'e1000000-0000-4000-8000-000000000001';
  v_panzo_id uuid := 'e1000000-0000-4000-8000-000000000002';
  v_bitas_id uuid := 'e1000000-0000-4000-8000-000000000003';
  v_mendoza_id uuid := 'e1000000-0000-4000-8000-000000000004';
begin
  -- Do not overwrite an account that somebody registered using one of the
  -- demo email addresses.
  if exists (
    select 1
    from auth.users existing
    join (
      values
        (v_admin_id, 'erwinjrcurato8975@acdeducation.com'),
        (v_panzo_id, 'bienkaizerpanzo8703@acdeducation.com'),
        (v_bitas_id, 'johnfrencebitas9050@acdeducation.com'),
        (v_mendoza_id, 'alexandramendoza8589@acdeducation.com')
    ) as target(id, email) on lower(existing.email) = target.email
    where existing.id <> target.id
  ) then
    raise exception 'Demo-account seed aborted: a target email belongs to a different account.';
  end if;

  if not exists (select 1 from public.departments where code = 'IT') then
    raise exception 'Demo-account seed aborted: the IT department is missing. Run make reset first.';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, reauthentication_token, phone_change,
    phone_change_token, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  select
    '00000000-0000-0000-0000-000000000000'::uuid,
    demo.id,
    'authenticated',
    'authenticated',
    demo.email,
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(), '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', demo.full_name),
    now(), now()
  from (
    values
      (v_admin_id, 'erwinjrcurato8975@acdeducation.com', 'Erwin Jr Curato'),
      (v_panzo_id, 'bienkaizerpanzo8703@acdeducation.com', 'Bien Kaizer Panzo'),
      (v_bitas_id, 'johnfrencebitas9050@acdeducation.com', 'John Frence Bitas'),
      (v_mendoza_id, 'alexandramendoza8589@acdeducation.com', 'Alexandra Mendoza')
  ) as demo(id, email, full_name)
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  insert into auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  select
    demo.id::text,
    demo.id,
    jsonb_build_object(
      'sub', demo.id::text,
      'email', demo.email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email', now(), now(), now()
  from (
    values
      (v_admin_id, 'erwinjrcurato8975@acdeducation.com'),
      (v_panzo_id, 'bienkaizerpanzo8703@acdeducation.com'),
      (v_bitas_id, 'johnfrencebitas9050@acdeducation.com'),
      (v_mendoza_id, 'alexandramendoza8589@acdeducation.com')
  ) as demo(id, email)
  on conflict (provider_id, provider) do update
  set identity_data = excluded.identity_data, updated_at = now();

  insert into public.profiles (
    id, email, full_name, role, department_id, account_status, position_title
  )
  select
    demo.id,
    demo.email,
    demo.full_name,
    demo.role::public.user_role,
    department.id,
    'APPROVED'::public.account_status,
    demo.position_title
  from (
    values
      (v_admin_id, 'erwinjrcurato8975@acdeducation.com', 'Erwin Jr Curato', 'ADMIN', null),
      (v_panzo_id, 'bienkaizerpanzo8703@acdeducation.com', 'Bien Kaizer Panzo', 'STUDENT', null),
      (v_bitas_id, 'johnfrencebitas9050@acdeducation.com', 'John Frence Bitas', 'STUDENT', null),
      (v_mendoza_id, 'alexandramendoza8589@acdeducation.com', 'Alexandra Mendoza', 'FACULTY', 'Instructor')
  ) as demo(id, email, full_name, role, position_title)
  cross join public.departments department
  where department.code = 'IT'
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    department_id = excluded.department_id,
    account_status = excluded.account_status,
    position_title = excluded.position_title;
end;
$seed_demo_accounts$;
