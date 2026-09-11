# Business Rules

## 1. Account and Role Rules

1. Authentication is handled by Google OAuth through Supabase Auth.
2. Users cannot create local passwords inside this application.
3. A new user may request `STUDENT` or `FACULTY` access.
4. Requested role is not the final assigned role.
5. Admin approval is required before application access is granted.
6. Users cannot request or self-assign `ADMIN`.
7. Approved school-related fields such as role and department are not freely editable by the user in v1.
8. Rejected applications cannot access role dashboards.

## 2. Application Status

Allowed statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`

Transitions:

```text
PENDING -> APPROVED
PENDING -> REJECTED
```

An approved application assigns the requested role to the profile.

## 3. Availability Slot Status

Allowed statuses:

- `OPEN`
- `RESERVED`
- `BOOKED`
- `CLOSED`

Meaning:

### OPEN
Faculty is available and no consultation request currently holds the slot.

### RESERVED
A student submitted a request for the slot and it is waiting for faculty decision. The slot is temporarily unavailable to other students.

### BOOKED
Faculty approved the consultation. The schedule is confirmed.

### CLOSED
The consultation is finished or the time slot is no longer reusable.

## 4. Consultation Status

Allowed statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

## 5. Booking State Transitions

### Student submits request

```text
availability: OPEN -> RESERVED
consultation: create as PENDING
```

Both changes must succeed atomically.

### Faculty approves

```text
consultation: PENDING -> APPROVED
availability: RESERVED -> BOOKED
```

### Faculty rejects

```text
consultation: PENDING -> REJECTED
availability: RESERVED -> OPEN
```

### Student cancels pending request

```text
consultation: PENDING -> CANCELLED
availability: RESERVED -> OPEN
```

### Student cancels approved consultation

For v1, cancellation is allowed before completion unless a later policy restricts the cutoff.

```text
consultation: APPROVED -> CANCELLED
availability: BOOKED -> OPEN
```

Faculty receives a notification.

### Faculty completes consultation

```text
consultation: APPROVED -> COMPLETED
availability: BOOKED -> CLOSED
```

## 6. Double-Booking Rule

A slot can be requested only when its status is `OPEN`.

The server/database must enforce this rule. Client-side disabling alone is insufficient.

If two students attempt to reserve the same slot concurrently, only one booking may succeed.

## 7. Availability Rules

1. Faculty may create availability only for themselves.
2. End time must be later than start time.
3. Availability must not overlap another active availability slot for the same faculty.
4. `RESERVED` and `BOOKED` slots cannot be deleted as normal open slots.
5. Students cannot edit availability.
6. Students can see disabled `RESERVED` and `BOOKED` states.

## 8. Department Rules

1. Students and faculty belong to a department.
2. Faculty listings can be filtered by department.
3. Student's own department should be the default filter where practical.
4. Cross-department booking is allowed unless future school policy explicitly restricts it.

## 9. Consultation Mode and Location

Availability may define:

- `IN_PERSON`
- `ONLINE`

If `IN_PERSON`:
- location/room is required.

If `ONLINE`:
- meeting link may be supplied.

Students should see mode/location before confirming a booking.

## 10. Search and Filtering Rules

1. Text search that hits the server/database should use approximately 300 ms debounce.
2. Select/dropdown filters on desktop apply immediately.
3. Mobile filter drawer may use an explicit Apply button.
4. A new search/filter resets infinite-scroll cursor and loaded items.
5. Search/filter must occur server-side for large datasets.

## 11. Infinite Scroll Rules

1. Do not load complete datasets up front.
2. Fetch a bounded first chunk, recommended 20 records.
3. Fetch subsequent chunks as user approaches the end.
4. Cursor-based pagination is preferred internally.
5. Stop requesting when no next cursor exists.
6. Preserve active search/filter/sort parameters for every subsequent request.

## 12. Bulk Actions

1. Bulk-selection infrastructure can be shared.
2. Bulk actions are shown only where meaningful.
3. User applications support bulk approve/reject.
4. Consultation records must not expose bulk delete.
5. Any destructive or high-impact bulk action requires confirmation.
