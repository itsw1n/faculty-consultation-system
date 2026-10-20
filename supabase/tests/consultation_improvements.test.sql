begin;
select plan(21);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('11000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student-improvements@school.edu','',now(),'{}','{}',now(),now()),
('22000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','faculty-improvements@school.edu','',now(),'{}','{}',now(),now()),
('33000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other-improvements@school.edu','',now(),'{}','{}',now(),now()),
('44000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin-improvements@school.edu','',now(),'{}','{}',now(),now());
update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id in ('11000000-0000-0000-0000-000000000001','33000000-0000-0000-0000-000000000003');
update public.profiles set role='FACULTY',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='22000000-0000-0000-0000-000000000002';
update public.profiles set role='ADMIN',account_status='APPROVED' where id='44000000-0000-0000-0000-000000000004';
insert into public.availability_slots(id,faculty_id,date,start_time,end_time,mode,location)
values ('55000000-0000-0000-0000-000000000005','22000000-0000-0000-0000-000000000002',current_date+1,'09:00','10:00','IN_PERSON','Room 1');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select throws_ok($$select public.book_consultation('55000000-0000-0000-0000-000000000005','INVALID',null)$$,'22023','Invalid consultation details','invalid category is rejected');
select lives_ok($$select public.book_consultation('55000000-0000-0000-0000-000000000005','PERSONAL','private description')$$,'valid category books');
select results_eq($$select description from public.get_consultation_detail((select id from public.consultations limit 1))$$,array['private description'::text],'student sees own description');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"33000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select is_empty('select id from public.consultations','other student cannot read consultation table');
select is_empty($$select id from public.get_consultation_detail((select id from public.consultations limit 1))$$,'other student cannot read details');
select throws_ok($$select public.consultation_summary(current_date,current_date+1)$$,'42501','Admin access required','other student cannot export report');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"44000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select is_empty('select id from public.consultations','admin cannot read raw consultation');
select is_empty($$select id from public.get_consultation_detail((select id from public.consultations limit 1))$$,'admin cannot read participant details');
select results_eq($$select count(*)::int from public.search_my_consultations() where notes is not null$$,array[0],'admin listing redacts every description');
select results_eq($$select count(*)::int from public.consultation_summary(current_date,current_date+1) where category='PERSONAL'$$,array[1],'admin sees category summary');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"22000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.decide_consultation((select id from public.consultations limit 1),true)$$,'faculty approves');
reset role;
select results_eq($$select public.queue_tomorrow_reminders()$$,array[2],'next day queues two reminders');
select results_eq($$select public.queue_tomorrow_reminders()$$,array[0],'reminder queue is idempotent');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"22000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.complete_consultation_with_outcome((select id from public.consultations limit 1),'Follow up next week')$$,'faculty completes with outcome');
select results_eq($$select outcome from public.get_consultation_detail((select id from public.consultations limit 1))$$,array['Follow up next week'::text],'faculty sees outcome');
select throws_ok($$select public.complete_consultation_with_outcome((select id from public.consultations limit 1),null)$$,'23514','Consultation cannot be completed','cannot complete twice');
reset role;

select results_eq($$select event_type from public.email_outbox where event_type='APPROVED'$$,array['APPROVED'::text],'approval enqueues email');
select results_eq($$select count(*)::int from public.claim_email_batch(25)$$,array[1],'only current approved email is claimed');
select results_eq($$select attempts from public.email_outbox where event_type='APPROVED'$$,array[1],'claim records an attempt');
select lives_ok($$select public.mark_email_sent((select id from public.email_outbox where event_type='APPROVED'))$$,'sent email can be acknowledged');
select results_eq($$select count(*)::int from public.claim_email_batch(25)$$,array[0],'sent email is not claimed again');

select * from finish();
rollback;
