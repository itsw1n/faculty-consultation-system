# API Reference

The application uses authenticated server actions and Supabase RPCs rather than a public REST API. Behavior rules are in [`../concepts/rules.md`](../concepts/rules.md); authorization in [`../concepts/architecture.md`](../concepts/architecture.md#authorization).

## HTTP routes

| Method | Route | Access | Purpose |
| ------ | ----- | ------ | ------- |
| `GET` | `/api/health` | Public | Returns `{ "status": "ok" }` |
| `GET` | `/api/faculty/[facultyId]/availability` | Approved student | Slots for one faculty member |
| `GET` | `/api/cron/email` | Bearer `CRON_SECRET` | Queues reminders and processes the email outbox |
| `GET` | `/auth/callback` | OAuth callback | Exchanges the Supabase OAuth code and redirects into the account flow |
| `GET` | `/admin/consultations/export?from=YYYY-MM-DD&to=YYYY-MM-DD` | Admin | Metadata summary CSV, maximum 366 days |

## Pages with server-side effects

| Route | Purpose |
| ----- | ------- |
| `/` | Starts Google OAuth through `signInWithGoogle` |
| `/auth/continue` | Reads the profile and redirects by status and role |
| `/auth/claim-admin` | First-admin claim form |
| `/application/*` | Pending and rejected account screens |
| `/student/*` | Dashboard, faculty directory, booking, consultations |
| `/faculty/*` | Dashboard, availability, requests, consultations |
| `/admin/*` | Dashboard, users, faculty, departments, records |
| `/notifications` | Notification list and mark-all-read |

## Server actions

| Module | Actions |
| ------ | ------- |
| `auth` | `signInWithGoogle`, `signOut`, `claimFirstAdmin` |
| `applications` | `inviteFaculty`, `correctUserAccount` |
| `admin` | `createDepartment`, `updateDepartment` |
| `availability` | `createAvailability`, `updateAvailability`, `deleteAvailability` |
| `booking` | `bookConsultation` |
| `consultations` | `decideConsultation`, `cancelConsultation`, `completeConsultation` |
| `notifications` | `markNotificationRead`, `markAllNotificationsRead` |

Each action validates input and performs role authorization. Booking, decisions, cancellation, completion, invites, correction, and first-admin claim delegate to transactional PostgreSQL functions.

## RPC-backed cursor loaders

Client components fetch additional pages through `'use server'` loaders:

- `getFacultyPage` → `list_faculty_page`.
- `getApplicationPage` → `list_application_page`.
- `getConsultationPage` → `search_my_consultations`.
- `getNotificationPage` → `notifications` with a `(created_at, id)` cursor.

These are internal application interfaces, not public HTTP APIs. See the full function catalog in [`../concepts/data-model.md`](../concepts/data-model.md#rpc-catalog).

## Error contract

- Invalid submitted fields return a safe validation message or reject the action.
- Missing authentication redirects to the sign-in flow; a wrong role or status redirects to `/auth/continue`.
- Booking conflicts report that the slot is no longer available; lifecycle conflicts ask the user to refresh.
- Duplicate department values report that code and name must be unique.
- Email processing returns `401` for a bad callback secret and `503` when the outbox is unavailable.
- Unexpected rendering failures use the application error boundary; unknown routes use the not-found page.

Database and provider details stay server-side. Key-based list actions return `{ data, error }`; form actions return a message. Unexpected failures throw. There is no stable public error-code API in v1.
