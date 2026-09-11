create extension if not exists btree_gist with schema extensions;

create type public.user_role as enum ('STUDENT', 'FACULTY', 'ADMIN');
create type public.account_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.availability_status as enum ('OPEN', 'RESERVED', 'BOOKED', 'CLOSED');
create type public.consultation_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');
create type public.consultation_mode as enum ('IN_PERSON', 'ONLINE');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and char_length(code) between 2 and 20),
  name text not null unique check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null check (char_length(full_name) between 1 and 160),
  avatar_url text,
  role public.user_role,
  requested_role public.user_role check (requested_role is null or requested_role <> 'ADMIN'),
  department_id uuid references public.departments(id) on delete restrict,
  account_status public.account_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_approval_requires_role check (
    account_status <> 'APPROVED' or role is not null
  ),
  constraint profiles_non_approved_have_no_role check (
    account_status = 'APPROVED' or role is null
  )
);

create table public.faculty_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  position_title text not null check (char_length(position_title) between 1 and 120),
  consultation_mode_default public.consultation_mode,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status public.availability_status not null default 'OPEN',
  mode public.consultation_mode not null,
  location text,
  meeting_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_time_order check (end_time > start_time),
  constraint availability_mode_details check (
    (mode = 'IN_PERSON' and nullif(btrim(location), '') is not null)
    or (mode = 'ONLINE' and location is null)
  ),
  constraint availability_exact_slot_unique unique (faculty_id, date, start_time, end_time),
  constraint availability_no_overlap exclude using gist (
    faculty_id with =,
    tsrange(date + start_time, date + end_time, '[)') with &&
  ) where (status <> 'CLOSED')
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete restrict,
  faculty_id uuid not null references public.profiles(id) on delete restrict,
  availability_slot_id uuid not null references public.availability_slots(id) on delete restrict,
  purpose text not null check (char_length(purpose) between 1 and 200),
  notes text check (notes is null or char_length(notes) <= 2000),
  status public.consultation_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  constraint consultations_distinct_participants check (student_id <> faculty_id),
  constraint consultations_completed_timestamp check (
    (status = 'COMPLETED') = (completed_at is not null)
  ),
  constraint consultations_cancelled_timestamp check (
    (status = 'CANCELLED') = (cancelled_at is not null)
  )
);

create unique index consultations_one_active_per_slot_idx
  on public.consultations (availability_slot_id)
  where status in ('PENDING', 'APPROVED');
create index profiles_application_queue_idx
  on public.profiles (account_status, requested_role, department_id, created_at desc);
create index availability_faculty_schedule_idx
  on public.availability_slots (faculty_id, date, status, start_time);
create index consultations_student_history_idx
  on public.consultations (student_id, created_at desc);
create index consultations_faculty_queue_idx
  on public.consultations (faculty_id, status, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (char_length(type) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  message text not null check (char_length(message) between 1 and 500),
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);
create index notifications_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger departments_set_updated_at before update on public.departments
for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger faculty_profiles_set_updated_at before update on public.faculty_profiles
for each row execute function public.set_updated_at();
create trigger availability_slots_set_updated_at before update on public.availability_slots
for each row execute function public.set_updated_at();
create trigger consultations_set_updated_at before update on public.consultations
for each row execute function public.set_updated_at();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'ADMIN'
      and account_status = 'APPROVED'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.faculty_profiles enable row level security;
alter table public.availability_slots enable row level security;
alter table public.consultations enable row level security;
alter table public.notifications enable row level security;

revoke all on table public.departments, public.profiles, public.faculty_profiles,
  public.availability_slots, public.consultations, public.notifications from anon, authenticated;

grant select on table public.departments to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.faculty_profiles to authenticated;
grant select, insert, update, delete on table public.availability_slots to authenticated;
grant select on table public.consultations to authenticated;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

create policy departments_authenticated_read on public.departments
for select to authenticated using ((select auth.uid()) is not null);
create policy departments_admin_all on public.departments
for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy profiles_read_own on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy profiles_admin_all on public.profiles
for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy faculty_profiles_approved_read on public.faculty_profiles
for select to authenticated using (
  exists (
    select 1 from public.profiles viewer
    where viewer.id = (select auth.uid()) and viewer.account_status = 'APPROVED'
  )
);
create policy faculty_profiles_admin_all on public.faculty_profiles
for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy availability_approved_read on public.availability_slots
for select to authenticated using (
  exists (
    select 1 from public.profiles viewer
    where viewer.id = (select auth.uid()) and viewer.account_status = 'APPROVED'
  )
);
create policy availability_faculty_insert on public.availability_slots
for insert to authenticated with check (
  faculty_id = (select auth.uid())
  and exists (
    select 1 from public.profiles owner
    where owner.id = (select auth.uid())
      and owner.role = 'FACULTY'
      and owner.account_status = 'APPROVED'
  )
);
create policy availability_faculty_update on public.availability_slots
for update to authenticated using (faculty_id = (select auth.uid()))
with check (faculty_id = (select auth.uid()));
create policy availability_faculty_delete_open on public.availability_slots
for delete to authenticated using (
  faculty_id = (select auth.uid()) and status = 'OPEN'
);
create policy availability_admin_all on public.availability_slots
for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy consultations_participant_read on public.consultations
for select to authenticated using (
  student_id = (select auth.uid()) or faculty_id = (select auth.uid()) or (select public.is_admin())
);

create policy notifications_recipient_read on public.notifications
for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_recipient_mark_read on public.notifications
for update to authenticated using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));
create policy notifications_admin_read on public.notifications
for select to authenticated using ((select public.is_admin()));

insert into public.departments (code, name)
values
  ('IT', 'Information Technology'),
  ('HM', 'Hospitality Management'),
  ('BSBA', 'Business Administration'),
  ('BSED', 'Secondary Education'),
  ('BSSW', 'Social Work');
