begin;
select plan(12);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student@school.edu','',now(),'{}','{"full_name":"Student One"}',now(),now()),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','faculty@school.edu','',now(),'{}','{"full_name":"Faculty One"}',now(),now()),
('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other@school.edu','',now(),'{}','{"full_name":"Other Student"}',now(),now());

update public.profiles set role='STUDENT',requested_role='STUDENT',account_status='APPROVED' where id in ('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000003');
update public.profiles set role='FACULTY',requested_role='FACULTY',account_status='APPROVED' where id='20000000-0000-0000-0000-000000000002';
insert into public.faculty_profiles(user_id,position_title) values('20000000-0000-0000-0000-000000000002','Instructor');
insert into public.availability_slots(id,faculty_id,date,start_time,end_time,mode,location) values('40000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002',current_date+1,'09:00','10:00','IN_PERSON','Room 1');

set local role anon;
select throws_ok('select id from public.departments','42501','permission denied for table departments','anonymous users cannot list departments');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select results_eq('select email from public.profiles order by email',array['student@school.edu'::text],'student can read only own profile');
select lives_ok($$select public.book_consultation('40000000-0000-0000-0000-000000000004','Academic guidance',null)$$,'student can atomically reserve an open slot');
reset role;

select results_eq($$select status::text from public.availability_slots where id='40000000-0000-0000-0000-000000000004'$$,array['RESERVED'::text],'booking reserves the slot');
select results_eq($$select status::text from public.consultations where availability_slot_id='40000000-0000-0000-0000-000000000004'$$,array['PENDING'::text],'booking creates a pending consultation');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select throws_ok($$select public.book_consultation('40000000-0000-0000-0000-000000000004','Second request',null)$$,'40001','Slot is no longer available','a second student cannot reserve the same slot');
select is_empty('select id from public.consultations','another student cannot read the consultation');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.decide_consultation((select id from public.consultations where availability_slot_id='40000000-0000-0000-0000-000000000004'),true)$$,'assigned faculty can approve the request');
reset role;
select results_eq($$select status::text from public.availability_slots where id='40000000-0000-0000-0000-000000000004'$$,array['BOOKED'::text],'approval books the slot');
select results_eq($$select status::text from public.consultations where availability_slot_id='40000000-0000-0000-0000-000000000004'$$,array['APPROVED'::text],'approval confirms the consultation');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.cancel_consultation((select id from public.consultations where availability_slot_id='40000000-0000-0000-0000-000000000004'))$$,'student can cancel own approved consultation');
reset role;
select results_eq($$select status::text from public.availability_slots where id='40000000-0000-0000-0000-000000000004'$$,array['OPEN'::text],'cancellation reopens the slot');

select * from finish();
rollback;
