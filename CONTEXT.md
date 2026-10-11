# Project Context

## Product

Assumption College of Davao is a web-based faculty consultation and scheduling system for students, faculty, and school administrators.

## Goals

- Let approved students discover faculty availability and request consultations.
- Let faculty publish availability and manage consultation requests safely.
- Let administrators review account applications and inspect school records.
- Keep booking, status transitions, and access control authoritative in PostgreSQL.

## Key decisions

- Next.js App Router with Server Components by default and client components only for interactive UI.
- Supabase Auth uses Google OAuth; Supabase PostgreSQL owns application data and authorization policies.
- New identities remain pending until an administrator assigns an approved role.
- State-changing workflows use validated server actions and atomic security-definer database functions.
- In-app notifications remain the primary channel; Resend sends generic status emails and next-day reminders through a private database outbox.
- The UI uses the supplied light palette and login reference; labels pictured in references do not override product specifications.

## Out of scope for v1

- User-editable approved role or department.
- Administrative deletion of consultation history.
- Payments, dark mode, native mobile applications, and direct SIS integration.

## Source of truth

Product behavior is defined in `docs/specs/`. Migrations and automated tests are authoritative for database behavior. `docs/plans/implementation-plan.md` records completion status.
