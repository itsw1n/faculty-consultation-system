begin;
select plan(14);

select hasnt_table('public', 'examples', 'examples scaffold table is removed');
select hasnt_table('public', 'faculty_invites', 'legacy faculty invites table is removed');
select hasnt_table('public', 'faculty_profiles', 'faculty profile extension is merged into profiles');

select has_column('public', 'profiles', 'position_title', 'faculty position lives on profiles');
select hasnt_column('public', 'profiles', 'avatar_url', 'unused avatar column is removed');
select hasnt_column('public', 'profiles', 'requested_role', 'legacy requested role column is removed');

select hasnt_column('public', 'consultations', 'purpose', 'duplicate purpose column is removed');
select has_column('public', 'consultations', 'category', 'category is the only consultation category column');

select hasnt_column('public', 'approved_email_domains', 'note', 'unused domain note column is removed');

select hasnt_function('public', 'invite_faculty', 'legacy invite function is removed');
select hasnt_function('public', 'submit_application', 'legacy application submission is removed');
select hasnt_function('public', 'review_application', 'legacy application review is removed');
select hasnt_function('public', 'review_applications', 'legacy bulk application review is removed');

select has_function(
  'public',
  'book_consultation',
  array['uuid', 'text', 'text'],
  'booking RPC still exists'
);

select * from finish();
rollback;
