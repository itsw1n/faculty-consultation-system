-- Local development seed. This file runs only with `supabase db reset`
-- on your own machine. It is never applied to hosted environments,
-- which receive migrations only. Do not move these rows into a migration.
--
-- The wildcard allows any email domain locally so the team can sign up
-- with any email address. Strict domain checks still run in tests:
-- every pgTAP test removes this row before asserting.
do $seed$
declare
  v_today date := (now() at time zone 'Asia/Manila')::date;

  v_erwin_id uuid := 'a0000000-0000-4000-8000-000000000001';
  v_mendoza_id uuid := 'a0000000-0000-4000-8000-000000000002';
  v_bitas_id uuid := 'a0000000-0000-4000-8000-000000000003';
  v_jose_id uuid := 'a0000000-0000-4000-8000-000000000004';
  v_angela_id uuid := 'a0000000-0000-4000-8000-000000000005';
  v_panzo_id uuid := 'a0000000-0000-4000-8000-000000000006';

  v_seed_account_ids uuid[] := array[
    v_erwin_id,
    v_mendoza_id,
    v_bitas_id,
    v_jose_id,
    v_angela_id,
    v_panzo_id
  ];

  -- Include the retired legacy slot ids so a previous seed cannot leave
  -- slots behind when the dataset shrinks.
  v_seed_slot_ids uuid[] := array[
    'b0000000-0000-4000-8000-000000000001'::uuid,
    'b0000000-0000-4000-8000-000000000002'::uuid,
    'b0000000-0000-4000-8000-000000000003'::uuid,
    'b0000000-0000-4000-8000-000000000004'::uuid,
    'b0000000-0000-4000-8000-000000000005'::uuid,
    'b0000000-0000-4000-8000-000000000006'::uuid,
    'b0000000-0000-4000-8000-000000000007'::uuid,
    'b0000000-0000-4000-8000-000000000008'::uuid,
    'b0000000-0000-4000-8000-000000000009'::uuid,
    'b0000000-0000-4000-8000-000000000010'::uuid,
    'b0000000-0000-4000-8000-000000000011'::uuid,
    'b0000000-0000-4000-8000-000000000012'::uuid,
    'b0000000-0000-4000-8000-000000000013'::uuid,
    'b0000000-0000-4000-8000-000000000014'::uuid,
    'b0000000-0000-4000-8000-000000000015'::uuid,
    'b0000000-0000-4000-8000-000000000016'::uuid,
    'b0000000-0000-4000-8000-000000000017'::uuid,
    'b0000000-0000-4000-8000-000000000018'::uuid,
    'b0000000-0000-4000-8000-000000000019'::uuid,
    'b0000000-0000-4000-8000-000000000020'::uuid
  ];

  v_seed_consultation_ids uuid[] := array[
    'c0000000-0000-4000-8000-000000000001'::uuid,
    'c0000000-0000-4000-8000-000000000002'::uuid,
    'c0000000-0000-4000-8000-000000000003'::uuid,
    'c0000000-0000-4000-8000-000000000004'::uuid,
    'c0000000-0000-4000-8000-000000000005'::uuid,
    'c0000000-0000-4000-8000-000000000006'::uuid,
    'c0000000-0000-4000-8000-000000000007'::uuid,
    'c0000000-0000-4000-8000-000000000008'::uuid,
    'c0000000-0000-4000-8000-000000000009'::uuid,
    'c0000000-0000-4000-8000-000000000010'::uuid,
    'c0000000-0000-4000-8000-000000000011'::uuid,
    'c0000000-0000-4000-8000-000000000012'::uuid
  ];

  v_seed_notification_ids uuid[] := array[
    'd0000000-0000-4000-8000-000000000001'::uuid,
    'd0000000-0000-4000-8000-000000000002'::uuid,
    'd0000000-0000-4000-8000-000000000003'::uuid,
    'd0000000-0000-4000-8000-000000000004'::uuid,
    'd0000000-0000-4000-8000-000000000005'::uuid,
    'd0000000-0000-4000-8000-000000000006'::uuid,
    'd0000000-0000-4000-8000-000000000007'::uuid,
    'd0000000-0000-4000-8000-000000000008'::uuid,
    'd0000000-0000-4000-8000-000000000009'::uuid,
    'd0000000-0000-4000-8000-000000000010'::uuid,
    'd0000000-0000-4000-8000-000000000011'::uuid,
    'd0000000-0000-4000-8000-000000000012'::uuid
  ];
