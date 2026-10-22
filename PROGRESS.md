# Progress

## Status

Core v1 implementation complete; awaiting environment-specific auth email configuration, hosted credentials, and deployment.

## Completed

- Supabase schema, RLS, seed data, atomic workflow RPCs, and database tests.
- Consolidated schema: faculty profile fields live in `profiles`; legacy tables and redundant columns are removed.
- Email + password sign-in with mandatory verification, self-service sign-up, password recovery, automatic student approval, verified-student faculty promotion, server-only first-admin claim, and admin account correction.
- Student faculty directory, availability calendar, booking, and consultation management.
- Faculty availability management and request decisions.
- Admin user, department, and consultation record views with CSV export.
- In-app notifications with read state and unread counts.
- Email outbox with status notifications, next-day reminders, Resend delivery, and a protected scheduled route.
- Responsive layouts, accessible dialogs, inline filters, cursor loading, and desktop/mobile E2E coverage.
- Unit, database, keyboard, type, lint, and production-build validation.

## Deferred

- Hosted auth email/SMTP, Resend, and cron credentials.
- Production deployment and live email verification.
- Dark mode.
