begin;
select plan(3);
select has_function('public','create_notification',array['uuid','text','text','text','text','uuid'],'notification helper exists');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('a0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin2@school.edu','',now(),'{}','{"full_name":"Admin Two"}',now(),now()),
('a0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','applicant@school.edu','',now(),'{}','{"full_name":"Applicant"}',now(),now());
update public.profiles set role='ADMIN',account_status='APPROVED' where id='a0000000-0000-0000-0000-000000000001';
update public.profiles set requested_role='STUDENT',department_id=(select id from public.departments limit 1),account_status='PENDING' where id='a0000000-0000-0000-0000-000000000002';
select results_eq($$select type from public.notifications where recipient_id='a0000000-0000-0000-0000-000000000001'$$,array['NEW_APPLICATION'::text],'admin receives new application notification');
select results_eq($$select entity_id from public.notifications where recipient_id='a0000000-0000-0000-0000-000000000001'$$,array['a0000000-0000-0000-0000-000000000002'::uuid],'application notification links to applicant');
select * from finish();
rollback;
