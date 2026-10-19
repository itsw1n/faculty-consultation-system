# Backend Specification

This document describes the implemented server and data-access layers.

## 1. Responsibilities

- Validate untrusted input with Zod.
- Authenticate the caller.
- Authorize the caller for the requested role or account state.
- Delegate reads to repositories and writes to repositories or RPCs.
- Keep booking and lifecycle transitions atomic in PostgreSQL.
- Create in-app notifications and enqueue email from database triggers and RPCs.

Client UI is never the only enforcement point.

## 2. Feature modules

```text
src/features/auth          sign-in, sign-out, first-admin claim, profile guards
src/features/applications  account page, invites, corrections
src/features/admin         departments, faculty records
src/features/availability  faculty availability actions and reads
src/features/booking       faculty directory, slots, booking action
src/features/consultations lifecycle actions, lists, detail, CSV
src/features/dashboard     role-specific dashboard counts
src/features/email         outbox claim and Resend delivery
src/features/notifications in-app notifications and read state
```

Shared code lives in `src/lib`:

- `src/lib/env.ts` validates public and server environment values.
- `src/lib/actionState.ts` defines the common action result.
- `src/lib/useInfinitePage.ts` implements cursor-based client pagination.
- `src/lib/supabase/server.ts` creates the cookie-backed server client.

## 3. Layers

```text
page / layout / route handler
        |
        v
server action or query loader
        |
        v
feature repository
        |
        v
Supabase table or RPC
```

- Pages call repositories directly for initial server-rendered reads.
- `features/*/queries/*.ts` are `'use server'` loaders used by client components for pagination. They add authorization and Zod validation around repository reads.
- Repositories own Supabase calls. They do not make policy decisions that belong in the database.
- Server actions validate input, call `requireRole`, then call a repository or RPC.

## 4. Authorization helpers

- `getAuthenticatedProfile()` reads claims and the profile row.
- `requireRole(role)` redirects unauthenticated users to `/`.
- `requireRole` redirects an authenticated user with the wrong role or status to `/auth/continue`.
- `requireApprovedProfile()` throws when there is no approved profile and is used for shared reads.

Every server action calls one of these helpers before touching data.

## 5. Server actions

### auth

- `signInWithGoogle()` starts Supabase Google OAuth and redirects to the provider URL.
- `signOut()` clears the Supabase session.
- `claimFirstAdmin(state)` validates `INITIAL_ADMIN_EMAIL` and calls `claim_first_admin`.

### applications

- `inviteFaculty(state, formData)` validates 1–50 emails, department, and position, then calls `invite_faculty`.
- `correctUserAccount(state, formData)` validates role, department, and optional position, then calls `correct_user_account`.

### admin

- `createDepartment(formData)` inserts a department.
- `updateDepartment(formData)` updates code and name.

### availability

- `createAvailability(state, formData)` calls `create_availability`.
- `updateAvailability(state, formData)` calls `update_open_availability`.
- `deleteAvailability(formData)` calls `delete_open_availability`.

### booking

- `bookConsultation(state, formData)` validates the slot, category, and notes, then calls `book_consultation`.

### consultations

- `decideConsultation(formData)` calls `decide_consultation` and then attempts email delivery.
- `cancelConsultation(formData)` calls `cancel_consultation` and then attempts email delivery.
- `completeConsultation(formData)` calls `complete_consultation_with_outcome`.

### notifications

- `markNotificationRead(formData)` updates one notification's `read_at`.
- `markAllNotificationsRead()` updates all unread notifications for the caller.

## 6. Repositories and RPCs

| Repository read           | Source                                           |
| ------------------------- | ------------------------------------------------ |
| `getAuthenticatedProfile` | `profiles` select                                |
| `listDepartments`         | `departments` select                             |
| `listFacultyRecords`      | `profiles` select with faculty relations         |
| `getApplicationPage`      | `list_application_page` RPC                      |
| `listOwnAvailability`     | `list_own_availability` RPC                      |
| `getFacultyPage`          | `list_faculty_page` RPC                          |
| `listFacultySlots`        | `list_faculty_slots` RPC                         |
| `getConsultationPage`     | `search_my_consultations` RPC                    |
| `getConsultationDetail`   | `get_consultation_detail` RPC                    |
| `getStudentDashboard`     | `consultations` counts and recent select         |
| `getFacultyDashboard`     | `consultations` counts and open-slot count       |
| `getAdminDashboard`       | `profiles` counts and `admin_consultation_count` |
| `listNotifications`       | `notifications` select                           |
| `getNotificationPage`     | `notifications` select with cursor               |
| `queueReminders`          | `queue_tomorrow_reminders` RPC                   |
| `claimEmails`             | `claim_email_batch` RPC                          |
| `markEmailSent`           | `mark_email_sent` RPC                            |

## 7. Atomic workflow RPCs

The following operations must not be split into multiple client writes:

- `book_consultation`: `OPEN -> RESERVED` plus consultation creation and notification.
- `decide_consultation`: consultation decision plus slot transition and notification.
- `cancel_consultation`: cancellation plus slot reopening and notification.
- `complete_consultation_with_outcome`: completion, outcome, and slot closing.
- `claim_first_admin`: serialized first-admin assignment.
- `invite_faculty`: per-email invite result.
- `correct_user_account`: role/department correction with faculty-profile maintenance.

## 8. Search and pagination

- Faculty: cursor `(lower(full_name), id)`.
- Applications: cursor `(created_at, id)`.
- Consultations: cursor `(created_at, id)`.
- Notifications: cursor `(created_at, id)`.
- Each list request is capped by the RPC or query limit, normally 20 records.
- Search is server-side; the client debounces text input by 300 ms.

## 9. Email delivery

`deliverEmails(includeReminders)`:

1. Optionally queues next-day reminders.
2. Returns `{ claimed: 0, sent: 0 }` when Resend is not configured.
3. Claims up to 25 outbox records.
4. Sends each email through Resend with the outbox ID as the idempotency key.
5. Marks each successful record sent.

`GET /api/cron/email` requires a bearer `CRON_SECRET` and returns 503 when processing fails.

## 10. Error contract

- Validation failures return a safe field-level or generic message.
- Missing authentication redirects to `/`.
- Wrong role or account state redirects to `/auth/continue`.
- Booking conflicts ask the student to choose another slot.
- Lifecycle conflicts ask the user to refresh.
- Database and provider details stay server-side.
- Unexpected rendering failures use the application error boundary; unknown routes use the not-found page.
