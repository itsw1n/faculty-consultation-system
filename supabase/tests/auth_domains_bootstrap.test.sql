begin;
select plan(15);

delete from public.approved_email_domains where domain = '*';

select ok(not public.is_approved_email('stranger@gmail.com'), 'outside domain is rejected');
select ok(public.is_approved_email('student@acdeducation.com'), 'school domain is accepted');
select ok(not public.is_approved_email('x@acdeducation.com@evil.com'), 'multi-at trick is rejected');
select throws_ok(
  $$insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('d1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','outsider@gmail.com','',now(),'{}','{}',now(),now())$$,
  '22023', 'School email required', 'outside domain cannot register'
);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('d2000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','applicant@acdeducation.com','',now(),'{}','{}',now(),now()),
('d3000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','boss@acdeducation.com','',now(),'{}','{}',now(),now()),
('d5000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','legacy-in@acdeducation.com','',now(),'{}','{}',now(),now());

insert into public.approved_email_domains (domain) values ('gmail.com');
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d4000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','legacy@gmail.com','',now(),'{}','{}',now(),now());
delete from public.approved_email_domains where domain = 'gmail.com';

update public.profiles
set department_id = (select id from public.departments where code='IT'),
    account_status = 'PENDING', role = null
where id in ('d4000000-0000-0000-0000-000000000004', 'd5000000-0000-0000-0000-000000000005');

select results_eq($$select role::text from public.profiles where id='d2000000-0000-0000-0000-000000000002'$$, array['STUDENT'::text], 'school email starts as Student');
select results_eq($$select account_status::text from public.profiles where id='d2000000-0000-0000-0000-000000000002'$$, array['APPROVED'::text], 'school profile is eligible');

-- Existing local test data may contain an admin. Restore it on rollback.
update public.profiles set role='STUDENT' where role='ADMIN' and account_status='APPROVED';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d3000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select throws_ok(
  $$select public.claim_first_admin('d3000000-0000-0000-0000-000000000003','boss@acdeducation.com')$$,
  '42501', 'permission denied for function claim_first_admin', 'authenticated callers cannot invoke bootstrap RPC'
);
reset role;

set local role service_role;
select lives_ok(
  $$select public.claim_first_admin('d3000000-0000-0000-0000-000000000003','boss@acdeducation.com')$$,
  'server-only bootstrap claims first admin'
);
select throws_ok(
  $$select public.claim_first_admin('d3000000-0000-0000-0000-000000000003','boss@acdeducation.com')$$,
  '23514', 'An administrator already exists', 'second claim fails'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"d3000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select lives_ok($$select public.correct_user_account('d2000000-0000-0000-0000-000000000002','FACULTY',(select id from public.departments where code='IT'),'Lecturer')$$, 'admin corrects role and department');
select lives_ok($$select public.correct_user_account('d2000000-0000-0000-0000-000000000002','FACULTY',(select id from public.departments where code='IT'),null)$$, 'repeat correction keeps position');
select throws_ok($$select public.correct_user_account('d2000000-0000-0000-0000-000000000002','ADMIN',(select id from public.departments where code='IT'),null)$$, '22023', 'Invalid role', 'Admin role cannot be granted through correction');
select throws_ok($$select public.correct_user_account('d3000000-0000-0000-0000-000000000003','FACULTY',(select id from public.departments where code='IT'),'Dean')$$, '42501', 'You cannot change your own account', 'self correction is rejected');
reset role;

select results_eq($$select role::text from public.profiles where id='d2000000-0000-0000-0000-000000000002'$$, array['FACULTY'::text], 'corrected role persists');
select results_eq($$select position_title from public.profiles where id='d2000000-0000-0000-0000-000000000002'$$, array['Lecturer'::text], 'existing position is retained');

select * from finish();
rollback;
