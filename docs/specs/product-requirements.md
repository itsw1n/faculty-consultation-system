# Product Requirements

This document describes the behavior implemented in the current codebase.

## 1. Product name

Faculty Consultation & Scheduling System for Assumption College of Davao.

## 2. User roles

### Student

An approved school account that can discover faculty, request consultations, view its own consultation records, and cancel eligible requests.

### Faculty

An approved account invited by an administrator. Faculty publish availability, decide requests, complete consultations, and record outcomes.

### Admin

A privileged account that manages departments, invites faculty, corrects approved accounts, and reads consultation metadata.

## 3. Access model

1. The public landing page at `/` starts Google OAuth through Supabase Auth.
2. `/auth/callback` exchanges the OAuth code for a cookie-backed session.
3. `/auth/continue` routes the authenticated profile by status and role.
4. `handle_new_auth_user` creates a profile from trusted Google identity data.
5. An email on an approved domain becomes `STUDENT / APPROVED` automatically.
6. If an unconsumed `faculty_invites` row matches the email, the profile instead becomes `FACULTY / APPROVED` with the invited department and position.
7. Profiles that already carry `PENDING` or `REJECTED` remain parked at `/application/pending` or `/application/rejected`.
8. The account matching `INITIAL_ADMIN_EMAIL` can claim the first admin role once at `/auth/claim-admin`.
9. Administrators invite faculty from `/admin/users` and correct an approved account's role or department.

Local development seeds a wildcard domain so personal Google accounts can sign in. Hosted environments use only the confirmed school domain stored in `approved_email_domains`.

## 4. Student requirements

### Dashboard

- Confirmed and pending consultation counts.
- The five most recent consultations.
- Quick action to book a consultation.

### Book consultation

1. Choose a faculty member from the paginated directory.
2. Search by name or filter by department.
3. Choose an open slot in the weekly desktop calendar or the mobile day list.
4. Select a purpose and optional description.
5. Review faculty, date, time, mode, and purpose.
6. Confirm the request.

Slot states:

- `OPEN`: selectable.
- `RESERVED`, `BOOKED`, `CLOSED`: visible and disabled.

The schedule can be refreshed without leaving the wizard.

### Details step

- Purpose is one of: `GRADE`, `CAPSTONE`, `ACADEMIC`, `PERSONAL`, `OTHER`.
- Description is optional and limited to 2,000 characters.
- Mode and location come from the availability slot.

### My consultations

- Search and filter by consultation status.
- Cursor-based infinite scrolling.
- Status badges.
- Cancel a `PENDING` or `APPROVED` consultation through a confirmation dialog.
- Open participant-only detail pages.

## 5. Faculty requirements

### Dashboard

- Pending request count.
- Confirmed consultation count.
- Open availability count.
- Quick action to add availability.

### My availability

- List upcoming availability.
- Add availability with date, start time, end time, mode, location, and meeting link.
- Edit or remove an `OPEN` slot.
- View slot details.
- `RESERVED`, `BOOKED`, and `CLOSED` slots cannot be edited or removed as open availability.

### Consultation requests

- Pending requests only.
- Search and infinite scrolling.
- Approve or reject through confirmation dialogs.

### My consultations

- Confirmed and completed consultations.
- Search and filter.
- Open participant-only detail pages.
- Mark an approved consultation completed with an optional outcome note.

## 6. Admin requirements

### Dashboard

- Pending application count.
- Approved faculty count.
- Total consultation count.

### Manage users

- Search by name or email.
- Filter by status, role, and department.
- Infinite scrolling.
- Invite up to 50 school emails at a time with a department and position title.
- Correct the role or department of an approved account.
- Legacy `PENDING` accounts are visible but the current UI has no approve/reject action.

### Manage faculty

- Search approved faculty.
- View name, email, department code, position title, and status.

### Departments

- List departments.
- Add a department with a unique code and name.
- Update an existing department.

### Consultation records

- Search and filter by status.
- Infinite scrolling.
- Read-only metadata view.
- Download a metadata summary CSV for a range of up to 366 days.

## 7. Notifications and email

### In-app notifications

- The header bell shows the five latest notifications and an unread count.
- `View all notifications` opens `/notifications`.
- The notifications page supports infinite scrolling and marking all as read.

Important events:

- Application approved or rejected.
- New consultation request for faculty.
- Consultation approved, rejected, cancelled, or completed.
- New application for admins, when the legacy application path is used.

### Email

- Status changes enqueue email records in `email_outbox`.
- `GET /api/cron/email` processes the outbox with a bearer secret.
- The Vercel schedule runs daily at `00:00 UTC` (08:00 Philippine time).
- Reminders are queued for approved consultations scheduled the next day.
- Resend uses the email record ID as an idempotency key.
- In-app notifications remain the primary channel.

## 8. Profile and navigation

- The profile details panel is pinned to the bottom of the desktop sidebar.
- It shows name, email, role, department, optional position, and sign out.
- Approved role and department are not user-editable.
- Navigation is role-specific:
  - Student: Dashboard, Book Consultation, My Consultations.
  - Faculty: Dashboard, My Availability, Consultation Requests, My Consultations.
  - Admin: Dashboard, Manage Users, Manage Faculty, Departments, Consultation Records.

## 9. Responsive and accessibility requirements

- Mobile-first layout with a hamburger navigation panel.
- The weekly calendar becomes a day selector plus vertical slot list on narrow screens.
- Dialogs manage focus and restore it on close.
- Interactive controls are keyboard accessible.
- Status is conveyed with text as well as color.
- The application is light-theme only in v1.

## 10. Out of scope and current gaps

- Payments and native mobile applications.
- Dark mode.
- Direct SIS integration.
- User-editable approved role or department.
- Administrative deletion of consultation history.
- Bulk approve/reject in the current Manage Users UI.
