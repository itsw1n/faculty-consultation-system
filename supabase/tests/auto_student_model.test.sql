begin;
select plan(13);

delete from public.approved_email_domains where domain = '*';

insert into public.faculty_invites (email, department_id, position_title)
values ('plain@acdeducation.com', (select id from public.departments where code='IT'), 'Old invite');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('e1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','plain@acdeducation.com','',now(),'{}','{}',now(),now()),
('e2000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','unverified@acdeducation.com','',null,'{}','{}',now(),now()),
('e3000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','boss2@acdeducation.com','',now(),'{}','{}',now(),now());

select results_eq($$select role::text from public.profiles where id='e1000000-0000-0000-0000-000000000001'$$, array['STUDENT'::text], 'school account starts as Student');
select results_eq($$select account_status::text from public.profiles where id='e1000000-0000-0000-0000-000000000001'$$, array['APPROVED'::text], 'profile is eligible while Auth enforces email verification');
select results_eq($$select consumed_at is null from public.faculty_invites where email='plain@acdeducation.com'$$, array[true], 'legacy invite is not consumed');
select throws_ok(
  $$insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('e4000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','outsider2@gmail.com','',now(),'{}','{}',now(),now())$$,
  '22023', 'School email required', 'disallowed domain cannot create an Auth account'
);

update public.profiles set role='ADMIN', account_status='APPROVED'
where id='e3000000-0000-0000-0000-000000000003';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"e3000000-0000-0000-0000-000000000003","role":"authenticated"}',true);

select throws_ok(
  $$select public.promote_registered_faculty('plain@acdeducation.com','00000000-0000-0000-0000-000000000000','Lecturer')$$,
  '23503', 'Invalid department', 'department must exist'
);
select results_eq(
  $$select public.promote_registered_faculty('missing@acdeducation.com',(select id from public.departments where code='IT'),'Lecturer')$$,
  array['NOT_REGISTERED'::text], 'unknown email needs registration'
);
select results_eq(
  $$select public.promote_registered_faculty('unverified@acdeducation.com',(select id from public.departments where code='IT'),'Lecturer')$$,
  array['NOT_VERIFIED'::text], 'unverified user cannot be promoted'
);
select results_eq(
  $$select public.promote_registered_faculty('plain@acdeducation.com',(select id from public.departments where code='IT'),'Lecturer')$$,
  array['PROMOTED'::text], 'verified Student is promoted'
);
select results_eq(
  $$select public.promote_registered_faculty('PLAIN@ACDEDUCATION.COM',(select id from public.departments where code='IT'),'Lecturer')$$,
  array['ALREADY_FACULTY'::text], 'email lookup ignores capitalization and prevents repeat promotion'
);
select results_eq(
  $$select public.promote_registered_faculty('outsider2@gmail.com',(select id from public.departments where code='IT'),'Lecturer')$$,
  array['DOMAIN_NOT_ALLOWED'::text], 'promotion respects the domain allowlist'
);
reset role;

select results_eq($$select role::text from public.profiles where id='e1000000-0000-0000-0000-000000000001'$$, array['FACULTY'::text], 'promotion updates the original profile');
select results_eq($$select position_title from public.faculty_profiles where user_id='e1000000-0000-0000-0000-000000000001'$$, array['Lecturer'::text], 'position is saved');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"e2000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select throws_ok(
  $$select public.promote_registered_faculty('unverified@acdeducation.com',(select id from public.departments where code='IT'),'Lecturer')$$,
  '42501', 'Admin access required', 'non-admin cannot promote an account'
);
reset role;

select * from finish();
rollback;
