begin;
select plan(8);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('aa000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner-update@school.edu','',now(),'{}','{}',now(),now()),
('bb000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other-update@school.edu','',now(),'{}','{}',now(),now()),
('cc000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-update@school.edu','',now(),'{}','{}',now(),now());
update public.profiles set role='FACULTY',position_title='Instructor',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id in ('aa000000-0000-0000-0000-000000000001','bb000000-0000-0000-0000-000000000002');
update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='cc000000-0000-0000-0000-000000000003';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.create_availability(current_date+1,'09:00','10:00','IN_PERSON','Room 1',null)$$,'faculty creates a slot');
reset role;

create temp table test_slot as select id from public.availability_slots where faculty_id='aa000000-0000-0000-0000-000000000001' limit 1;
grant select on test_slot to authenticated;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.update_open_availability((select id from test_slot),current_date+1,'14:00','15:00','IN_PERSON','Room 2',null)$$,'faculty updates own open slot');
reset role;

select results_eq($$select start_time::text from public.availability_slots where faculty_id='aa000000-0000-0000-0000-000000000001'$$,array['14:00:00'::text],'updated start time is persisted');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"cc000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select lives_ok($$select public.book_consultation((select id from test_slot),'PERSONAL','update flow check')$$,'student books the slot');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select results_eq(
  $$select category, student_name is not null from public.list_own_availability() where id=(select id from test_slot)$$,
  $$values ('PERSONAL'::text, true)$$,
  'linked request includes the student and category'
);
select throws_ok($$select public.update_open_availability((select id from test_slot),current_date+1,'16:00','17:00','IN_PERSON','Room 2',null)$$,'23514','Open availability not found','reserved slot cannot be updated');
select throws_ok($$select public.update_open_availability((select id from test_slot),current_date-1,'16:00','17:00','IN_PERSON','Room 2',null)$$,'22023','Availability cannot be in the past','past date is rejected');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bb000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select throws_ok($$select public.update_open_availability((select id from test_slot),current_date+1,'16:00','17:00','IN_PERSON','Room 2',null)$$,'23514','Open availability not found','other faculty cannot update the slot');
reset role;

select * from finish();
rollback;
