begin;
select plan(5);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
('a3000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','email-faculty@school.edu','',now(),'{}','{"full_name":"Email Faculty"}',now(),now()),
('a3000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','email-student@school.edu','',now(),'{}','{"full_name":"Email Student"}',now(),now());

update public.profiles
set role = 'FACULTY', position_title = 'Instructor', account_status = 'APPROVED',
    department_id = (select id from public.departments where code = 'IT')
where id = 'a3000000-0000-0000-0000-000000000001';

update public.profiles
set role = 'STUDENT', account_status = 'APPROVED',
    department_id = (select id from public.departments where code = 'IT')
where id = 'a3000000-0000-0000-0000-000000000002';

insert into public.availability_slots (
  id, faculty_id, date, start_time, end_time, status, mode, location
)
values (
  'b3000000-0000-0000-0000-000000000001',
  'a3000000-0000-0000-0000-000000000001',
  current_date + 2, '09:00', '10:00', 'BOOKED', 'IN_PERSON', 'Email retry room'
);

insert into public.consultations (
  id, student_id, faculty_id, availability_slot_id, category, status
)
values (
  'c3000000-0000-0000-0000-000000000001',
  'a3000000-0000-0000-0000-000000000002',
  'a3000000-0000-0000-0000-000000000001',
  'b3000000-0000-0000-0000-000000000001',
  'PERSONAL', 'APPROVED'
);

insert into public.email_outbox (consultation_id, recipient_id, event_type, event_key)
values (
  'c3000000-0000-0000-0000-000000000001',
  'a3000000-0000-0000-0000-000000000002',
  'APPROVED',
  'email-retry-lease-check'
);

select lives_ok(
  $$select public.mark_email_failed((select id from public.email_outbox where event_key = 'email-retry-lease-check'),'provider failed')$$,
  'failed email can be recorded'
);
select is(
  (select last_error from public.email_outbox where event_key = 'email-retry-lease-check'),
  'provider failed',
  'failure reason is stored'
);
select ok(
  (select locked_until > now() + interval '9 minutes' from public.email_outbox where event_key = 'email-retry-lease-check'),
  'failed email keeps a retry lease'
);

select lives_ok(
  $$select public.mark_email_sent((select id from public.email_outbox where event_key = 'email-retry-lease-check'))$$,
  'failed email can be marked sent'
);
select ok(
  (select sent_at is not null and last_error is null and last_error_at is null and locked_until is null
   from public.email_outbox where event_key = 'email-retry-lease-check'),
  'marking sent clears failure state'
);

select * from finish();
rollback;
