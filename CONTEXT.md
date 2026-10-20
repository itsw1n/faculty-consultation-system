# Project Context

## Product

Assumption College of Davao is a web-based faculty consultation and scheduling system for students, faculty, and school administrators.

## Goals

- Let approved students discover faculty availability and request consultations.
- Let faculty publish availability and manage consultation requests safely.
- Let administrators manage accounts, departments, and school records.
- Keep booking, status transitions, and access control authoritative in PostgreSQL.

## Key decisions

- Next.js App Router with Server Components by default and client components only for interactive UI.
- Supabase Auth uses email + password with mandatory email verification and emailed password recovery; Supabase PostgreSQL owns application data and authorization policies.
- Approved school-domain emails become students automatically on first sign-in.
- Admins invite faculty by school email; the invite assigns department and position on first sign-in.
- The designated `INITIAL_ADMIN_EMAIL` can claim the first admin role once from `/auth/claim-admin`.
- Admins can correct an approved account's role or department.
- State-changing workflows use validated server actions and atomic security-definer database functions.
- In-app notifications remain the primary channel; Resend sends generic status emails and next-day reminders through a private database outbox.
- Consultation descriptions and outcomes are visible only to the student and assigned faculty; admins see metadata and counts.
- The UI uses the supplied light palette and login reference; labels pictured in references do not override product specifications.

## Out of scope for v1

- User-editable approved role or department.
- Administrative deletion of consultation history.
- Payments, dark mode, native mobile applications.
- Direct SIS integration until ICTC approves access, data use, and security controls.

Exact record fields and the retention period are still to be confirmed with the school before paper records can be retired.

## Source of truth

Product behavior is defined by [`docs/concepts/`](docs/concepts/). Migrations and automated tests are authoritative for database behavior. [`PROGRESS.md`](PROGRESS.md) records completion and deferred work. The full docs map is in [`docs/README.md`](docs/README.md).
