begin;
select plan(8);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('77000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','dashboard-faculty@school.edu','',now(),'{}','{"full_name":"Dashboard Faculty"}',now(),now()),
('77000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','dashboard-student@school.edu','',now(),'{}','{"full_name":"Dashboard Student"}',now(),now()),
('77000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','dashboard-other@school.edu','',now(),'{}','{"full_name":"Other Faculty"}',now(),now()),
('77000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','dashboard-admin@school.edu','',now(),'{}','{"full_name":"Dashboard Admin"}',now(),now());

update public.profiles set role='FACULTY',position_title='Instructor',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='77000000-0000-0000-0000-000000000001';
update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='77000000-0000-0000-0000-000000000002';
update public.profiles set role='FACULTY',position_title='Instructor',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='77000000-0000-0000-0000-000000000003';
update public.profiles set role='ADMIN',account_status='APPROVED' where id='77000000-0000-0000-0000-000000000004';

insert into public.availability_slots (id,faculty_id,date,start_time,end_time,status,mode,location)
values
('88000000-0000-0000-0000-000000000001','77000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date - 1,'09:00','10:00','OPEN','IN_PERSON','Past room'),
('88000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000001','2027-06-01','13:00','14:00','OPEN','IN_PERSON','Future room'),
('88000000-0000-0000-0000-000000000003','77000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date + 1,'09:00','10:00','RESERVED','IN_PERSON','Pending room'),
('88000000-0000-0000-0000-000000000004','77000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date + 1,'11:00','12:00','BOOKED','IN_PERSON','Approved room'),
('88000000-0000-0000-0000-000000000005','77000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date + 2,'09:00','10:00','BOOKED','ONLINE',null),
('88000000-0000-0000-0000-000000000006','77000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date + 3,'10:00','11:00','OPEN','IN_PERSON','Future room'),
('88000000-0000-0000-0000-000000000007','77000000-0000-0000-0000-000000000003',(now() at time zone 'Asia/Manila')::date + 1,'09:00','10:00','OPEN','IN_PERSON','Other room'),
('88000000-0000-0000-0000-000000000008','77000000-0000-0000-0000-000000000001',(now() at time zone 'Asia/Manila')::date - 2,'15:00','16:00','CLOSED','IN_PERSON','Past closed room');

insert into public.consultations (id,student_id,faculty_id,availability_slot_id,category,notes,status)
values
('99000000-0000-0000-0000-000000000001','77000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000001','88000000-0000-0000-0000-000000000003','ACADEMIC','Pending notes','PENDING'),
('99000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000001','88000000-0000-0000-0000-000000000004','GRADE',null,'APPROVED'),
('99000000-0000-0000-0000-000000000003','77000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000001','88000000-0000-0000-0000-000000000005','CAPSTONE',null,'APPROVED'),
('99000000-0000-0000-0000-000000000004','77000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000001','88000000-0000-0000-0000-000000000008','PERSONAL',null,'APPROVED'),
('99000000-0000-0000-0000-000000000005','77000000-0000-0000-0000-000000000002','77000000-0000-0000-0000-000000000003','88000000-0000-0000-0000-000000000007','OTHER',null,'APPROVED');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"77000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select throws_ok($$select * from public.faculty_dashboard_summary()$$,'42501','Faculty access required','student cannot read faculty dashboard summary');
select throws_ok($$select * from public.list_my_upcoming_consultations(5)$$,'42501','Faculty access required','student cannot list faculty dashboard agenda');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"77000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select throws_ok($$select * from public.faculty_dashboard_summary()$$,'42501','Faculty access required','admin cannot read faculty dashboard summary');
select throws_ok($$select * from public.list_my_upcoming_consultations(5)$$,'42501','Faculty access required','admin cannot list faculty dashboard agenda');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"77000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select results_eq(
  $$select pending, open_slots, next_open_date, next_open_start_time, next_open_end_time from public.faculty_dashboard_summary()$$,
  $$values (1::bigint, 2::bigint, (now() at time zone 'Asia/Manila')::date + 3, '10:00'::time, '11:00'::time)$$,
  'summary returns caller counts and the next open slot'
);
select results_eq(
  $$select consultation_status, slot_date, start_time from public.list_my_upcoming_consultations(5)$$,
  $$values ('APPROVED'::public.consultation_status,(now() at time zone 'Asia/Manila')::date + 1,'11:00'::time), ('APPROVED'::public.consultation_status,(now() at time zone 'Asia/Manila')::date + 2,'09:00'::time)$$,
  'agenda returns approved future consultations in slot order'
);
select results_eq($$select count(*)::int from public.list_my_upcoming_consultations(-5)$$,array[1],'agenda clamps the lower limit');
select results_eq($$select count(*)::int from public.list_my_upcoming_consultations(100)$$,array[2],'agenda returns only the caller approved future consultations');
reset role;

select * from finish();
rollback;
