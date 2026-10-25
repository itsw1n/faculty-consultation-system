# API reference

[Documentation guide](../README.md) · Previous: [Database model](../concepts/data-model.md) · Next: [Getting started](../getting-started.md)

This application has a small set of HTTP endpoints, Next.js Server Actions for forms, and PostgreSQL functions for protected data operations. This guide describes the current internal interfaces. There is no separately versioned public REST API for third-party clients.

## Three kinds of interface

| Interface         | Meaning                                                                          | Example                                     |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| **HTTP endpoint** | A URL that accepts a request and returns JSON, a file, or a redirect             | `GET /api/faculty/[facultyId]/availability` |
| **Server Action** | A Next.js server function called by an application form or client interaction    | `bookConsultation`                          |
| **Database RPC**  | A remote procedure call: an application request to execute a PostgreSQL function | `book_consultation`                         |

An HTTP method is not assigned to each Server Action in this reference. Next.js manages their request transport; the function names are not REST URLs. A database RPC is a separate database interface, with its own permissions and checks.

## Example: a Student submits a booking

1. The booking form passes `slotId`, `category`, and optional `notes` to `bookConsultation`.
2. The action requires an approved Student and validates those fields.
3. It calls `book_consultation` using the signed-in user's database session.
4. The database checks the caller and availability, reserves the slot, and creates a pending consultation in one transaction.
5. Success redirects to `/student/consultations`. A conflict returns a safe message asking the Student to choose another slot.

