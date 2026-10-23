begin;
select plan(2);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"99000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select throws_ok($$select * from public.admin_dashboard_summary()$$,'42501','Admin access required','non-admin cannot read dashboard totals');
reset role;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('99000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin-dashboard@school.edu','',now(),'{}','{}',now(),now());
update public.profiles set role='ADMIN',account_status='APPROVED' where id='99000000-0000-0000-0000-000000000002';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"99000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select lives_ok($$select * from public.admin_dashboard_summary()$$,'admin dashboard returns aggregate consultation totals');
reset role;

select * from finish();
rollback;
