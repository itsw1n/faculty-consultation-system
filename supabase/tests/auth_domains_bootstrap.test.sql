begin;
select plan(15);

delete from public.approved_email_domains where domain = '*';

select ok(not public.is_approved_email('stranger@gmail.com'),'outside domain is rejected');
select ok(public.is_approved_email('student@student.acd.edu.ph'),'placeholder student domain is accepted');
select ok(not public.is_approved_email('x@student.acd.edu.ph@evil.com'),'multi-at trick is rejected');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('d1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','outsider@gmail.com','',now(),'{}','{}',now(),now()),
('d2000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','applicant@student.acd.edu.ph','',now(),'{}','{}',now(),now()),
('d3000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','boss@faculty.acd.edu.ph','',now(),'{}','{}',now(),now()),
('d4000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','legacy@gmail.com','',now(),'{}','{}',now(),now());
insert into public.profiles (id, email, full_name, requested_role, department_id, account_status)
values ('d4000000-0000-0000-0000-000000000004','legacy@gmail.com','Legacy Applicant','STUDENT',(select id from public.departments where code='IT'),'PENDING');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d1000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select throws_ok($$select public.submit_application('STUDENT',(select id from public.departments where code='IT'),null)$$,'22023','School email required','outside domain cannot apply');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d2000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select lives_ok($$select public.submit_application('STUDENT',(select id from public.departments where code='IT'),null)$$,'school email can apply');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d3000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select lives_ok($$select public.claim_first_admin('boss@faculty.acd.edu.ph')$$,'designated email claims first admin');
select throws_ok($$select public.claim_first_admin('boss@faculty.acd.edu.ph')$$,'23514','An administrator already exists','second claim fails');
select lives_ok($$select public.review_application('d2000000-0000-0000-0000-000000000002','APPROVED')$$,'admin approves school applicant');
select throws_ok($$select public.review_application('d4000000-0000-0000-0000-000000000004','APPROVED')$$,'22023','School email required','legacy outside application cannot be approved');
select lives_ok($$select public.correct_user_account('d2000000-0000-0000-0000-000000000002','FACULTY',(select id from public.departments where code='IT'),'Lecturer')$$,'admin corrects role and department');
select lives_ok($$select public.correct_user_account('d2000000-0000-0000-0000-000000000002','FACULTY',(select id from public.departments where code='IT'),null)$$,'repeat correction without a position keeps the current one');
select throws_ok($$select public.correct_user_account('d2000000-0000-0000-0000-000000000002','ADMIN',(select id from public.departments where code='IT'),null)$$,'22023','Invalid role','admin role cannot be granted through correction');
select throws_ok($$select public.correct_user_account('d3000000-0000-0000-0000-000000000003','FACULTY',(select id from public.departments where code='IT'),'Dean')$$,'42501','You cannot change your own account','self correction is rejected');
reset role;

select results_eq($$select role::text from public.profiles where id='d2000000-0000-0000-0000-000000000002'$$,array['FACULTY'::text],'corrected role is persisted');
select results_eq($$select position_title from public.faculty_profiles where user_id='d2000000-0000-0000-0000-000000000002'$$,array['Lecturer'::text],'existing position is kept when none is supplied');

select * from finish();
rollback;
