# Backend Specification

## 1. Backend Responsibilities

The backend/server layer is responsible for:

- Authentication/session validation.
- Authorization.
- Request validation.
- Database mutations.
- Booking consistency.
- Search/filter queries.
- Cursor-based pagination.
- Notification creation.
- Optional email notification dispatch.

Client UI must never be the only enforcement point for business rules.

## 2. Recommended Service Boundaries

Logical modules/services:

```text
auth
applications
profiles
departments
faculty
availability
consultations
notifications
admin
```

These may be implemented using Next.js server actions, route handlers, Supabase RPC/functions, or a combination.

## 3. Validation

All mutations should validate payloads server-side.

Recommended validation library: Zod or equivalent schema validation already selected by project rules.

Examples:

- Date/time formats.
- Required department.
- Valid requested role.
- End time > start time.
- Valid consultation status transition.
- Valid availability status transition.
- Mode-specific location/link requirements.

## 4. Authorization

Every server mutation must validate the authenticated user and role.

Examples:

### Student

May:

- Read eligible faculty.
- Read availability.
- Create own consultation request.
- Read own consultations.
- Cancel own eligible consultation.

May not:

- Approve requests.
- Modify faculty availability.
- Read other students' private consultation records.

### Faculty

May:

- Manage own availability.
- Read consultation requests assigned to self.
- Approve/reject own assigned requests.
- Complete own approved consultations.

### Admin

May:

- Review applications.
- Assign approved roles.
- Manage faculty/department records according to policy.
- Read consultation records.

## 5. Booking Mutation

Booking must be atomic.

Required sequence:

1. Validate authenticated Student.
2. Validate slot exists and is `OPEN`.
3. Change slot to `RESERVED` only if currently `OPEN`.
4. Create `PENDING` consultation linked to slot.
5. Commit both changes together.
6. Create faculty notification.

Preferred implementation:

- PostgreSQL function/RPC or transaction-capable server-side operation.

Do not implement as two unrelated client-side Supabase mutations because that creates race conditions.

## 6. Consultation Decision Mutation

### Approve

1. Validate Faculty owns consultation's slot/request.
2. Validate consultation `PENDING`.
3. Validate slot `RESERVED`.
4. Set consultation `APPROVED`.
5. Set slot `BOOKED`.
6. Notify Student.

### Reject

1. Validate ownership.
2. Validate pending state.
3. Set consultation `REJECTED`.
4. Set slot `OPEN`.
5. Notify Student.

## 7. Cancellation Mutation

### Student pending cancellation

- Consultation `PENDING -> CANCELLED`.
- Slot `RESERVED -> OPEN`.

### Student approved cancellation

- Consultation `APPROVED -> CANCELLED`.
- Slot `BOOKED -> OPEN`.
- Notify Faculty.

Mutation should be atomic.

## 8. Completion Mutation

Faculty only:

- Consultation `APPROVED -> COMPLETED`.
- Slot `BOOKED -> CLOSED`.

## 9. Availability Mutation

Create availability:

- Authenticated Faculty only.
- Faculty id comes from session/profile, not trusted client input.
- Validate date/time.
- Validate no overlap.
- Initial status is `OPEN`.

Delete availability:

- Faculty owns slot.
- Only allowed for safe status such as `OPEN`.
- `RESERVED` or `BOOKED` must not be silently deleted.

## 10. Search and Filtering API Pattern

Example conceptual request:

```text
GET /api/admin/applications
  ?search=maria
  &requestedRole=FACULTY
  &department=IT
  &status=PENDING
  &limit=20
  &cursor=...
```

Response:

```json
{
  "items": [],
  "nextCursor": null,
  "hasMore": false
}
```

Exact route shape may change based on chosen Next.js architecture.

## 11. Pagination

Prefer cursor-based pagination.

Cursor must be based on deterministic ordering, for example:

- `created_at DESC, id DESC`

Avoid relying on offset pagination for large/changing admin datasets when cursor pagination is practical.

## 12. Notifications

Notification service should support creating records for:

- New application -> Admin.
- Application approved/rejected -> applicant.
- New consultation request -> Faculty.
- Consultation approved/rejected -> Student.
- Student cancellation -> Faculty.

Email through Resend is optional/secondary to in-app notification unless required by assignment milestones.

## 13. Error Contract

Server responses/actions should distinguish:

- Validation error.
- Unauthorized.
- Forbidden.
- Not found.
- Conflict (for example slot is no longer open).
- Internal error.

Booking conflicts should return a clear recoverable error so the UI can refresh availability.
