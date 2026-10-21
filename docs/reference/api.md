# API Reference

The application uses authenticated server actions and Supabase RPCs rather than a public REST API. Behavior rules are in [`../concepts/rules.md`](../concepts/rules.md); authorization in [`../concepts/architecture.md`](../concepts/architecture.md#authorization).

## HTTP routes

| Method | Route                                                       | Access               | Purpose                                                           |
| ------ | ----------------------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `GET`  | `/api/health`                                               | Public               | Returns `{ "status": "ok" }`                                      |
| `GET`  | `/api/faculty/[facultyId]/availability`                     | Approved student     | Slots for one faculty member; optional paired `start`/`end` dates |
| `GET`  | `/api/cron/email`                                           | Bearer `CRON_SECRET` | Queues reminders and processes the email outbox                   |
| `GET`  | `/auth/confirm?token_hash=...&type=email\|recovery`         | Email link           | Verifies a signup or recovery token and establishes the session   |
| `GET`  | `/admin/consultations/export?from=YYYY-MM-DD&to=YYYY-MM-DD` | Admin                | Metadata summary CSV, maximum 366 days                            |

## Pages with server-side effects

| Route                   | Purpose                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `/`                     | Email + password sign-in                                                                   |
| `/auth/sign-up`         | Create an account and send a verification email                                            |
| `/auth/forgot-password` | Request a password reset link                                                              |
| `/auth/reset-password`  | Set a new password after opening a recovery link                                           |
| `/auth/continue`        | Reads the profile and redirects by status and role                                         |
| `/auth/claim-admin`     | First-admin claim form                                                                     |
| `/application/*`        | Pending and rejected account screens                                                       |
| `/student/*`            | Dashboard, faculty directory, booking, consultations                                       |
| `/faculty/*`            | Dashboard, availability, requests, consultations                                           |
| `/admin/*`              | Dashboard, users, departments, records                                                     |
| `/notifications`        | Recipient-only notification list; click an unread row to mark it read, or mark all as read |

## Server actions

| Module          | Actions                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `auth`          | `signInWithPassword`, `signUpWithPassword`, `requestPasswordReset`, `updatePassword`, `signOut`, `claimFirstAdmin` |
| `applications`  | `promoteFaculty`, `correctUserAccount`                                                                             |
| `admin`         | `createDepartment`, `updateDepartment`                                                                             |
| `availability`  | `createAvailability`, `updateAvailability`, `deleteAvailability`                                                   |
| `booking`       | `bookConsultation`                                                                                                 |
| `consultations` | `decideConsultation`, `cancelConsultation`, `completeConsultation`, `completeConsultationWithFeedback`             |
| `notifications` | `markNotificationRead`, `markAllNotificationsRead`                                                                 |

Each action validates input and performs role authorization. Booking, decisions, cancellation, completion, faculty promotion, correction, and first-admin claim delegate to transactional PostgreSQL functions.

## RPC-backed cursor loaders

Client components fetch additional pages through `'use server'` loaders:

- `getFacultyPage` → `list_faculty_page`.
- `getApplicationPage` → `list_application_page`.
- `getConsultationPage` → `search_my_consultations`.
- `getNotificationPage` → `notifications` with a `(created_at, id)` cursor.

These are internal application interfaces, not public HTTP APIs. `getConsultationPage` includes the saved outcome so the details modal can show completed results without a second fetch. See the full function catalog in [`../concepts/data-model.md`](../concepts/data-model.md#rpc-catalog).

The admin dashboard uses `admin_dashboard_summary()` for aggregate account, availability, and consultation counts, and `search_my_consultations` for its redacted recent-activity list.

The faculty dashboard uses `faculty_dashboard_summary()` for pending/open-slot counts and the next open slot, `list_my_upcoming_consultations()` for the next five confirmed consultations, and `search_my_consultations` for its pending queue.

## Error contract

- Invalid submitted fields return a safe validation message or reject the action.
- Sign-in failures return one generic message; unverified accounts are asked to verify their email first.
- Missing authentication redirects to the sign-in flow; a wrong role or status redirects to `/auth/continue`.
- Booking conflicts report that the slot is no longer available; lifecycle conflicts ask the user to refresh.
- Duplicate department values report that code and name must be unique.
- Email processing returns `401` for a bad callback secret and `503` when the outbox is unavailable.
- Unexpected rendering failures use the application error boundary; unknown routes use the not-found page.

Database and provider details stay server-side. Server actions return `{ error, message? }`; cursor loaders return an `InfinitePage` and throw on failure. There is no stable public error-code API in v1.
