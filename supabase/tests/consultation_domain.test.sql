begin;
select plan(18);

select has_table('public', 'departments', 'departments table exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'faculty_profiles', 'faculty_profiles table exists');
select has_table('public', 'availability_slots', 'availability slots table exists');
select has_table('public', 'consultations', 'consultations table exists');
select has_table('public', 'notifications', 'notifications table exists');

select ok((select relrowsecurity from pg_class where oid = 'public.departments'::regclass), 'departments has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.faculty_profiles'::regclass), 'faculty profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.availability_slots'::regclass), 'availability slots has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.consultations'::regclass), 'consultations has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.notifications'::regclass), 'notifications has RLS enabled');

select has_index('public', 'profiles', 'profiles_application_queue_idx', 'application queue index exists');
select has_index('public', 'availability_slots', 'availability_faculty_schedule_idx', 'availability schedule index exists');
select has_index('public', 'consultations', 'consultations_one_active_per_slot_idx', 'active booking uniqueness index exists');
select has_index('public', 'consultations', 'consultations_student_history_idx', 'student consultation history index exists');
select has_index('public', 'consultations', 'consultations_faculty_queue_idx', 'faculty consultation queue index exists');
select has_index('public', 'notifications', 'notifications_unread_idx', 'unread notifications index exists');

select * from finish();
rollback;
