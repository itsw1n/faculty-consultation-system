# Product

A web-based faculty consultation and scheduling system for Assumption College of Davao. Students request consultations, faculty manage availability and requests, and administrators manage accounts, departments, and records.

Next.js 16 · Supabase Auth + PostgreSQL · TypeScript · React Aria · Tailwind CSS.

## Goals

- Let approved students discover faculty availability and request consultations.
- Let faculty publish availability and decide requests safely.
- Let administrators manage accounts, departments, and school records.
- Keep booking, status transitions, and access control authoritative in PostgreSQL.

## Roles

### Student

An approved school account that discovers faculty, requests consultations, views its own consultation records, and cancels eligible requests.

### Faculty

An approved account invited by an administrator. Faculty publish availability, decide requests, complete consultations, and record outcomes.

### Admin

A privileged account that manages departments, invites faculty, corrects approved accounts, and reads consultation metadata.

How each role becomes an account is defined in [`rules.md`](rules.md#account-and-role-rules).

## What each role can do

| Role | Screens |
| ---- | ------- |
| Student | Dashboard, Book Consultation, My Consultations |
| Faculty | Dashboard, My Availability, Consultation Requests, My Consultations |
| Admin | Dashboard, Manage Users, Manage Faculty, Departments, Consultation Records |

Common capabilities:

- **Booking** — a three-step wizard: choose faculty, choose an open slot, add a purpose and optional description, then review and confirm.
- **Consultations** — cursor paginated lists with search and status filters, participant-only detail pages, and outcome notes.
- **Notifications** — an in-app bell with unread count and a full notifications page.
- **Email** — generic status emails and next-day reminders, secondary to in-app notifications.
- **Accounts** — role-specific navigation; approved role and department are not user-editable.

## Consultation categories

`GRADE`, `CAPSTONE`, `ACADEMIC`, `PERSONAL`, `OTHER`. The category and the optional description are visible only to the student and the assigned faculty.

## Scope

Explicitly out of scope for v1:

- Payments and native mobile applications.
- Dark mode.
- Direct SIS integration until ICTC approves access, data use, and security controls.
- User-editable approved role or department.
- Administrative deletion of consultation history.
- Bulk approve/reject in the current Manage Users UI.

Exact behavior — statuses, transitions, constraints, and limits — lives in [`rules.md`](rules.md). How the system is built lives in [`architecture.md`](architecture.md).
