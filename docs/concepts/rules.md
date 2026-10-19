# Rules

Normative behavior enforced by the application and database. How these rules are implemented lives in [`architecture.md`](architecture.md) and [`data-model.md`](data-model.md).

## Account and role rules

1. Authentication uses Google OAuth through Supabase Auth. There is no application-managed password flow.
2. A verified school email on an approved domain becomes `STUDENT / APPROVED` on first sign-in.
3. An unconsumed `faculty_invites` row matching the email instead makes the profile `FACULTY / APPROVED` with the invited department and position.
4. Existing `PENDING` or `REJECTED` profiles are not overwritten by the sign-in trigger.
5. Only the account matching `INITIAL_ADMIN_EMAIL` may claim the first admin role, once, while no approved admin exists.
6. Users cannot request or self-assign `ADMIN`.
7. Users cannot edit their own approved role or department; admins use the correction RPC.
8. Legacy `PENDING` and `REJECTED` profiles cannot reach role dashboards.

### Sign-in routing

```text
PENDING   -> /application/pending
REJECTED  -> /application/rejected
STUDENT   -> /student
FACULTY   -> /faculty
ADMIN     -> /admin
```

### Approved email domains

- `approved_email_domains` stores allowed domains; `is_approved_email` accepts an exact match or the local `*` wildcard.
- Migrations set the confirmed school domain `acdeducation.com`.
- `supabase/seed.sql` adds `*` for local development only; hosted environments never receive it.

### Faculty invitations

`invite_faculty` requires an admin and:

- accepts 1–50 email addresses, a department, and a position title;
- rejects emails outside approved domains;
- skips emails that already belong to approved faculty;
- inserts or refreshes the invite and clears `consumed_at`;
- returns a per-email result with `invited` and an optional `reason`.

The invite only takes effect the first time that email signs in.

### First administrator

`claim_first_admin` requires authentication, serializes concurrent claims with an advisory lock, fails if any approved admin already exists, and requires the supplied email to match the caller's approved school email. On success the profile becomes `ADMIN / APPROVED`.

### Account correction

`correct_user_account`:

- cannot target the caller and cannot assign `ADMIN`;
- requires an existing department and an already-`APPROVED` target;
- creates, updates, or removes `faculty_profiles` according to the new role.

## Statuses

- **Account**: `PENDING`, `APPROVED`, `REJECTED`. The automatic path moves new profiles to `APPROVED`; the legacy path still permits `PENDING -> APPROVED` and `PENDING -> REJECTED`.
- **Availability**: `OPEN` (unheld), `RESERVED` (pending consultation holds it), `BOOKED` (approved), `CLOSED` (completed, not reusable).
- **Consultation**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`.
- **Mode**: `IN_PERSON`, `ONLINE`.

## Consultation categories

`consultations.purpose` stores the category code and `consultations.category` mirrors it: `GRADE`, `CAPSTONE`, `ACADEMIC`, `PERSONAL`, `OTHER`. `notes` holds the optional description. Category and notes descriptions are limited to 2,000 characters.

## Booking transitions

| Event             | Consultation                      | Availability                | Function                             |
| ----------------- | --------------------------------- | --------------------------- | ------------------------------------ |
| Student requests  | created `PENDING`                 | `OPEN -> RESERVED`          | `book_consultation`                  |
| Faculty approves  | `PENDING -> APPROVED`             | `RESERVED -> BOOKED`        | `decide_consultation`                |
| Faculty rejects   | `PENDING -> REJECTED`             | `RESERVED -> OPEN`          | `decide_consultation`                |
| Student cancels   | `PENDING`/`APPROVED -> CANCELLED` | `RESERVED`/`BOOKED -> OPEN` | `cancel_consultation`                |
| Faculty completes | `APPROVED -> COMPLETED`           | `BOOKED -> CLOSED`          | `complete_consultation_with_outcome` |

Each transition runs as a security-definer function that re-checks the caller. Cancellation sets `cancelled_at`; completion sets `completed_at` and stores an optional outcome.

### Double-booking rule

A slot can be requested only while `OPEN`. The conditional update changes at most one slot to `RESERVED`; zero rows changed means a conflict. A partial unique index allows at most one `PENDING` or `APPROVED` consultation per slot while preserving rejected and cancelled history.

## Availability rules

1. Faculty may create availability only for themselves.
2. The date cannot be in the past.
3. End time must be later than start time.
4. `IN_PERSON` requires a nonblank location; `ONLINE` stores an optional meeting link and no location.
5. Active availability for the same faculty cannot overlap (GiST exclusion constraint on non-`CLOSED` slots).
6. Exact duplicate slots are rejected by a unique constraint.
7. Only `OPEN` slots can be edited or deleted.
8. Students cannot mutate availability.
9. The faculty availability list is capped at 100 upcoming rows.
10. Dashboard open-slot counts include only current or future `OPEN` slots.

## Visibility

- Students see their own consultations; faculty see consultations assigned to them; admins see metadata and counts.
- Participants see category, description, and outcome on detail pages.
- Admin list and CSV results replace the description with the category and omit participant-only notes.

## Departments

1. Students and faculty belong to a department.
2. Faculty listings can be filtered by department.
3. Students can book across departments.
4. Department codes are uppercase and unique; names are unique.

## Admin

1. Admins invite 1–50 school emails as faculty with a department and position.
2. Existing approved faculty are skipped with a reason.
3. Admins can correct an approved account's role or department.
4. Admins cannot correct their own account or assign `ADMIN`.
5. Consultations cannot be bulk-deleted.
6. CSV export is metadata only and limited to 366 days.
7. The current Manage Users UI has no bulk approve/reject action.

## Search and pagination

1. Server-backed text search debounces for 300 ms in the client.
2. A new search or filter resets the cursor and loaded items.
3. Lists load 20 records per request unless a different cap is documented.
4. Faculty pagination uses a `(lower(full_name), id)` cursor; application, consultation, and notification pagination use `(created_at, id)` cursors.
5. Loading stops when no next cursor exists.
6. Consultation status filters are applied on the server.

## Notifications and email

1. Every lifecycle change creates an in-app notification for the affected participant.
2. Status changes to `APPROVED`, `REJECTED`, or `CANCELLED` enqueue an email.
3. Approved consultations scheduled for the next day queue reminders for both participants.
4. Email claims are limited to 25 per batch and 5 attempts per record.
5. A claimed email locks for 10 minutes before another worker may retry it.
6. Email delivery is optional; missing Resend configuration returns zero claimed and sent emails without failing the route.
