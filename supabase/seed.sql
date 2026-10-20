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
  v_faculty_id uuid;
  v_student_id uuid;
begin
  insert into public.approved_email_domains (domain, note)
  values ('*', 'LOCAL DEV ONLY - allow any email domain')
  on conflict (domain) do nothing;

  -- Reuse an existing local account with the same email when one is already
  -- present. Only the rows with these stable ids are replaced below.
  select id into v_admin_id from public.profiles where lower(email) = 'erwinjrcurato8975@acdeducation.com';
  select id into v_faculty_id from public.profiles where lower(email) = 'itsw1nmade@gmail.com';
  select id into v_student_id from public.profiles where lower(email) = 'erwincurato@gmail.com';

  delete from public.email_outbox
  where recipient_id in (v_admin_id, v_faculty_id, v_student_id)
    or consultation_id in (
      select id
      from public.consultations
      where id in (
          'c0000000-0000-4000-8000-000000000001',
          'c0000000-0000-4000-8000-000000000002',
          'c0000000-0000-4000-8000-000000000003',
          'c0000000-0000-4000-8000-000000000004',
          'c0000000-0000-4000-8000-000000000005'
        )
        or availability_slot_id in (
          'b0000000-0000-4000-8000-000000000001',
          'b0000000-0000-4000-8000-000000000002',
          'b0000000-0000-4000-8000-000000000003',
          'b0000000-0000-4000-8000-000000000004',
          'b0000000-0000-4000-8000-000000000005',
          'b0000000-0000-4000-8000-000000000006',
          'b0000000-0000-4000-8000-000000000007',
          'b0000000-0000-4000-8000-000000000008'
        )
    );

  delete from public.consultations
  where id in (
      'c0000000-0000-4000-8000-000000000001',
      'c0000000-0000-4000-8000-000000000002',
      'c0000000-0000-4000-8000-000000000003',
      'c0000000-0000-4000-8000-000000000004',
      'c0000000-0000-4000-8000-000000000005'
    )
    or availability_slot_id in (
      'b0000000-0000-4000-8000-000000000001',
      'b0000000-0000-4000-8000-000000000002',
      'b0000000-0000-4000-8000-000000000003',
      'b0000000-0000-4000-8000-000000000004',
      'b0000000-0000-4000-8000-000000000005',
      'b0000000-0000-4000-8000-000000000006',
      'b0000000-0000-4000-8000-000000000007',
      'b0000000-0000-4000-8000-000000000008'
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
    'b0000000-0000-4000-8000-000000000008'
  );

  delete from public.notifications
  where id in (
    'd0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000002',
    'd0000000-0000-4000-8000-000000000003',
    'd0000000-0000-4000-8000-000000000004',
    'd0000000-0000-4000-8000-000000000005'
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
        'erwinjrcurato8975@acdeducation.com',
        'Erwin Curato Jr.'
      ),
      ('a0000000-0000-4000-8000-000000000002'::uuid, 'itsw1nmade@gmail.com', 'Made W1n'),
      ('a0000000-0000-4000-8000-000000000003'::uuid, 'erwincurato@gmail.com', 'Erwin Curato')
  ) as demo(id, email, full_name)
  where not exists (
    select 1 from auth.users existing where lower(existing.email) = lower(demo.email)
  );

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
      ('erwinjrcurato8975@acdeducation.com', 'Erwin Curato Jr.'),
      ('itsw1nmade@gmail.com', 'Made W1n'),
      ('erwincurato@gmail.com', 'Erwin Curato')
  ) as demo(email, full_name)
  where lower(existing.email) = lower(demo.email);

  select id into v_admin_id from auth.users where lower(email) = 'erwinjrcurato8975@acdeducation.com';
  select id into v_faculty_id from auth.users where lower(email) = 'itsw1nmade@gmail.com';
  select id into v_student_id from auth.users where lower(email) = 'erwincurato@gmail.com';

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
    'erwinjrcurato8975@acdeducation.com',
    'itsw1nmade@gmail.com',
    'erwincurato@gmail.com'
  )
  on conflict (provider_id, provider) do update
  set
    identity_data = excluded.identity_data,
    updated_at = excluded.updated_at;

  insert into public.profiles (id, email, full_name, role, requested_role, department_id, account_status)
  select
    user_account.id,
    demo.email,
    demo.full_name,
    demo.role::public.user_role,
    null,
    department.id,
    'APPROVED'::public.account_status
  from (
    values
      (
        'erwinjrcurato8975@acdeducation.com',
        'Erwin Curato Jr.',
        'ADMIN',
        'IT'
      ),
      ('itsw1nmade@gmail.com', 'Made W1n', 'FACULTY', 'IT'),
      ('erwincurato@gmail.com', 'Erwin Curato', 'STUDENT', 'IT')
  ) as demo(email, full_name, role, department_code)
  join auth.users user_account on lower(user_account.email) = lower(demo.email)
  join public.departments department on department.code = demo.department_code
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    requested_role = null,
    department_id = excluded.department_id,
    account_status = excluded.account_status;

  insert into public.faculty_profiles (user_id, position_title, consultation_mode_default)
  values (v_faculty_id, 'Instructor I', 'IN_PERSON')
  on conflict (user_id) do update
  set
    position_title = excluded.position_title,
    consultation_mode_default = excluded.consultation_mode_default;

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
    (
      'b0000000-0000-4000-8000-000000000001',
      v_faculty_id,
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
      v_faculty_id,
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
      v_faculty_id,
      current_date - 3,
      '10:00',
      '11:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/demo-capstone'
    ),
    (
      'b0000000-0000-4000-8000-000000000004',
      v_faculty_id,
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
      v_faculty_id,
      current_date + 7,
      '13:00',
      '14:00',
      'BOOKED',
      'ONLINE',
      null,
      'https://meet.example.com/demo-academic'
    ),
    (
      'b0000000-0000-4000-8000-000000000006',
      v_faculty_id,
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
      v_faculty_id,
      current_date + 3,
      '14:00',
      '15:00',
      'OPEN',
      'ONLINE',
      null,
      'https://meet.example.com/demo-open'
    ),
    (
      'b0000000-0000-4000-8000-000000000008',
      v_faculty_id,
      current_date + 4,
      '10:00',
      '11:00',
      'OPEN',
      'IN_PERSON',
      'Room 205',
      null
    );

  insert into public.consultations (
    id,
    student_id,
    faculty_id,
    availability_slot_id,
    purpose,
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
      v_student_id,
      v_faculty_id,
      'b0000000-0000-4000-8000-000000000001',
      'ACADEMIC',
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
      v_faculty_id,
      'b0000000-0000-4000-8000-000000000002',
      'GRADE',
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
      v_faculty_id,
      'b0000000-0000-4000-8000-000000000003',
      'CAPSTONE',
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
      v_faculty_id,
      'b0000000-0000-4000-8000-000000000004',
      'GRADE',
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
      v_faculty_id,
      'b0000000-0000-4000-8000-000000000005',
      'ACADEMIC',
      'ACADEMIC',
      'Discuss practicum requirements.',
      'APPROVED',
      now() - interval '1 day',
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
      v_faculty_id,
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
      v_faculty_id,
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
    );
end
$seed$;