A browser cannot bypass those rules by changing the submitted role or slot status. Those values are determined or checked on the server and in PostgreSQL. See [booking transitions](../concepts/rules.md#booking-transitions).

Implementation: [booking action](../../src/features/booking/actions.ts), [booking schema](../../src/features/booking/schemas/bookingSchema.ts), and the [database function catalog](../concepts/data-model.md#rpc-catalog).

## HTTP endpoints

The endpoints below use the existing signed-in session, except the public health check, email confirmation link, and secret-protected email job.

| Method and route                            | Access               | Purpose                                                        |
| ------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| `GET /api/health`                           | Public               | Basic application health response                              |
| `GET /api/faculty/[facultyId]/availability` | Approved Student     | Read one faculty member's slots                                |
| `GET /admin/consultations/export`           | Admin                | Download a date-range summary CSV                              |
| `GET /faculty/consultations/export`         | Approved Faculty     | Download that faculty member's date-range consultation records |
| `GET /auth/confirm`                         | Valid email token    | Verify an existing sign-up/email link and redirect             |
| `GET /api/cron/email`                       | Bearer `CRON_SECRET` | Queue reminders and process consultation emails                |

The health endpoint accepts no inputs and returns HTTP `200` with `{ "status": "ok" }`. It does not test the database or email provider. The other contracts are detailed below.

Source: [health](../../src/app/api/health/route.ts), [availability](../../src/app/api/faculty/[facultyId]/availability/route.ts), [admin CSV export](../../src/app/admin/consultations/export/route.ts), [faculty CSV export](../../src/app/faculty/consultations/export/route.ts), [confirmation](../../src/app/auth/confirm/route.ts), [email job](../../src/app/api/cron/email/route.ts).

### Faculty availability

- **Inputs:** a faculty UUID in the path; optional paired `start` and `end` dates.
- **Success:** HTTP `200`, JSON `{ "slots": [...] }`.
- **Errors:** `400` for invalid identifiers/ranges, `401` without authentication, `403` for the wrong role/status, and `500` when schedules cannot be loaded.

Dates use `YYYY-MM-DD`. Supply both `start` and `end`, with the start on or before the end and at most 62 inclusive days. Without a range, the service uses today in Philippine time through 28 days later. The endpoint returns slot information, not a consultation's private notes or online meeting link.

Example request from the same-origin application while signed in as a Student:

```javascript
const response = await fetch(
  '/api/faculty/a0000000-0000-4000-8000-000000000002/availability?start=2026-11-01&end=2026-11-30'
)
const result = await response.json()
```

Illustrative successful response; actual IDs, dates, and availability depend on stored data:

```json
{
  "slots": [
    {
      "id": "b0000000-0000-4000-8000-000000000001",
      "slot_date": "2026-11-02",
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "slot_status": "OPEN",
      "mode": "IN_PERSON",
      "location": "Room 204",
      "faculty_name": "Alexandra Mendoza"
    }
  ]
}
```

An empty result is `{ "slots": [] }`. Endpoint errors use `{ "error": "safe message" }`, for example `{ "error": "Students only." }` with HTTP `403`. The [slot type](../../src/features/booking/types.ts) and [range service](../../src/features/booking/services/facultyAvailability.ts) define the fields and date limits.

### Consultation summary CSV

- **Inputs:** required `from` and `to` dates in the query string.
- **Success:** HTTP `200` with a CSV attachment.
- **Errors:** `400` for an invalid range, `401` without authentication, `403` without Admin access, and `500` if the report cannot be prepared.

Example: `/admin/consultations/export?from=2026-11-01&to=2026-11-30`.

### Faculty consultation CSV

- **Inputs:** required `from` and `to` dates in the query string; ranges may span up to 366 days.
- **Success:** HTTP `200` with the signed-in faculty member's own consultation records as a CSV attachment, including all statuses.
- **Errors:** `400` for an invalid range, `401` without authentication, `403` without approved Faculty access, and `500` if the report cannot be prepared.
- The database export function independently enforces approved Faculty role, faculty ownership, and slot-date filtering. The CSV includes student name, category, status, schedule, mode, location, and request time. It omits consultation descriptions, outcomes, and meeting links.

Example: `/faculty/consultations/export?from=2026-01-01&to=2026-10-25`.

The range is inclusive and limited to 366 days. The file groups counts by these columns:

```csv
Date,Department,Category,Status,Count
```

It does not export individual participants' descriptions, outcomes, or meeting links. Responses use `Cache-Control: private, no-store` on successful downloads and authorization denials. Authorization errors are JSON; invalid ranges and report failures are text responses. See the [CSV formatter](../../src/features/consultations/services/summaryCsv.ts) and [report-range schema](../../src/features/consultations/schemas/reportRangeSchema.ts).

### Email confirmation and scheduled delivery

`/auth/confirm` requires `token_hash` and accepts `type=email` or `signup`; `next` is an optional local path. Invalid, expired, or recovery links redirect to `/?error=verify`. It verifies the token with Supabase Auth and uses a safe application-local redirect destination. Confirmation templates are described in [Environment reference](environment.md#auth-email-templates). The former `/auth/forgot-password` and `/auth/reset-password` pages redirect to sign-in while password recovery is paused.

The scheduled email route returns HTTP `200` JSON with `claimed` and `sent` counts, `401` for a missing/invalid secret, or `503` when processing is unavailable. It queues reminders and processes pending consultation emails. It requires a server-side bearer secret, not a normal user session. Without configured Resend delivery credentials, processing can return `{ "claimed": 0, "sent": 0 }`; that does not prove an email was sent. Scheduling and credentials belong in [Operations](../operations.md#scheduled-email).

## Server actions

Input names below are the keys submitted in `FormData`. UUID means a validated identifier such as a slot or consultation ID. Required roles are checked on the server; eligible record ownership and state are checked again during persistence.

### Authentication

[Implementation](../../src/features/auth/actions.ts) · [Input schemas](../../src/features/auth/schemas/authSchema.ts)

| Action               | Form fields                                        | Who / successful result                                                          |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `signInWithPassword` | `email`, `password`                                | Valid credentials and permitted domain; redirects through role routing           |
| `signUpWithPassword` | `fullName`, `email`, `password`, `confirmPassword` | Allowed email; redirects when Auth returns a session, else asks for confirmation |
| `signOut`            | None                                               | Ends the session and redirects to `/`                                            |
| `claimFirstAdmin`    | No submitted account/role fields                   | Designated signed-in account; server-only bootstrap checks, then Admin routing   |

### Account and department management

Admin access is required for all actions in this section. [Account implementation](../../src/features/applications/actions.ts) · [Department implementation](../../src/features/admin/actions.ts)

| Action               | Form fields                                                | Successful result                                          |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `promoteFaculty`     | `email`, `departmentId`, `positionTitle`                   | Promotes an eligible verified Student and returns feedback |
| `correctUserAccount` | `userId`, `role`, `departmentId`, optional `positionTitle` | Corrects an eligible approved account and returns feedback |
| `createDepartment`   | `code`, `name`                                             | Creates the department and refreshes the directory         |
| `updateDepartment`   | `id`, `code`, `name`                                       | Updates the department and refreshes the directory         |

### Availability actions

Faculty access and ownership of the affected slot are required. [Implementation](../../src/features/availability/actions.ts)

| Action               | Form fields                                                               | Successful result                                  |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| `createAvailability` | `date`, `startTime`, `endTime`, `mode`, optional `location`/`meetingLink` | Creates a valid future slot and returns feedback   |
| `updateAvailability` | Same schedule fields, plus `slotId`                                       | Updates an eligible open slot and returns feedback |
| `deleteAvailability` | `slotId`                                                                  | Removes an eligible open slot                      |

### Booking and consultation decisions

[Booking implementation](../../src/features/booking/actions.ts) · [Consultation implementation](../../src/features/consultations/actions.ts)

| Action                             | Form fields                                                 | Who / successful result                                     |
| ---------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `bookConsultation`                 | `slotId`, `category`, optional `notes`                      | Student; creates the request and redirects to consultations |
| `decideConsultation`               | `consultationId`, `approve` as the string `true` or `false` | Assigned Faculty; approves or rejects a pending request     |
| `cancelConsultation`               | `consultationId`                                            | Owning Student; cancels an eligible request                 |
| `completeConsultation`             | `consultationId`, optional `outcome`                        | Assigned Faculty; completes an approved consultation        |
| `completeConsultationWithFeedback` | `consultationId`, optional `outcome`                        | Same completion operation with a form-state feedback result |

### Notifications

An approved account is required; these actions affect only its own inbox. [Implementation](../../src/features/notifications/actions.ts)

| Action                     | Form fields      | Successful result                                             |
| -------------------------- | ---------------- | ------------------------------------------------------------- |
| `markNotificationRead`     | `notificationId` | Marks the specified notification read and refreshes the inbox |
| `markAllNotificationsRead` | None             | Marks its unread notifications read and refreshes the inbox   |

Position is required for promotion. In-person availability requires a location; online availability may provide an HTTP(S) meeting link. Categories, account-correction restrictions, and lifecycle eligibility are defined in [Business rules](../concepts/rules.md).

### Action results and errors

The actions have two patterns; they do not all return JSON or the same object:

- **Form-state actions** work with React form state. Most accept a previous state and `FormData`; the first-admin claim has no submitted fields. They return `{ error: string | null, message?: string | null }` for validation/feedback, or redirect after success. Examples: account promotion, availability creation, and booking.
- **Direct actions** accept `FormData` where needed and normally return no value. They refresh affected pages or redirect; invalid or conflicting operations can throw. The calling form/dialog handles its feedback. Examples: department updates, request decisions, and notification read actions.

An unauthenticated role-protected action redirects to sign-in. A wrong-role or wrong-status account is routed through `/auth/continue`. First-admin and password actions also have their own safe feedback checks. HTTP `401`/`403` contracts from route handlers should not be assumed for page navigation or Server Actions.

Typical feedback includes an unavailable booking slot, changed consultation state, overlapping availability, duplicate department values, or an unverified/ineligible account for promotion. Rendering failures use the error boundary; unknown pages use the not-found screen. There is no stable public error-code API in v1. Consult the linked action and schema for its exact message and return behavior.

## Read interfaces and pagination

Initial page data is loaded on the server. Interactive lists use authorized, validated `'use server'` loaders to fetch further results. A cursor identifies where the next page continues, instead of numbering pages.

| Loader                                                                                 | Data source                              | Result and access                                      |
| -------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| [getFacultyPage](../../src/features/booking/queries/getFacultyPage.ts)                 | `list_faculty_page` RPC                  | Faculty directory; Student access                      |
| [getApplicationPage](../../src/features/applications/queries/getApplicationPage.ts)    | `list_application_page` RPC              | Approved account directory; Admin access               |
| [getConsultationPage](../../src/features/consultations/queries/getConsultationPage.ts) | `search_my_consultations` RPC            | Own/assigned consultations, or redacted Admin metadata |
| [getNotificationPage](../../src/features/notifications/queries/getNotificationPage.ts) | Recipient-filtered `notifications` query | The approved account's own inbox                       |

These loaders return `InfinitePage`: `{ items, hasMore, nextCursor }`. They throw on request failure; the shared list UI retains loaded results and offers retry. Search/filter inputs and cursor formats differ by loader; see [pagination rules](../concepts/rules.md#search-and-pagination) and the linked implementations.

Dashboard summaries are read-only database functions. Their names are listed in the [RPC catalog](../concepts/data-model.md#rpc-catalog); their implementations are reached through [dashboard repositories](../../src/features/dashboard/repositories/dashboardRepository.ts).

## Application pages

These are navigable screens, not additional REST endpoints.

| Routes                                                                                                            | Purpose                                                            |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `/`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/reset-password`                                             | Sign-in, registration, and recovery forms                          |
| `/auth/continue`, `/auth/claim-admin`, `/application/pending`, `/application/rejected`                            | Account routing, initial Admin setup, and historical account gates |
| `/student`, `/student/book`, `/student/book/[facultyId]`, `/student/consultations`, `/student/consultations/[id]` | Student workflows                                                  |
| `/faculty`, `/faculty/availability`, `/faculty/requests`, `/faculty/consultations`, `/faculty/consultations/[id]` | Faculty workflows                                                  |
| `/admin`, `/admin/users`, `/admin/departments`, `/admin/consultations`                                            | Administrative workflows                                           |
| `/notifications`                                                                                                  | The signed-in approved account's notification inbox                |

`/faculty/requests` accepts an optional `status` query parameter (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`, or `all`); it defaults to `PENDING`.

For the visible experience, return to the [system walkthrough](../walkthrough.md). For authorization boundaries, read [Architecture](../concepts/architecture.md#authorization).
