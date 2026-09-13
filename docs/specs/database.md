# Database Specification

## 1. Database

PostgreSQL hosted through Supabase.

## 2. Core Tables

### departments

```text
id
code
name
created_at
updated_at
```

Constraints:

- `code` unique.
- `name` unique where appropriate.

Example codes:

- IT
- HM
- BSBA
- BSED
- BSSW

---

### profiles

Extends the Supabase authenticated user identity.

```text
id                  PK/FK -> auth.users.id
email               unique
full_name
avatar_url
role                 nullable until approved
requested_role       nullable after onboarding if desired
department_id        FK -> departments.id
account_status
created_at
updated_at
```

Role values:

- `STUDENT`
- `FACULTY`
- `ADMIN`

Account/application status values:

- `PENDING`
- `APPROVED`
- `REJECTED`

Notes:

- A new applicant may have `requested_role` while final `role` is null.
- Google email should be derived from authenticated identity and treated as read-only in UI.

---

### faculty_profiles

Faculty-only extension data.

```text
id
user_id             unique FK -> profiles.id
position_title
consultation_mode_default   nullable
created_at
updated_at
```

Department may be read from `profiles.department_id`; do not duplicate unless there is a clear business reason.

---

### availability_slots

```text
id
faculty_id           FK -> profiles.id or faculty_profiles.user_id
date
start_time
end_time
status
mode
location             nullable
meeting_link         nullable
created_at
updated_at
```

Status:

- `OPEN`
- `RESERVED`
- `BOOKED`
- `CLOSED`

Mode:

- `IN_PERSON`
- `ONLINE`

Recommended constraints:

- `end_time > start_time`.
- Mode-specific checks where practical.
- Index `(faculty_id, date, start_time)`.
- Prevent duplicate exact slots.
- Prevent overlap by validation and, where practical, PostgreSQL exclusion constraints/range logic.

---

### consultations

```text
id
student_id           FK -> profiles.id
faculty_id           FK -> profiles.id
availability_slot_id unique FK -> availability_slots.id
purpose
notes                 nullable
status
created_at
updated_at
completed_at          nullable
cancelled_at          nullable
```

Status:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

`availability_slot_id` should be unique if one slot can belong to at most one consultation record at a time. If historical rejected/cancelled attempts need to be preserved while reopening a slot for a new request, use a different modeling strategy such as allowing multiple consultation records per slot while enforcing only one active record. Choose one strategy before migration is finalized.

Recommended v1 strategy:

- Keep consultation history.
- Allow multiple historical consultations per slot if a rejected/cancelled slot is reused.
- Enforce one active (`PENDING`/`APPROVED`) consultation per slot through a partial unique index.

Example conceptual partial uniqueness:

```text
UNIQUE availability_slot_id
WHERE status IN ('PENDING', 'APPROVED')
```

---

### notifications

```text
id
recipient_id          FK -> profiles.id
type
title
message
entity_type           nullable
entity_id             nullable
read_at               nullable
created_at
```

Recommended index:

- `(recipient_id, created_at DESC)`
- `(recipient_id, read_at)`

## 3. Relationships

```text
departments 1 ---- * profiles
profiles     1 ---- 0..1 faculty_profiles
profiles     1 ---- * availability_slots   (faculty)
profiles     1 ---- * consultations        (student)
profiles     1 ---- * consultations        (faculty)
availability_slots 1 ---- * consultations (historical possibility)
profiles     1 ---- * notifications
```

## 4. RLS Principles

RLS must be enabled for user-facing tables.

### profiles

- User can read own profile.
- Approved authenticated users may read limited public faculty identity/profile fields as needed for directory views.
- Users cannot modify their own role/account approval fields.
- Admin can manage role/status.

### faculty_profiles

- Approved users can read fields required for faculty directory.
- Faculty can update allowed own faculty fields only.
- Admin can manage faculty records.

### availability_slots

- Approved users can read slots required for booking.
- Faculty can insert/update/delete own safe slots.
- Students cannot mutate availability directly.

### consultations

- Student can read own consultations.
- Faculty can read consultations assigned to self.
- Admin can read all.
- Direct client updates should be tightly restricted; critical state transitions should use controlled server/RPC paths.

### notifications

- Recipient can read/update read-state of own notifications.
- Users cannot read other users' notifications.
- Creation should occur through trusted server/RPC logic.

## 5. Important Indexes

Recommended:

```text
profiles(account_status, requested_role, department_id, created_at)
profiles(lower(full_name)) or search-supporting index if needed
availability_slots(faculty_id, date, status, start_time)
consultations(student_id, created_at)
consultations(faculty_id, status, created_at)
notifications(recipient_id, created_at)
departments(code)
```

Use PostgreSQL text-search/trigram indexing only if simple indexed filtering becomes insufficient.

## 6. Concurrency

The database must be the final authority on booking availability.

The booking operation should lock/check the target slot and only transition `OPEN -> RESERVED` once.

If the conditional update affects zero rows, return conflict because another user already reserved/booked the slot.
