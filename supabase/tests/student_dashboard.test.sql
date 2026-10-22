begin;
select plan(10);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('a1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-dashboard@school.edu','',now(),'{}','{"full_name":"Dashboard Student"}',now(),now()),
('a1000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-dashboard-other@school.edu','',now(),'{}','{"full_name":"Other Student"}',now(),now()),
('a1000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-dashboard-faculty@school.edu','',now(),'{}','{"full_name":"Dashboard Faculty"}',now(),now()),
('a1000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-dashboard-admin@school.edu','',now(),'{}','{"full_name":"Dashboard Admin"}',now(),now()),
('a1000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-dashboard-empty@school.edu','',now(),'{}','{"full_name":"Empty Student"}',now(),now()),
('a1000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-dashboard-pending@school.edu','',now(),'{}','{"full_name":"Pending Student"}',now(),now());

update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='a1000000-0000-0000-0000-000000000001';
update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='a1000000-0000-0000-0000-000000000002';
update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='a1000000-0000-0000-0000-000000000005';
update public.profiles set role=null,requested_role='STUDENT',account_status='PENDING',department_id=(select id from public.departments where code='IT') where id='a1000000-0000-0000-0000-000000000006';
update public.profiles set role='FACULTY',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='a1000000-0000-0000-0000-000000000003';
update public.profiles set role='ADMIN',account_status='APPROVED' where id='a1000000-0000-0000-0000-000000000004';

insert into public.availability_slots (id,faculty_id,date,start_time,end_time,status,mode,location)
values
('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date - 1,'09:00','10:00','BOOKED','IN_PERSON','Past room'),
('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date + 1,'09:00','10:00','BOOKED','IN_PERSON','Tomorrow room'),
('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date + 1,'11:00','12:00','RESERVED','IN_PERSON','Pending room'),
('b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date + 2,'09:00','10:00','CLOSED','ONLINE',null),
('b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date + 3,'09:00','10:00','BOOKED','ONLINE',null),
('b1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date,'00:00:00','00:00:01','BOOKED','IN_PERSON','Ended room'),
('b1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date + 1,'12:00','13:00','BOOKED','IN_PERSON','Tomorrow afternoon room');

insert into public.consultations (id,student_id,faculty_id,availability_slot_id,purpose,category,notes,status,completed_at)
values
('c1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000001','ACADEMIC','ACADEMIC',null,'APPROVED',null),
('c1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000002','GRADE','GRADE',null,'APPROVED',null),
('c1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000003','CAPSTONE','CAPSTONE',null,'PENDING',null),
('c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000004','PERSONAL','PERSONAL',null,'COMPLETED',now()),
('c1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000005','OTHER','OTHER',null,'APPROVED',null),
('c1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000006','PERSONAL','PERSONAL',null,'APPROVED',null),
('c1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000007','OTHER','OTHER',null,'APPROVED',null);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select throws_ok($$select * from public.student_dashboard_summary()$$,'42501','Student access required','faculty cannot read the student dashboard summary');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select throws_ok($$select * from public.student_dashboard_summary()$$,'42501','Student access required','admin cannot read the student dashboard summary');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-0000-0000-000000000006","role":"authenticated"}',true);
select throws_ok($$select * from public.student_dashboard_summary()$$,'42501','Student access required','unapproved student cannot read the student dashboard summary');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-0000-0000-000000000005","role":"authenticated"}',true);
select results_eq(
  $$select pending, upcoming, completed, next_consultation_id, next_faculty_name from public.student_dashboard_summary()$$,
  $$values (0::bigint, 0::bigint, 0::bigint, null::uuid, null::text)$$,
  'student with no consultations gets zero counts and no next appointment'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select results_eq(
  $$select pending, upcoming, completed from public.student_dashboard_summary()$$,
  $$values (1::bigint, 2::bigint, 1::bigint)$$,
  'counts exclude past approved consultations and other students'
);
select results_eq(
  $$select next_faculty_name, next_faculty_department, next_purpose, next_slot_date, next_start_time, next_end_time, next_mode, next_location from public.student_dashboard_summary()$$,
  $$values ('Dashboard Faculty','Information Technology','GRADE',(now() at time zone 'Asia/Manila')::date + 1,'09:00'::time,'10:00'::time,'IN_PERSON'::public.consultation_mode,'Tomorrow room')$$,
  'next appointment is the earliest confirmed future slot'
);
select results_eq(
  $$select next_consultation_id from public.student_dashboard_summary()$$,
  $$values ('c1000000-0000-0000-0000-000000000002'::uuid)$$,
  'next appointment returns the consultation id'
);
select is((select count(*)::int from public.student_dashboard_summary()),1,'summary returns exactly one row');
select cmp_ok(
  (select next_slot_date from public.student_dashboard_summary()),
  '>',
  (now() at time zone 'Asia/Manila')::date,
  'next appointment is in the future'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select results_eq(
  $$select pending, upcoming, completed from public.student_dashboard_summary()$$,
  $$values (0::bigint, 1::bigint, 0::bigint)$$,
  'summary is scoped to the signed-in student'
);
reset role;

select * from finish();
rollback;
