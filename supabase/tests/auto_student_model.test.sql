begin;
select plan(10);

delete from public.approved_email_domains where domain = '*';

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('e1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','plain@acdeducation.com','',now(),'{}','{}',now(),now()),
('e3000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','boss2@acdeducation.com','',now(),'{}','{}',now(),now()),
('e4000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','outsider2@gmail.com','',now(),'{}','{}',now(),now());

select results_eq($$select role::text from public.profiles where id='e1000000-0000-0000-0000-000000000001'$$,array['STUDENT'::text],'school email auto lands as student');
select results_eq($$select account_status::text from public.profiles where id='e1000000-0000-0000-0000-000000000001'$$,array['APPROVED'::text],'school email is approved on first sign in');
select is_empty($$select id from public.profiles where id='e4000000-0000-0000-0000-000000000004' and account_status='APPROVED'$$,'outsider is not approved');

insert into public.profiles (id, email, full_name, role, account_status, department_id)
values ('e3000000-0000-0000-0000-000000000003','boss2@acdeducation.com','Boss','ADMIN','APPROVED',(select id from public.departments where code='IT'))
on conflict (id) do update set role='ADMIN', account_status='APPROVED';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"e3000000-0000-0000-0000-000000000003","role":"authenticated"}',true);

select throws_ok(
  $$select public.invite_faculty(array['invited@acdeducation.com'],'00000000-0000-0000-0000-000000000000','Lecturer')$$,
  '23503', 'Invalid department',
  'invalid department raises'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"e3000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select results_eq(
  $$select email from public.invite_faculty(array['invited@acdeducation.com','outsider2@gmail.com'],(select id from public.departments where code='IT'),'Lecturer') order by email$$,
  array['invited@acdeducation.com'::text,'outsider2@gmail.com'::text],
  'both candidate emails are reported'
);
select results_eq(
  $$select invited::text from public.invite_faculty(array['invited@acdeducation.com'],(select id from public.departments where code='IT'),'Lecturer') order by email$$,
  array['true'::text],
  'school email invite is accepted'
);
select results_eq(
  $$select reason from public.invite_faculty(array['outsider2@gmail.com'],(select id from public.departments where code='IT'),'Lecturer')$$,
  array['Not a school email'::text],
  'outside email is reported not invited'
);
select throws_ok(
  $$select public.invite_faculty(array['invited@acdeducation.com'],(select id from public.departments where code='IT'),null)$$,
  '22023', 'Faculty position is required',
  'missing position is rejected'
);
select throws_ok(
  $$select public.invite_faculty('{}',(select id from public.departments where code='IT'),'Lecturer')$$,
  '22023', 'Invite between 1 and 50 emails',
  'empty invite list is rejected'
);
reset role;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('e2000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','invited@acdeducation.com','',now(),'{}','{}',now(),now());

select results_eq(
  $$select role::text from public.profiles where id='e2000000-0000-0000-0000-000000000002'$$,
  array['FACULTY'::text],
  'invited email auto lands as faculty on first sign in'
);
select results_eq(
  $$select position_title from public.faculty_profiles where user_id='e2000000-0000-0000-0000-000000000002'$$,
  array['Lecturer'::text],
  'invited faculty position is recorded'
);

select * from finish();
rollback;
