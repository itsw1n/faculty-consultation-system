begin;
select plan(15);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
('a2000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hardening-faculty@school.edu','',now(),'{}','{"full_name":"Hardening Faculty"}',now(),now()),
('a2000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hardening-student@school.edu','',now(),'{}','{"full_name":"Hardening Student"}',now(),now()),
('a2000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hardening-no-dept@school.edu','',now(),'{}','{"full_name":"No Department Student"}',now(),now()),
('a2000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hardening-owner@school.edu','',now(),'{}','{"full_name":"Student Slot Owner"}',now(),now()),
('a2000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hardening-admin@school.edu','',now(),'{}','{"full_name":"Hardening Admin"}',now(),now());

update public.profiles
set role = 'FACULTY', position_title = 'Instructor', account_status = 'APPROVED',
    department_id = (select id from public.departments where code = 'IT')
where id = 'a2000000-0000-0000-0000-000000000001';

update public.profiles
set role = 'STUDENT', account_status = 'APPROVED',
    department_id = (select id from public.departments where code = 'IT')
where id in (
  'a2000000-0000-0000-0000-000000000002',
  'a2000000-0000-0000-0000-000000000004'
);

update public.profiles
set role = 'STUDENT', account_status = 'APPROVED', department_id = null
where id = 'a2000000-0000-0000-0000-000000000003';

update public.profiles
set role = 'ADMIN', account_status = 'APPROVED'
where id = 'a2000000-0000-0000-0000-000000000005';

insert into public.availability_slots (id, faculty_id, date, start_time, end_time, status, mode, location, meeting_link)
values
('b2000000-0000-0000-0000-000000000001','a2000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date - 1,'09:00','10:00','OPEN','IN_PERSON','Past room',null),
('b2000000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000001','2027-05-03','09:00','10:00','OPEN','IN_PERSON','History room',null),
('b2000000-0000-0000-0000-000000000003','a2000000-0000-0000-0000-000000000001','2027-05-02','11:00','12:00','OPEN','ONLINE',null,'https://meet.example.com/room/1'),
('b2000000-0000-0000-0000-000000000004','a2000000-0000-0000-0000-000000000004','2027-05-04','13:00','14:00','OPEN','IN_PERSON','Student room',null),
('b2000000-0000-0000-0000-000000000005','a2000000-0000-0000-0000-000000000001','2027-05-01','09:00','10:00','RESERVED','IN_PERSON','No department room',null),
('b2000000-0000-0000-0000-000000000006','a2000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date,'00:00','00:00:01','BOOKED','IN_PERSON','Ended room',null),
('b2000000-0000-0000-0000-000000000007','a2000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date + 1,'17:00','18:00','BOOKED','IN_PERSON','Tomorrow room',null);

insert into public.consultations (
  id, student_id, faculty_id, availability_slot_id, category, notes, status
)
values
('c2000000-0000-0000-0000-000000000001','a2000000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000001','b2000000-0000-0000-0000-000000000002','PERSONAL',null,'REJECTED'),
('c2000000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000003','a2000000-0000-0000-0000-000000000001','b2000000-0000-0000-0000-000000000005','ACADEMIC',null,'PENDING'),
('c2000000-0000-0000-0000-000000000003','a2000000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000001','b2000000-0000-0000-0000-000000000006','OTHER',null,'APPROVED'),
('c2000000-0000-0000-0000-000000000004','a2000000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000001','b2000000-0000-0000-0000-000000000007','GRADE',null,'APPROVED'),
('c2000000-0000-0000-0000-000000000005','a2000000-0000-0000-0000-000000000002','a2000000-0000-0000-0000-000000000001','b2000000-0000-0000-0000-000000000003','CAPSTONE',null,'PENDING');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select throws_ok(
  $$select public.book_consultation('b2000000-0000-0000-0000-000000000001','PERSONAL',null)$$,
  '40001','Slot is no longer available','past slots cannot be booked'
);
select throws_ok(
  $$select public.book_consultation('b2000000-0000-0000-0000-000000000004','PERSONAL',null)$$,
  '40001','Slot is no longer available','slots owned by non-faculty cannot be booked'
);
select results_eq(
  $$select count(*)::int from public.list_faculty_slots('a2000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date - 1,(now() at time zone 'Asia/Manila')::date - 1)$$,
  array[0],
  'past slots are omitted from the student schedule'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select throws_ok(
  $$select public.update_open_availability('b2000000-0000-0000-0000-000000000004','2027-05-04','14:00','15:00','IN_PERSON','Student room',null)$$,
  '42501','Approved faculty access required','students cannot update a slot they own'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select throws_ok(
  $$select public.update_open_availability('b2000000-0000-0000-0000-000000000002','2027-05-03','10:00','11:00','IN_PERSON','History room',null)$$,
  '23514','Availability has consultation history','slots with history cannot be edited'
);
select throws_ok(
  $$select public.delete_open_availability('b2000000-0000-0000-0000-000000000002')$$,
  '23514','Availability has consultation history','slots with history cannot be deleted'
);
select results_eq(
  $$select has_history from public.list_own_availability() where id = 'b2000000-0000-0000-0000-000000000002'$$,
  array[true],
  'availability exposes its history flag'
);
select results_eq(
  $$select count(*)::int from public.list_own_availability() where id = 'b2000000-0000-0000-0000-000000000001'$$,
  array[0],
  'past availability is omitted from the faculty list'
);
select results_eq(
  $$select slot_date, start_time from public.list_my_upcoming_consultations(10)$$,
  $$values ((now() at time zone 'Asia/Manila')::date + 1, '17:00'::time)$$,
  'agenda excludes consultations that already ended today'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select results_eq(
  $$select meeting_link from public.get_consultation_detail('c2000000-0000-0000-0000-000000000005')$$,
  array['https://meet.example.com/room/1'::text],
  'consultation detail includes the online meeting link'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-0000-0000-000000000005","role":"authenticated"}',true);
select is(
  (select meeting_link from public.search_my_consultations('',null,null,null,50)
   where id = 'c2000000-0000-0000-0000-000000000005'),
  null,
  'admins do not receive meeting links'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-0000-0000-000000000005","role":"authenticated"}',true);
select results_eq(
  $$select total::int from public.consultation_summary('2027-05-01','2027-05-01') where department = 'UNASSIGNED' and category = 'ACADEMIC'$$,
  array[1],
  'students without a department are reported as UNASSIGNED'
);
select throws_ok(
  $$select * from public.consultation_summary('2026-01-01','2027-01-02')$$,
  '22023','Invalid date range','reports longer than 366 days are rejected'
);
reset role;

insert into public.email_outbox (consultation_id, recipient_id, event_type, event_key)
values (
  'c2000000-0000-0000-0000-000000000002',
  'a2000000-0000-0000-0000-000000000003',
  'APPROVED',
  'hardening-lease-check'
);

select lives_ok(
  $$select public.mark_email_failed((select id from public.email_outbox where event_key = 'hardening-lease-check'),'provider failed')$$,
  'failed email can be recorded'
);
select ok(
  (select locked_until > now() + interval '9 minutes' from public.email_outbox where event_key = 'hardening-lease-check'),
  'failed email keeps a retry lease'
);

select * from finish();
rollback;
