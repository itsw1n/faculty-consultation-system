begin;
select plan(8);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('aa000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','export-faculty@school.edu','',now(),'{}','{"full_name":"Export Faculty"}',now(),now()),
('aa000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','export-student@school.edu','',now(),'{}','{"full_name":"Export Student"}',now(),now()),
('aa000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','export-other-faculty@school.edu','',now(),'{}','{"full_name":"Other Export Faculty"}',now(),now());

update public.profiles set role='FACULTY',position_title='Instructor',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id in ('aa000000-0000-0000-0000-000000000001','aa000000-0000-0000-0000-000000000003');
update public.profiles set role='STUDENT',account_status='APPROVED',department_id=(select id from public.departments where code='IT') where id='aa000000-0000-0000-0000-000000000002';

insert into public.availability_slots(id,faculty_id,date,start_time,end_time,status,mode,location,meeting_link)
values
('bb000000-0000-0000-0000-000000000001','aa000000-0000-0000-0000-000000000001','2026-10-24','09:00','10:00','CLOSED','IN_PERSON','Export room',null),
('bb000000-0000-0000-0000-000000000002','aa000000-0000-0000-0000-000000000001','2026-11-24','09:00','10:00','BOOKED','ONLINE',null,'https://private.example.test/meeting'),
('bb000000-0000-0000-0000-000000000003','aa000000-0000-0000-0000-000000000003','2026-11-24','11:00','12:00','BOOKED','IN_PERSON','Other faculty room',null);

insert into public.consultations(id,student_id,faculty_id,availability_slot_id,category,notes,status,completed_at,outcome)
values
('cc000000-0000-0000-0000-000000000001','aa000000-0000-0000-0000-000000000002','aa000000-0000-0000-0000-000000000001','bb000000-0000-0000-0000-000000000001','PERSONAL','private note','COMPLETED',now(),'private outcome'),
('cc000000-0000-0000-0000-000000000002','aa000000-0000-0000-0000-000000000002','aa000000-0000-0000-0000-000000000001','bb000000-0000-0000-0000-000000000002','ACADEMIC','private online note','APPROVED',null,'private outcome'),
('cc000000-0000-0000-0000-000000000003','aa000000-0000-0000-0000-000000000002','aa000000-0000-0000-0000-000000000003','bb000000-0000-0000-0000-000000000003','PERSONAL','other faculty note','COMPLETED',now(),'other outcome');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select results_eq($$select consultation_status::text from public.export_my_faculty_consultations('2026-10-24','2026-10-24')$$,array['COMPLETED'::text],'faculty can export own completed records in range');
select results_eq($$select student_name from public.export_my_faculty_consultations('2026-11-24','2026-11-24')$$,array['Export Student'::text],'faculty export includes own student names');
select results_eq($$select count(*)::int from public.export_my_faculty_consultations('2026-10-24','2026-11-24')$$,array[2],'export is scoped to caller and date range');
select results_eq($$select count(*)::int from public.export_my_faculty_consultations('2026-12-01','2026-12-31')$$,array[0],'empty date range returns no rows');
select ok(not (to_jsonb(export_row) ?| array['notes','outcome','meeting_link']), 'export omits private notes, outcomes, and meeting links') from public.export_my_faculty_consultations('2026-11-24','2026-11-24') export_row limit 1;
select throws_ok($$select * from public.export_my_faculty_consultations('2026-11-24','2026-10-24')$$,'22023','Invalid consultation export date range','reversed date range is rejected');
select throws_ok($$select * from public.export_my_faculty_consultations('2025-01-01','2026-01-02')$$,'22023','Invalid consultation export date range','range over 366 days is rejected');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select throws_ok($$select * from public.export_my_faculty_consultations('2026-10-24','2026-11-24')$$,'42501','Approved faculty access required','students cannot use faculty export');
reset role;

select * from finish();
rollback;
