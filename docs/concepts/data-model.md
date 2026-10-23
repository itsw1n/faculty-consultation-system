# Data Model

PostgreSQL hosted through Supabase. The executable schema lives in `supabase/migrations/` and database tests in `supabase/tests/`. Exact behavior is in [`rules.md`](rules.md).

## Enums

```text
user_role            STUDENT | FACULTY | ADMIN
account_status       PENDING | APPROVED | REJECTED
availability_status  OPEN | RESERVED | BOOKED | CLOSED
consultation_status  PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED
consultation_mode    IN_PERSON | ONLINE
```

## Tables

### departments

```text
id          uuid PK
code        text unique, uppercase, 2–20 characters
name        text unique, 2–120 characters
created_at  timestamptz
updated_at  timestamptz
```

Seed departments: IT, HM, BSBA, BSED, BSSW.

### profiles

```text
id              uuid PK -> auth.users.id
email           text unique
full_name       text, 1–160 characters
role            user_role nullable
position_title  text nullable, 1–120 characters for faculty
department_id   uuid -> departments.id
account_status  account_status nullable
created_at      timestamptz
updated_at      timestamptz
```

Constraints: `APPROVED` requires a role; a non-approved profile cannot have a role; faculty require `position_title`, while non-faculty must have `position_title = null`.

### availability_slots

```text
id            uuid PK
faculty_id    uuid -> profiles.id
date          date
start_time    time
end_time      time
status        availability_status, default OPEN
mode          consultation_mode
location      text nullable
meeting_link  text nullable
created_at    timestamptz
updated_at    timestamptz
```

Constraints: `end_time > start_time`; `IN_PERSON` requires a nonblank location and `ONLINE` has no location; exact `(faculty_id, date, start_time, end_time)` duplicates are rejected; a GiST exclusion constraint prevents overlapping non-`CLOSED` slots for the same faculty.

### consultations

```text
id                   uuid PK
student_id           uuid -> profiles.id
faculty_id           uuid -> profiles.id
availability_slot_id uuid -> availability_slots.id
category             text, required; GRADE | CAPSTONE | ACADEMIC | PERSONAL | OTHER
notes                text nullable, up to 2,000 characters
status               consultation_status, default PENDING
created_at           timestamptz
updated_at           timestamptz
completed_at         timestamptz nullable
cancelled_at         timestamptz nullable
outcome              text nullable, up to 2,000 characters
```

Constraints: student and faculty must differ; `completed_at` is set exactly when status is `COMPLETED`; `cancelled_at` is set exactly when `CANCELLED`; a partial unique index allows one active (`PENDING` or `APPROVED`) consultation per slot.

### notifications

```text
id            uuid PK
recipient_id  uuid -> profiles.id
type          text, 1–80 characters
title         text, 1–160 characters
message       text, 1–500 characters
entity_type   text nullable
entity_id     uuid nullable
read_at       timestamptz nullable
created_at    timestamptz
```

### approved_email_domains

```text
domain    text PK, 1–160 characters
added_at  timestamptz
```

Migrations set `acdeducation.com`; local seed data adds `*` and is never applied to hosted environments.

### email_outbox

```text
id               uuid PK
consultation_id  uuid -> consultations.id
recipient_id     uuid -> profiles.id
event_type       text; APPROVED | REJECTED | CANCELLED | REMINDER
event_key        text unique
attempts         int, default 0
locked_until     timestamptz nullable
sent_at          timestamptz nullable
created_at       timestamptz
```

## Relationships

```text
departments 1 ---- * profiles
profiles    1 ---- * availability_slots      (faculty)
profiles    1 ---- * consultations           (student)
profiles    1 ---- * consultations           (faculty)
profiles    1 ---- * notifications
availability_slots 1 ---- * consultations    (history)
consultations 1 ---- * email_outbox
```

## Indexes

```text
departments(code)
profiles(account_status, role, department_id, created_at DESC)
availability_slots(faculty_id, date, status, start_time)
consultations(student_id, created_at DESC)
consultations(faculty_id, status, created_at DESC)
consultations(availability_slot_id) WHERE status IN ('PENDING', 'APPROVED')
notifications(recipient_id, created_at DESC)
notifications(recipient_id, created_at DESC) WHERE read_at IS NULL
email_outbox(created_at) WHERE sent_at IS NULL
```

## RLS and grants

RLS is enabled on every user-facing table.

- `departments`: authenticated read; admin write.
- `profiles`: users read their own row; admins manage all.
- `availability_slots`: direct select, insert, update, and delete are revoked; access is through RPCs (original policies remain as defense in depth).
- `consultations`: participants and admins read; writes go through RPCs.
- `notifications`: recipients read and update their own `read_at`; admins read.
- `approved_email_domains`, `email_outbox`: no direct table grants to `anon` or `authenticated`. The `is_approved_email(text)` RPC is callable by `anon` for sign-up validation.
- Email queue functions are granted only to `service_role`.
- `claim_first_admin` is granted only to `service_role`.

## RPC catalog

- **Identity and authorization** — `handle_new_auth_user()`, `is_admin()`, `is_approved_email(text)`, `claim_first_admin(target_user_id, expected_email)`, `correct_user_account(...)`, `promote_registered_faculty(...)`.
- **Availability** — `create_availability(...)`, `update_open_availability(...)`, `delete_open_availability(target_slot_id)`, `list_own_availability()` (includes `has_history`), `count_own_open_availability()`.
- **Discovery and booking** — `list_faculty_page(...)`, `list_faculty_slots(...)`, `book_consultation(target_slot_id, consultation_category, consultation_notes)`.
- **Lifecycle** — `decide_consultation(...)`, `cancel_consultation(...)`, `complete_consultation_with_outcome(...)`, `search_my_consultations(...)`, `get_consultation_detail(target_id)`. Participant-facing lifecycle results include the `meeting_link`; the admin list redacts it.
- **Faculty dashboard** — `faculty_dashboard_summary()`, `list_my_upcoming_consultations(result_limit)`.
- **Student dashboard** — `student_dashboard_summary()`.
- **Admin** — `list_application_page(...)`, `consultation_summary(start_date, end_date)`, `admin_consultation_count()`, `admin_dashboard_summary()`.
- **Email outbox** — `queue_tomorrow_reminders()`, `claim_email_batch(batch_size)`, `mark_email_sent(target_id)`.

## Concurrency

- `book_consultation` conditionally updates only an `OPEN` slot and fails if zero rows change.
- Lifecycle functions lock the consultation row with `FOR UPDATE`.
- `claim_first_admin` uses an advisory transaction lock.
- Email claims use `FOR UPDATE SKIP LOCKED` and a 10-minute lease.

## Removed legacy objects

The cleanup migration drops the `examples` scaffold table, `faculty_invites`, and `faculty_profiles`. It also removes the redundant `consultations.purpose`, `profiles.avatar_url`, `profiles.requested_role`, and `approved_email_domains.note` columns, along with superseded RPCs such as `invite_faculty`, `list_faculty`, `submit_application`, and `review_application`.