begin
  insert into public.approved_email_domains (domain)
  values ('*')
  on conflict (domain) do nothing;

  -- Fail instead of overwriting or silently creating a duplicate when a
  -- target address already belongs to a different local account.
  if exists (
    select 1
    from auth.users existing
    join (
      values
        ('a0000000-0000-4000-8000-000000000001'::uuid, 'erwin@acdeducation.com'),
        ('a0000000-0000-4000-8000-000000000002'::uuid, 'mendoza@acdeducation.com'),
        ('a0000000-0000-4000-8000-000000000003'::uuid, 'bitas@acdeducation.com'),
        ('a0000000-0000-4000-8000-000000000004'::uuid, 'jose.santos@acdeducation.com'),
        ('a0000000-0000-4000-8000-000000000005'::uuid, 'angela.villanueva@acdeducation.com'),
        ('a0000000-0000-4000-8000-000000000006'::uuid, 'panzo@acdeducation.com')
    ) as target(id, email)
      on lower(existing.email) = lower(target.email)
    where existing.id <> target.id
  ) then
    raise exception 'Seed aborted: a target email already belongs to a different account.';
  end if;

  if exists (
    select 1
    from (values ('IT'), ('BSBA')) as required(code)
    left join public.departments department on department.code = required.code
    where department.id is null
  ) then
    raise exception 'Seed aborted: required departments IT and BSBA are missing.';
  end if;

  delete from public.email_outbox
  where consultation_id in (
    select id
    from public.consultations
    where id = any(v_seed_consultation_ids)
       or availability_slot_id = any(v_seed_slot_ids)
  );

  delete from public.consultations
  where id = any(v_seed_consultation_ids)
     or availability_slot_id = any(v_seed_slot_ids);

  delete from public.availability_slots
  where id = any(v_seed_slot_ids);

  delete from public.notifications
  where id = any(v_seed_notification_ids);

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    reauthentication_token,
    phone_change,
    phone_change_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  select
    '00000000-0000-0000-0000-000000000000'::uuid,
    demo.id,
    'authenticated',
    'authenticated',
    demo.email,
    -- Local-only fixture password. This is not a real account credential.
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', demo.full_name),
    now(),
    now()
  from (
    values
      (
        'a0000000-0000-4000-8000-000000000001'::uuid,
        'erwin@acdeducation.com',
        'Erwin Curato'
      ),
      (
        'a0000000-0000-4000-8000-000000000002'::uuid,
        'mendoza@acdeducation.com',
        'Maria Isabel Reyes'
      ),
      (
        'a0000000-0000-4000-8000-000000000003'::uuid,
        'bitas@acdeducation.com',
        'John Frence Cuevas Bitas'
      ),
      (
        'a0000000-0000-4000-8000-000000000004'::uuid,
        'jose.santos@acdeducation.com',
        'Jose Miguel A. Santos'
      ),
      (
        'a0000000-0000-4000-8000-000000000005'::uuid,
        'angela.villanueva@acdeducation.com',
        'Angela Marie L. Villanueva'
      ),
      (
        'a0000000-0000-4000-8000-000000000006'::uuid,
        'panzo@acdeducation.com',
        'Bien Panzo'
      )
  ) as demo(id, email, full_name)
  where not exists (
    select 1 from auth.users existing where lower(existing.email) = lower(demo.email)
  )
  on conflict (id) do update
  set email = excluded.email;

  update auth.users existing
  set
    encrypted_password = extensions.crypt('Password123!', extensions.gen_salt('bf')),
    email_confirmed_at = now(),
    confirmation_token = '',
    recovery_token = '',
    email_change_token_new = '',
    email_change = '',
    email_change_token_current = '',
    reauthentication_token = '',
    phone_change = '',
    phone_change_token = '',
    raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
    raw_user_meta_data = jsonb_build_object('full_name', demo.full_name),
    updated_at = now()
  from (
    values
      ('erwin@acdeducation.com', 'Erwin Curato'),
      ('mendoza@acdeducation.com', 'Maria Isabel Reyes'),
      ('bitas@acdeducation.com', 'John Frence Cuevas Bitas'),
      ('jose.santos@acdeducation.com', 'Jose Miguel A. Santos'),
      ('angela.villanueva@acdeducation.com', 'Angela Marie L. Villanueva'),
      ('panzo@acdeducation.com', 'Bien Panzo')
  ) as demo(email, full_name)
  where lower(existing.email) = lower(demo.email);

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    user_account.id::text,
    user_account.id,
    jsonb_build_object(
      'sub',
      user_account.id::text,
      'email',
      user_account.email,
      'email_verified',
      true,
      'phone_verified',
      false
    ),
    'email',
    now(),
    now(),
    now()
  from auth.users user_account
  where lower(user_account.email) in (
    'erwin@acdeducation.com',
    'mendoza@acdeducation.com',
    'bitas@acdeducation.com',
    'jose.santos@acdeducation.com',
    'angela.villanueva@acdeducation.com',
    'panzo@acdeducation.com'
  )
  on conflict (provider_id, provider) do update
  set
    identity_data = excluded.identity_data,
    updated_at = excluded.updated_at;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    department_id,
    account_status,
    position_title
  )
  select
    user_account.id,
    demo.email,
    demo.full_name,
    demo.role::public.user_role,
    department.id,
    'APPROVED'::public.account_status,
    demo.position_title
  from (
    values
      ('erwin@acdeducation.com', 'Erwin Curato', 'ADMIN', 'IT', null),
      ('mendoza@acdeducation.com', 'Maria Isabel Reyes', 'FACULTY', 'IT', 'Associate Professor II'),
      ('bitas@acdeducation.com', 'John Frence Cuevas Bitas', 'STUDENT', 'IT', null),
      ('jose.santos@acdeducation.com', 'Jose Miguel A. Santos', 'FACULTY', 'IT', 'Instructor III'),
      ('angela.villanueva@acdeducation.com', 'Angela Marie L. Villanueva', 'FACULTY', 'BSBA', 'Assistant Professor I'),
      ('panzo@acdeducation.com', 'Bien Panzo', 'STUDENT', 'BSBA', null)
  ) as demo(email, full_name, role, department_code, position_title)
  join auth.users user_account on lower(user_account.email) = lower(demo.email)
  join public.departments department on department.code = demo.department_code
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    department_id = excluded.department_id,
    account_status = excluded.account_status,
    position_title = excluded.position_title;

  if (select count(*) from public.profiles where id = any(v_seed_account_ids)) <> 6 then
    raise exception 'Seed aborted: expected six seeded profiles after upsert.';
  end if;

  -- If a developer-created slot for one of these faculty members overlaps a
  -- row below, the GiST exclusion constraint aborts the seed instead of
  -- deleting their slot. Remove the conflicting slot or run `make reset`.
  insert into public.availability_slots (
    id,
    faculty_id,
    date,
    start_time,
    end_time,
    status,
    mode,
    location,
    meeting_link
  )
  values
    -- Maria Isabel Reyes (IT)
    (
      'b0000000-0000-4000-8000-000000000001',
      v_mendoza_id,
      v_today - 21,
      '09:00',
      '10:00',
      'CLOSED',
      'IN_PERSON',
      'Room 201',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000002',
      v_mendoza_id,
      v_today - 10,
      '13:00',
      '14:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/mendoza-grade'
    ),
    (
      'b0000000-0000-4000-8000-000000000003',
      v_mendoza_id,
      v_today - 5,
      '10:00',
      '11:00',
      'OPEN',
      'IN_PERSON',
      'Room 202',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000004',
      v_mendoza_id,
      v_today - 30,
      '13:00',
      '14:00',
      'CLOSED',
      'IN_PERSON',
      'Room 203',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000005',
      v_mendoza_id,
      v_today + 2,
      '09:00',
      '10:00',
      'RESERVED',
      'IN_PERSON',
      'Room 204',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000006',
      v_mendoza_id,
      v_today + 3,
      '10:00',
      '11:00',
      'RESERVED',
      'ONLINE',
      null,
      'https://meet.example.com/mendoza-capstone'
    ),
    (
      'b0000000-0000-4000-8000-000000000007',
      v_mendoza_id,
      v_today + 1,
      '11:00',
      '12:00',
      'BOOKED',
      'IN_PERSON',
      'Room 205',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000008',
      v_mendoza_id,
      v_today + 5,
      '14:00',
      '15:00',
      'BOOKED',
      'ONLINE',
      null,
      'https://meet.example.com/mendoza-academic'
    ),
    (
      'b0000000-0000-4000-8000-000000000009',
      v_mendoza_id,
      v_today + 4,
      '13:00',
      '14:00',
      'OPEN',
      'IN_PERSON',
      'Room 206',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000010',
      v_mendoza_id,
      v_today + 7,
      '09:00',
      '10:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/mendoza-open'
    ),
    (
      'b0000000-0000-4000-8000-000000000011',
      v_mendoza_id,
      v_today + 8,
      '10:00',
      '11:00',
      'OPEN',
      'IN_PERSON',
      'Room 207',
      null
    ),
    -- Jose Miguel A. Santos (IT)
    (
      'b0000000-0000-4000-8000-000000000012',
      v_jose_id,
      v_today - 14,
      '10:00',
      '11:00',
      'CLOSED',
      'IN_PERSON',
      'Room 301',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000013',
      v_jose_id,
      v_today - 6,
      '14:00',
      '15:00',
      'OPEN',
      'IN_PERSON',
      'Room 302',
      null
    ),
    -- Angela Marie L. Villanueva (BSBA)
    (
      'b0000000-0000-4000-8000-000000000014',
      v_angela_id,
      v_today - 20,
      '13:00',
      '14:00',
      'CLOSED',
      'IN_PERSON',
      'Room 401',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000015',
      v_angela_id,
      v_today - 3,
      '09:00',
      '10:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/villanueva-grade'
    ),
    (
      'b0000000-0000-4000-8000-000000000016',
      v_angela_id,
      v_today + 3,
      '14:00',
      '15:00',
      'OPEN',
      'IN_PERSON',
      'Room 402',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000017',
      v_angela_id,
      v_today + 9,
      '09:00',
      '10:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/villanueva-open'
    );

  insert into public.consultations (
    id,
    student_id,
    faculty_id,
    availability_slot_id,
    category,
    notes,
    status,
    created_at,
    updated_at,
    completed_at,
    cancelled_at,
    outcome
  )
  values
    (
      'c0000000-0000-4000-8000-000000000001',
      v_bitas_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000001',
      'ACADEMIC',
      'Requested help with capstone literature review.',
      'COMPLETED',
      now() - interval '23 days',
      now() - interval '21 days',
      now() - interval '21 days',
      null,
      'Reviewed sources and agreed on next research steps.'
    ),
    (
      'c0000000-0000-4000-8000-000000000002',
      v_bitas_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000002',
      'GRADE',
      'Asked to reschedule after a schedule conflict.',
      'CANCELLED',
      now() - interval '12 days',
      now() - interval '10 days',
      null,
      now() - interval '10 days',
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000003',
      v_panzo_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000003',
      'CAPSTONE',
      'Requested review of a capstone proposal.',
      'REJECTED',
      now() - interval '7 days',
      now() - interval '5 days',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000004',
      v_bitas_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000004',
      'PERSONAL',
      'Discussed workload and time management.',
      'COMPLETED',
      now() - interval '32 days',
      now() - interval '30 days',
      now() - interval '30 days',
      null,
      'Created a study plan and agreed on weekly check-ins.'
    ),
    (
      'c0000000-0000-4000-8000-000000000005',
      v_bitas_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000005',
      'ACADEMIC',
      'Follow-up on practicum requirements.',
      'PENDING',
      now() - interval '1 day',
      now() - interval '1 day',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000006',
      v_panzo_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000006',
      'CAPSTONE',
      'Discussed capstone defense preparation.',
      'PENDING',
      now() - interval '1 day',
      now() - interval '1 day',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000007',
      v_bitas_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000007',
      'GRADE',
      'Requested a review of the midterm grade computation.',
      'APPROVED',
      now() - interval '3 days',
      now() - interval '2 days',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000008',
      v_panzo_id,
      v_mendoza_id,
      'b0000000-0000-4000-8000-000000000008',
      'ACADEMIC',
      'Asked about internship placement requirements.',
      'APPROVED',
      now() - interval '2 days',
      now() - interval '1 day',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000009',
      v_bitas_id,
      v_jose_id,
      'b0000000-0000-4000-8000-000000000012',
      'CAPSTONE',
      'Reviewed the capstone module outline.',
      'COMPLETED',
      now() - interval '16 days',
      now() - interval '14 days',
      now() - interval '14 days',
      null,
      'Adjusted scope and set milestones for the next sprint.'
    ),
    (
      'c0000000-0000-4000-8000-000000000010',
      v_panzo_id,
      v_jose_id,
      'b0000000-0000-4000-8000-000000000013',
      'PERSONAL',
      'Rescheduled because of a family emergency.',
      'CANCELLED',
      now() - interval '8 days',
      now() - interval '6 days',
      null,
      now() - interval '6 days',
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000011',
      v_panzo_id,
      v_angela_id,
      'b0000000-0000-4000-8000-000000000014',
      'OTHER',
      'Discussed a small business plan.',
      'COMPLETED',
      now() - interval '22 days',
      now() - interval '20 days',
      now() - interval '20 days',
      null,
      'Refined pricing and identified startup costs.'
    ),
    (
      'c0000000-0000-4000-8000-000000000012',
      v_bitas_id,
      v_angela_id,
      'b0000000-0000-4000-8000-000000000015',
      'GRADE',
      'Inquired about a business statistics grade.',
      'REJECTED',
      now() - interval '5 days',
      now() - interval '3 days',
      null,
      null,
      null
    );

  insert into public.notifications (
    id,
    recipient_id,
    type,
    title,
    message,
    entity_type,
    entity_id,
    read_at,
    created_at
  )
  values
    (
      'd0000000-0000-4000-8000-000000000001',
      v_bitas_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000001',
      now() - interval '20 days',
      now() - interval '21 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000002',
      v_mendoza_id,
      'CONSULTATION_CANCELLED',
      'Consultation cancelled',
      'A student cancelled a consultation request.',
      'consultation',
      'c0000000-0000-4000-8000-000000000002',
      now() - interval '9 days',
      now() - interval '10 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000003',
      v_panzo_id,
      'CONSULTATION_REJECTED',
      'Consultation request declined',
      'Your requested time was not approved.',
      'consultation',
      'c0000000-0000-4000-8000-000000000003',
      now() - interval '4 days',
      now() - interval '5 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000004',
      v_bitas_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000004',
      now() - interval '29 days',
      now() - interval '30 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000005',
      v_mendoza_id,
      'CONSULTATION_REQUEST',
      'New consultation request',
      'A student requested one of your available time slots.',
      'consultation',
      'c0000000-0000-4000-8000-000000000005',
      null,
      now() - interval '1 day'
    ),
    (
      'd0000000-0000-4000-8000-000000000006',
      v_mendoza_id,
      'CONSULTATION_REQUEST',
      'New consultation request',
      'A student requested one of your available time slots.',
      'consultation',
      'c0000000-0000-4000-8000-000000000006',
      null,
      now() - interval '1 day'
    ),
    (
      'd0000000-0000-4000-8000-000000000007',
      v_bitas_id,
      'CONSULTATION_APPROVED',
      'Consultation approved',
      'Your consultation schedule is confirmed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000007',
      null,
      now() - interval '2 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000008',
      v_panzo_id,
      'CONSULTATION_APPROVED',
      'Consultation approved',
      'Your consultation schedule is confirmed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000008',
      null,
      now() - interval '1 day'
    ),
    (
      'd0000000-0000-4000-8000-000000000009',
      v_bitas_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000009',
      now() - interval '13 days',
      now() - interval '14 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000010',
      v_jose_id,
      'CONSULTATION_CANCELLED',
      'Consultation cancelled',
      'A student cancelled a consultation request.',
      'consultation',
      'c0000000-0000-4000-8000-000000000010',
      now() - interval '5 days',
      now() - interval '6 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000011',
      v_panzo_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000011',
      now() - interval '19 days',
      now() - interval '20 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000012',
      v_bitas_id,
      'CONSULTATION_REJECTED',
      'Consultation request declined',
      'Your requested time was not approved.',
      'consultation',
      'c0000000-0000-4000-8000-000000000012',
      now() - interval '2 days',
      now() - interval '3 days'
    );

  insert into public.email_outbox (
    consultation_id,
    recipient_id,
    event_type,
    event_key,
    sent_at,
    created_at
  )
  values
    (
      'c0000000-0000-4000-8000-000000000001',
      v_bitas_id,
      'APPROVED',
      'c0000000-0000-4000-8000-000000000001:APPROVED',
      now() - interval '21 days',
      now() - interval '21 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000002',
      v_mendoza_id,
      'CANCELLED',
      'c0000000-0000-4000-8000-000000000002:CANCELLED',
      now() - interval '10 days',
      now() - interval '10 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000003',
      v_panzo_id,
      'REJECTED',
      'c0000000-0000-4000-8000-000000000003:REJECTED',
      now() - interval '5 days',
      now() - interval '5 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000004',
      v_bitas_id,
      'APPROVED',
      'c0000000-0000-4000-8000-000000000004:APPROVED',
      now() - interval '30 days',
      now() - interval '30 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000007',
      v_bitas_id,
      'APPROVED',
      'c0000000-0000-4000-8000-000000000007:APPROVED',
      now() - interval '2 days',
      now() - interval '2 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000008',
      v_panzo_id,
      'APPROVED',
      'c0000000-0000-4000-8000-000000000008:APPROVED',
      now() - interval '1 day',
      now() - interval '1 day'
    ),
    (
      'c0000000-0000-4000-8000-000000000009',
      v_bitas_id,
      'APPROVED',
      'c0000000-0000-4000-8000-000000000009:APPROVED',
      now() - interval '14 days',
      now() - interval '14 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000010',
      v_jose_id,
      'CANCELLED',
      'c0000000-0000-4000-8000-000000000010:CANCELLED',
      now() - interval '6 days',
      now() - interval '6 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000011',
      v_panzo_id,
      'APPROVED',
      'c0000000-0000-4000-8000-000000000011:APPROVED',
      now() - interval '20 days',
      now() - interval '20 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000012',
      v_bitas_id,
      'REJECTED',
      'c0000000-0000-4000-8000-000000000012:REJECTED',
      now() - interval '3 days',
      now() - interval '3 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000007',
      v_bitas_id,
      'REMINDER',
      'c0000000-0000-4000-8000-000000000007:REMINDER:' || v_bitas_id::text,
      now() - interval '2 hours',
      now() - interval '2 hours'
    ),
    (
      'c0000000-0000-4000-8000-000000000007',
      v_mendoza_id,
      'REMINDER',
      'c0000000-0000-4000-8000-000000000007:REMINDER:' || v_mendoza_id::text,
      now() - interval '2 hours',
      now() - interval '2 hours'
    );
end
$seed$;
