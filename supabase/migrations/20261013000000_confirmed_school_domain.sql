-- Replace the placeholder school domains with the first confirmed domain.
-- A second student domain exists but is still unconfirmed; it will be added
-- by a later migration once ICTC provides its exact value.
update public.approved_email_domains
set domain = 'acdeducation.com',
    note = 'Confirmed school domain for students and faculty'
where domain = 'student.acd.edu.ph';

delete from public.approved_email_domains where domain = 'faculty.acd.edu.ph';
