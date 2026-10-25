# Progress

## Status

Core v1 implementation is released. Hosted Auth confirmation and in-app password recovery are being paused for the October 2026 deadline demo. The production database still needs its pending migrations before new registrations can reach the current role-based app. A later read-only audit also found the hosted `profiles` table empty after a manual change; four Auth users remain without app access by operator choice.

## Completed

- Supabase schema, RLS, seed data, atomic workflow RPCs, and database tests.
- Consolidated schema: faculty profile fields live in `profiles`; legacy tables and redundant columns are removed.
- Email + password sign-in, self-service sign-up, automatic student approval in the current schema, faculty promotion, server-only first-admin claim, and admin account correction.
- Student faculty directory, availability calendar, booking, and consultation management.
- Faculty availability management and request decisions.
- Admin user, department, and consultation record views with CSV export.
- In-app notifications with read state and unread counts.
- Email outbox with status notifications, next-day reminders, Resend delivery, and a protected scheduled route.
- Responsive layouts, accessible dialogs, inline filters, cursor loading, and desktop/mobile E2E coverage.
- Unit, database, keyboard, type, lint, and production-build validation.

## Deferred

- Restore hosted sign-up confirmation and in-app password recovery after SMTP delivery and recovery links are verified end to end.
- Apply and verify hosted database migrations; the October 25 read-only audit found migration history only through `20261013000000`.
- Resolve the four Auth accounts without profiles when account recovery is explicitly requested. For a fresh signup test, use an unused school address after migrations are applied.
- Verify live consultation status/reminder delivery through Resend and the cron job.
- Dark mode.
