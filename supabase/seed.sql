-- Local development seed. This file runs only with `supabase db reset`
-- on your own machine. It is never applied to hosted environments,
-- which receive migrations only. Do not move these rows into a migration.
--
-- The wildcard allows any email domain locally so the team can sign up
-- with any email address. Strict domain checks still run in tests:
-- every pgTAP test removes this row before asserting.
do $seed$
declare
  v_admin_id uuid;
  v_faculty1_id uuid;
  v_faculty2_id uuid;
  v_faculty3_id uuid;
  v_student_id uuid;
begin
  insert into public.approved_email_domains (domain)
  values ('*')
  on conflict (domain) do nothing;

  -- Reuse an existing local account with the same email when one is already
  -- present. Only the rows with these stable ids are replaced below.
  select id into v_admin_id from public.profiles where lower(email) = 'admin.demo@acdeducation.com';
  select id into v_faculty1_id from public.profiles where lower(email) = 'faculty.demo@acdeducation.com';
  select id into v_faculty2_id from public.profiles where lower(email) = 'jose.santos@acdeducation.com';
  select id into v_faculty3_id from public.profiles where lower(email) = 'angela.villanueva@acdeducation.com';
  select id into v_student_id from public.profiles where lower(email) = 'student.demo@acdeducation.com';

  delete from public.email_outbox
  where recipient_id in (v_admin_id, v_faculty1_id, v_faculty2_id, v_faculty3_id, v_student_id)
    or consultation_id in (
      select id
      from public.consultations
      where id in (
          'c0000000-0000-4000-8000-000000000001',
          'c0000000-0000-4000-8000-000000000002',
          'c0000000-0000-4000-8000-000000000003',
          'c0000000-0000-4000-8000-000000000004',
          'c0000000-0000-4000-8000-000000000005',
          'c0000000-0000-4000-8000-000000000006',
          'c0000000-0000-4000-8000-000000000007',
          'c0000000-0000-4000-8000-000000000008',
          'c0000000-0000-4000-8000-000000000009',
          'c0000000-0000-4000-8000-000000000010',
          'c0000000-0000-4000-8000-000000000011',
          'c0000000-0000-4000-8000-000000000012'
        )
        or availability_slot_id in (
          'b0000000-0000-4000-8000-000000000001',
          'b0000000-0000-4000-8000-000000000002',
          'b0000000-0000-4000-8000-000000000003',
          'b0000000-0000-4000-8000-000000000004',
          'b0000000-0000-4000-8000-000000000005',
          'b0000000-0000-4000-8000-000000000006',
          'b0000000-0000-4000-8000-000000000007',
          'b0000000-0000-4000-8000-000000000008',
          'b0000000-0000-4000-8000-000000000009',
          'b0000000-0000-4000-8000-000000000010',
          'b0000000-0000-4000-8000-000000000011',
          'b0000000-0000-4000-8000-000000000012',
          'b0000000-0000-4000-8000-000000000013',
          'b0000000-0000-4000-8000-000000000014',
          'b0000000-0000-4000-8000-000000000015',
          'b0000000-0000-4000-8000-000000000016',
          'b0000000-0000-4000-8000-000000000017',
          'b0000000-0000-4000-8000-000000000018',
          'b0000000-0000-4000-8000-000000000019',
          'b0000000-0000-4000-8000-000000000020'
        )
    );

  delete from public.consultations
  where id in (
      'c0000000-0000-4000-8000-000000000001',
      'c0000000-0000-4000-8000-000000000002',
      'c0000000-0000-4000-8000-000000000003',
      'c0000000-0000-4000-8000-000000000004',
      'c0000000-0000-4000-8000-000000000005',
      'c0000000-0000-4000-8000-000000000006',
      'c0000000-0000-4000-8000-000000000007',
      'c0000000-0000-4000-8000-000000000008',
      'c0000000-0000-4000-8000-000000000009',
      'c0000000-0000-4000-8000-000000000010',
      'c0000000-0000-4000-8000-000000000011',
      'c0000000-0000-4000-8000-000000000012'
    )
    or availability_slot_id in (
      'b0000000-0000-4000-8000-000000000001',
      'b0000000-0000-4000-8000-000000000002',
      'b0000000-0000-4000-8000-000000000003',
      'b0000000-0000-4000-8000-000000000004',
      'b0000000-0000-4000-8000-000000000005',
      'b0000000-0000-4000-8000-000000000006',
      'b0000000-0000-4000-8000-000000000007',
      'b0000000-0000-4000-8000-000000000008',
      'b0000000-0000-4000-8000-000000000009',
      'b0000000-0000-4000-8000-000000000010',
      'b0000000-0000-4000-8000-000000000011',
      'b0000000-0000-4000-8000-000000000012',
      'b0000000-0000-4000-8000-000000000013',
      'b0000000-0000-4000-8000-000000000014',
      'b0000000-0000-4000-8000-000000000015',
      'b0000000-0000-4000-8000-000000000016',
      'b0000000-0000-4000-8000-000000000017',
      'b0000000-0000-4000-8000-000000000018',
      'b0000000-0000-4000-8000-000000000019',
      'b0000000-0000-4000-8000-000000000020'
    );

  delete from public.availability_slots
  where id in (
    'b0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000005',
    'b0000000-0000-4000-8000-000000000006',
    'b0000000-0000-4000-8000-000000000007',
    'b0000000-0000-4000-8000-000000000008',
    'b0000000-0000-4000-8000-000000000009',
    'b0000000-0000-4000-8000-000000000010',
    'b0000000-0000-4000-8000-000000000011',
    'b0000000-0000-4000-8000-000000000012',
    'b0000000-0000-4000-8000-000000000013',
    'b0000000-0000-4000-8000-000000000014',
    'b0000000-0000-4000-8000-000000000015',
    'b0000000-0000-4000-8000-000000000016',
    'b0000000-0000-4000-8000-000000000017',
    'b0000000-0000-4000-8000-000000000018',
    'b0000000-0000-4000-8000-000000000019',
    'b0000000-0000-4000-8000-000000000020'
  );

  delete from public.notifications
  where id in (
    'd0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000002',
    'd0000000-0000-4000-8000-000000000003',
    'd0000000-0000-4000-8000-000000000004',
    'd0000000-0000-4000-8000-000000000005',
    'd0000000-0000-4000-8000-000000000006',
    'd0000000-0000-4000-8000-000000000007',
    'd0000000-0000-4000-8000-000000000008',
    'd0000000-0000-4000-8000-000000000009',
    'd0000000-0000-4000-8000-000000000010',
    'd0000000-0000-4000-8000-000000000011',
    'd0000000-0000-4000-8000-000000000012'
  );

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
        'admin.demo@acdeducation.com',
        'Demo Admin'
      ),
      (
        'a0000000-0000-4000-8000-000000000002'::uuid,
        'faculty.demo@acdeducation.com',
        'Maria Cristina D. Reyes'
      ),
      (
        'a0000000-0000-4000-8000-000000000003'::uuid,
        'student.demo@acdeducation.com',
        'Erwin James P. Dela Cruz'
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
      ('admin.demo@acdeducation.com', 'Demo Admin'),
      ('faculty.demo@acdeducation.com', 'Maria Cristina D. Reyes'),
      ('student.demo@acdeducation.com', 'Erwin James P. Dela Cruz'),
      ('jose.santos@acdeducation.com', 'Jose Miguel A. Santos'),
      ('angela.villanueva@acdeducation.com', 'Angela Marie L. Villanueva')
  ) as demo(email, full_name)
  where lower(existing.email) = lower(demo.email);

  select id into v_admin_id from auth.users where lower(email) = 'admin.demo@acdeducation.com';
  select id into v_faculty1_id from auth.users where lower(email) = 'faculty.demo@acdeducation.com';
  select id into v_faculty2_id from auth.users where lower(email) = 'jose.santos@acdeducation.com';
  select id into v_faculty3_id from auth.users where lower(email) = 'angela.villanueva@acdeducation.com';
  select id into v_student_id from auth.users where lower(email) = 'student.demo@acdeducation.com';

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
    'admin.demo@acdeducation.com',
    'faculty.demo@acdeducation.com',
    'student.demo@acdeducation.com',
    'jose.santos@acdeducation.com',
    'angela.villanueva@acdeducation.com'
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
      (
        'admin.demo@acdeducation.com',
        'Demo Admin',
        'ADMIN',
        'IT',
        null
      ),
      (
        'faculty.demo@acdeducation.com',
        'Maria Cristina D. Reyes',
        'FACULTY',
        'IT',
        'Associate Professor II'
      ),
      (
        'jose.santos@acdeducation.com',
        'Jose Miguel A. Santos',
        'FACULTY',
        'IT',
        'Instructor III'
      ),
      (
        'angela.villanueva@acdeducation.com',
        'Angela Marie L. Villanueva',
        'FACULTY',
        'BSBA',
        'Assistant Professor I'
      ),
      (
        'student.demo@acdeducation.com',
        'Erwin James P. Dela Cruz',
        'STUDENT',
        'IT',
        null
      )
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
    -- Maria Cristina D. Reyes (IT)
    (
      'b0000000-0000-4000-8000-000000000001',
      v_faculty1_id,
      current_date - 14,
      '09:00',
      '10:00',
      'CLOSED',
      'IN_PERSON',
      'Room 201',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000002',
      v_faculty1_id,
      current_date - 7,
      '13:00',
      '14:00',
      'OPEN',
      'IN_PERSON',
      'Room 202',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000003',
      v_faculty1_id,
      current_date - 3,
      '10:00',
      '11:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/reyes-capstone'
    ),
    (
      'b0000000-0000-4000-8000-000000000004',
      v_faculty1_id,
      current_date + 2,
      '09:00',
      '10:00',
      'RESERVED',
      'IN_PERSON',
      'Room 203',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000005',
      v_faculty1_id,
      current_date + 7,
      '13:00',
      '14:00',
      'BOOKED',
      'ONLINE',
      null,
      'https://meet.example.com/reyes-academic'
    ),
    (
      'b0000000-0000-4000-8000-000000000006',
      v_faculty1_id,
      current_date + 3,
      '09:00',
      '10:00',
      'OPEN',
      'IN_PERSON',
      'Room 204',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000007',
      v_faculty1_id,
      current_date + 3,
      '14:00',
      '15:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/reyes-open'
    ),
    (
      'b0000000-0000-4000-8000-000000000008',
      v_faculty1_id,
      current_date + 4,
      '10:00',
      '11:00',
      'OPEN',
      'IN_PERSON',
      'Room 205',
      null
    ),
    -- Jose Miguel A. Santos (IT)
    (
      'b0000000-0000-4000-8000-000000000009',
      v_faculty2_id,
      current_date - 18,
      '10:00',
      '11:00',
      'CLOSED',
      'IN_PERSON',
      'Room 301',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000010',
      v_faculty2_id,
      current_date - 2,
      '14:00',
      '15:00',
      'OPEN',
      'IN_PERSON',
      'Room 302',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000011',
      v_faculty2_id,
      current_date + 1,
      '09:00',
      '10:00',
      'RESERVED',
      'IN_PERSON',
      'Room 303',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000012',
      v_faculty2_id,
      current_date + 5,
      '10:00',
      '11:00',
      'BOOKED',
      'ONLINE',
      null,
      'https://meet.example.com/santos-advising'
    ),
    (
      'b0000000-0000-4000-8000-000000000013',
      v_faculty2_id,
      current_date + 6,
      '13:00',
      '14:00',
      'OPEN',
      'IN_PERSON',
      'Room 304',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000014',
      v_faculty2_id,
      current_date + 8,
      '15:00',
      '16:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/santos-open'
    ),
    -- Angela Marie L. Villanueva (BSBA)
    (
      'b0000000-0000-4000-8000-000000000015',
      v_faculty3_id,
      current_date - 30,
      '13:00',
      '14:00',
      'CLOSED',
      'IN_PERSON',
      'Room 401',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000016',
      v_faculty3_id,
      current_date - 4,
      '09:00',
      '10:00',
      'OPEN',
      'IN_PERSON',
      'Room 402',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000017',
      v_faculty3_id,
      current_date + 2,
      '13:00',
      '14:00',
      'BOOKED',
      'ONLINE',
      null,
      'https://meet.example.com/villanueva-business'
    ),
    (
      'b0000000-0000-4000-8000-000000000018',
      v_faculty3_id,
      current_date + 5,
      '14:00',
      '15:00',
      'OPEN',
      'IN_PERSON',
      'Room 403',
      null
    ),
    (
      'b0000000-0000-4000-8000-000000000019',
      v_faculty3_id,
      current_date + 9,
      '09:00',
      '10:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/villanueva-open'
    ),
    (
      'b0000000-0000-4000-8000-000000000020',
      v_faculty3_id,
      current_date + 10,
      '13:00',
      '14:00',
      'OPEN',
      'IN_PERSON',
      'Room 404',
      null
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
    -- Maria Cristina D. Reyes
    (
      'c0000000-0000-4000-8000-000000000001',
      v_student_id,
      v_faculty1_id,
      'b0000000-0000-4000-8000-000000000001',
      'ACADEMIC',
      'Requested help with capstone literature review.',
      'COMPLETED',
      now() - interval '21 days',
      now() - interval '14 days',
      now() - interval '14 days',
      null,
      'Reviewed sources and agreed on next steps.'
    ),
    (
      'c0000000-0000-4000-8000-000000000002',
      v_student_id,
      v_faculty1_id,
      'b0000000-0000-4000-8000-000000000002',
      'GRADE',
      'Question about a final grade computation.',
      'CANCELLED',
      now() - interval '10 days',
      now() - interval '7 days',
      null,
      now() - interval '7 days',
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000003',
      v_student_id,
      v_faculty1_id,
      'b0000000-0000-4000-8000-000000000003',
      'CAPSTONE',
      'Wanted feedback on a project proposal.',
      'REJECTED',
      now() - interval '5 days',
      now() - interval '3 days',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000004',
      v_student_id,
      v_faculty1_id,
      'b0000000-0000-4000-8000-000000000004',
      'GRADE',
      'Please review my midterm score.',
      'PENDING',
      now() - interval '2 days',
      now() - interval '2 days',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000005',
      v_student_id,
      v_faculty1_id,
      'b0000000-0000-4000-8000-000000000005',
      'ACADEMIC',
      'Discuss practicum requirements.',
      'APPROVED',
      now() - interval '1 day',
      now() - interval '1 day',
      null,
      null,
      null
    ),
    -- Jose Miguel A. Santos
    (
      'c0000000-0000-4000-8000-000000000006',
      v_student_id,
      v_faculty2_id,
      'b0000000-0000-4000-8000-000000000009',
      'CAPSTONE',
      'Wanted a review of the capstone module outline.',
      'COMPLETED',
      now() - interval '25 days',
      now() - interval '18 days',
      now() - interval '18 days',
      null,
      'Adjusted scope and set milestones for the next sprint.'
    ),
    (
      'c0000000-0000-4000-8000-000000000007',
      v_student_id,
      v_faculty2_id,
      'b0000000-0000-4000-8000-000000000010',
      'PERSONAL',
      'Needed to reschedule because of a family emergency.',
      'CANCELLED',
      now() - interval '6 days',
      now() - interval '2 days',
      null,
      now() - interval '2 days',
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000008',
      v_student_id,
      v_faculty2_id,
      'b0000000-0000-4000-8000-000000000011',
      'ACADEMIC',
      'Consultation about internship requirements.',
      'PENDING',
      now() - interval '1 day',
      now() - interval '1 day',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000009',
      v_student_id,
      v_faculty2_id,
      'b0000000-0000-4000-8000-000000000012',
      'CAPSTONE',
      'Advising on capstone defense preparation.',
      'APPROVED',
      now() - interval '2 days',
      now() - interval '1 day',
      null,
      null,
      null
    ),
    -- Angela Marie L. Villanueva
    (
      'c0000000-0000-4000-8000-000000000010',
      v_student_id,
      v_faculty3_id,
      'b0000000-0000-4000-8000-000000000015',
      'OTHER',
      'Consultation for a side business plan.',
      'COMPLETED',
      now() - interval '35 days',
      now() - interval '30 days',
      now() - interval '30 days',
      null,
      'Refined the pricing model and identified startup costs.'
    ),
    (
      'c0000000-0000-4000-8000-000000000011',
      v_student_id,
      v_faculty3_id,
      'b0000000-0000-4000-8000-000000000016',
      'GRADE',
      'Inquire about a business statistics grade.',
      'REJECTED',
      now() - interval '6 days',
      now() - interval '4 days',
      null,
      null,
      null
    ),
    (
      'c0000000-0000-4000-8000-000000000012',
      v_student_id,
      v_faculty3_id,
      'b0000000-0000-4000-8000-000000000017',
      'ACADEMIC',
      'Discuss a minor in business administration.',
      'APPROVED',
      now() - interval '2 days',
      now() - interval '1 day',
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
      v_faculty1_id,
      'CONSULTATION_REQUEST',
      'New consultation request',
      'A student requested one of your available time slots.',
      'consultation',
      'c0000000-0000-4000-8000-000000000004',
      null,
      now() - interval '2 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000002',
      v_faculty1_id,
      'CONSULTATION_CANCELLED',
      'Consultation cancelled',
      'A student cancelled a consultation request.',
      'consultation',
      'c0000000-0000-4000-8000-000000000002',
      now() - interval '6 days',
      now() - interval '7 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000003',
      v_student_id,
      'CONSULTATION_APPROVED',
      'Consultation approved',
      'Your consultation schedule is confirmed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000005',
      null,
      now() - interval '1 day'
    ),
    (
      'd0000000-0000-4000-8000-000000000004',
      v_student_id,
      'CONSULTATION_REJECTED',
      'Consultation request declined',
      'Your requested time was not approved.',
      'consultation',
      'c0000000-0000-4000-8000-000000000003',
      now() - interval '2 days',
      now() - interval '3 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000005',
      v_student_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000001',
      now() - interval '13 days',
      now() - interval '14 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000006',
      v_faculty2_id,
      'CONSULTATION_REQUEST',
      'New consultation request',
      'A student requested one of your available time slots.',
      'consultation',
      'c0000000-0000-4000-8000-000000000008',
      null,
      now() - interval '1 day'
    ),
    (
      'd0000000-0000-4000-8000-000000000007',
      v_faculty2_id,
      'CONSULTATION_CANCELLED',
      'Consultation cancelled',
      'A student cancelled a consultation request.',
      'consultation',
      'c0000000-0000-4000-8000-000000000007',
      now() - interval '1 day',
      now() - interval '2 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000008',
      v_student_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000006',
      now() - interval '17 days',
      now() - interval '18 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000009',
      v_student_id,
      'CONSULTATION_APPROVED',
      'Consultation approved',
      'Your consultation schedule is confirmed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000009',
      null,
      now() - interval '1 day'
    ),
    (
      'd0000000-0000-4000-8000-000000000010',
      v_student_id,
      'CONSULTATION_COMPLETED',
      'Consultation completed',
      'Your faculty member marked the consultation as completed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000010',
      now() - interval '29 days',
      now() - interval '30 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000011',
      v_student_id,
      'CONSULTATION_REJECTED',
      'Consultation request declined',
      'Your requested time was not approved.',
      'consultation',
      'c0000000-0000-4000-8000-000000000011',
      now() - interval '3 days',
      now() - interval '4 days'
    ),
    (
      'd0000000-0000-4000-8000-000000000012',
      v_student_id,
      'CONSULTATION_APPROVED',
      'Consultation approved',
      'Your consultation schedule is confirmed.',
      'consultation',
      'c0000000-0000-4000-8000-000000000012',
      null,
      now() - interval '1 day'
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
      'c0000000-0000-4000-8000-000000000002',
      v_faculty1_id,
      'CANCELLED',
      'c0000000-0000-4000-8000-000000000002:CANCELLED',
      now() - interval '7 days',
      now() - interval '7 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000003',
      v_student_id,
      'REJECTED',
      'c0000000-0000-4000-8000-000000000003:REJECTED',
      now() - interval '3 days',
      now() - interval '3 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000007',
      v_faculty2_id,
      'CANCELLED',
      'c0000000-0000-4000-8000-000000000007:CANCELLED',
      now() - interval '2 days',
      now() - interval '2 days'
    ),
    (
      'c0000000-0000-4000-8000-000000000011',
      v_student_id,
      'REJECTED',
      'c0000000-0000-4000-8000-000000000011:REJECTED',
      now() - interval '4 days',
      now() - interval '4 days'
    );
end
$seed$;
