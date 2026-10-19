# Application Interfaces

## HTTP routes

| Method | Route                                                       | Access               | Purpose                                                               |
| ------ | ----------------------------------------------------------- | -------------------- | --------------------------------------------------------------------- |
| `GET`  | `/api/health`                                               | Public               | Returns `{ "status": "ok" }`                                          |
| `GET`  | `/api/faculty/[facultyId]/availability`                     | Approved student     | Returns scheduling slots for one faculty member                       |
| `GET`  | `/api/cron/email`                                           | Bearer `CRON_SECRET` | Queues reminders and processes the email outbox                       |
| `GET`  | `/auth/callback`                                            | OAuth callback       | Exchanges the Supabase OAuth code and redirects into the account flow |
| `GET`  | `/admin/consultations/export?from=YYYY-MM-DD&to=YYYY-MM-DD` | Admin                | Metadata summary CSV, maximum 366 days                                |

## Application pages with server-side effects

| Route               | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `/`                 | Starts Google OAuth through `signInWithGoogle`               |
| `/auth/continue`    | Reads the profile and redirects by status and role           |
| `/auth/claim-admin` | First-admin claim form                                       |
| `/application/*`    | Pending and rejected account screens                         |
| `/student/*`        | Student dashboard, directory, booking, and consultations     |
| `/faculty/*`        | Faculty dashboard, availability, requests, and consultations |
| `/admin/*`          | Admin dashboard, users, faculty, departments, and records    |
| `/notifications`    | Full notification list and mark-all-read action              |

## Server actions

| Module          | Actions                                                            |
| --------------- | ------------------------------------------------------------------ |
| `auth`          | `signInWithGoogle`, `signOut`, `claimFirstAdmin`                   |
| `applications`  | `inviteFaculty`, `correctUserAccount`                              |
| `admin`         | `createDepartment`, `updateDepartment`                             |
| `availability`  | `createAvailability`, `updateAvailability`, `deleteAvailability`   |
| `booking`       | `bookConsultation`                                                 |
| `consultations` | `decideConsultation`, `cancelConsultation`, `completeConsultation` |
| `notifications` | `markNotificationRead`, `markAllNotificationsRead`                 |

Each action validates input and performs role authorization. Booking, decisions, cancellation, completion, invites, correction, and first-admin claim delegate to transactional PostgreSQL functions.

## RPC-backed cursor loaders

Client components fetch additional pages through `'use server'` loaders:

- `getFacultyPage` calls `list_faculty_page`.
- `getApplicationPage` calls `list_application_page`.
- `getConsultationPage` calls `search_my_consultations`.
- `getNotificationPage` reads `notifications` with a `(created_at, id)` cursor.

These loaders are internal application interfaces, not public HTTP APIs.
