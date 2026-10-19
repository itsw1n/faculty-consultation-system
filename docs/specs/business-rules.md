# Business Rules

This document describes the rules enforced by the current application and database.

## 1. Account and role rules

1. Authentication uses Google OAuth through Supabase Auth.
2. A verified school email on an approved domain becomes an approved student on first sign-in.
3. An invited faculty email becomes an approved faculty member with the invited department and position on first sign-in.
4. Only the designated initial admin email may claim the first admin role.
5. Users cannot request or self-assign `ADMIN`.
6. Users cannot edit their own approved role or department; admins use the correction RPC.
7. Legacy `PENDING` and `REJECTED` profiles cannot access role dashboards.

## 2. Account status

Allowed values:

- `PENDING`
- `APPROVED`
- `REJECTED`

The current automatic path moves new profiles directly to `APPROVED`. The legacy path still permits `PENDING -> APPROVED` and `PENDING -> REJECTED` through the database functions.

## 3. Availability status

- `OPEN`: no consultation holds the slot.
- `RESERVED`: a pending consultation holds the slot.
- `BOOKED`: the consultation is approved.
- `CLOSED`: the consultation is complete; the slot is no longer reusable.

## 4. Consultation status

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

## 5. Consultation categories

`consultations.purpose` stores the category code and `consultations.category` mirrors it:

- `GRADE`
- `CAPSTONE`
- `ACADEMIC`
- `PERSONAL`
- `OTHER`

`notes` holds the optional description. Both the category and notes are limited to 2,000 characters where applicable.

## 6. Booking transitions

### Student submits a request

```text
availability: OPEN -> RESERVED
consultation: created as PENDING
```

`book_consultation` performs both changes in one transaction. It requires an approved student and an `OPEN` slot.

### Faculty approves

```text
consultation: PENDING -> APPROVED
availability: RESERVED -> BOOKED
```

`decide_consultation` requires the assigned faculty and a pending consultation.

### Faculty rejects

```text
consultation: PENDING -> REJECTED
availability: RESERVED -> OPEN
```

### Student cancels

```text
consultation: PENDING or APPROVED -> CANCELLED
availability: RESERVED or BOOKED -> OPEN
```

`cancel_consultation` requires the requesting student and sets `cancelled_at`.

### Faculty completes

```text
consultation: APPROVED -> COMPLETED
availability: BOOKED -> CLOSED
```

`complete_consultation_with_outcome` requires the assigned faculty, sets `completed_at`, and stores an optional outcome of up to 2,000 characters.

All lifecycle RPCs run as security definer functions and re-check the caller.

## 7. Double-booking rule

A slot can be requested only while its status is `OPEN`. The conditional update in `book_consultation` changes at most one slot to `RESERVED`; if zero rows change, the request fails with a conflict.

A partial unique index allows at most one `PENDING` or `APPROVED` consultation per availability slot while preserving historical rejected and cancelled records.

## 8. Availability rules

1. Faculty may create availability only for themselves.
2. The date cannot be in the past.
3. End time must be later than start time.
4. `IN_PERSON` requires a nonblank location. `ONLINE` stores an optional meeting link and no location.
5. Active availability for the same faculty cannot overlap; a GiST exclusion constraint enforces this for non-`CLOSED` slots.
6. Exact duplicate slots are rejected by a unique constraint.
7. Only `OPEN` slots can be edited or deleted.
8. Students cannot mutate availability.
9. Faculty see their own upcoming slots; the list is capped at 100 rows.
10. Dashboard open-slot counts include only current or future `OPEN` slots.

## 9. Visibility rules

- Students see their own consultations.
- Faculty see consultations assigned to them.
- Admins see consultation metadata and counts.
- Participants see the category, description, and outcome on detail pages.
- Admin list and CSV results replace the description with the category and omit participant-only notes.

## 10. Department rules

1. Students and faculty belong to a department.
2. Faculty listings can be filtered by department.
3. Students can book across departments.
4. Department codes are uppercase and unique; names are unique.

## 11. Search, filtering, and pagination

1. Server-backed text search uses a 300 ms debounce in the client.
2. A new search or filter resets the cursor and loaded items.
3. Lists load 20 records per request unless a different cap is documented.
4. Faculty pagination uses a `(lower(full_name), id)` cursor.
5. Application, consultation, and notification pagination use `(created_at, id)` cursors.
6. Loading stops when no next cursor exists.
7. Consultation status filters are applied on the server.

## 12. Admin rules

1. Admins can invite 1–50 school emails as faculty with a department and position.
2. Existing approved faculty are skipped with a reason.
3. Admins can correct an approved account's role or department.
4. Admins cannot correct their own account or assign `ADMIN`.
5. Consultations cannot be bulk-deleted.
6. CSV export is metadata only and limited to 366 days.
7. The current Manage Users UI has no bulk approve/reject action.

## 13. Notifications and email

1. Every lifecycle change creates an in-app notification for the affected participant.
2. Status changes to `APPROVED`, `REJECTED`, or `CANCELLED` enqueue an email.
3. Approved consultations scheduled for the next day queue reminders for both participants.
4. Email claims are limited to 25 per batch and 5 attempts per record.
5. A claimed email locks for 10 minutes before another worker may retry it.
6. Email delivery is optional; missing Resend configuration returns zero claimed and sent emails without failing the route.
