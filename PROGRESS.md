# Progress

## Status

Core v1 implementation complete; awaiting environment-specific OAuth configuration, hosted credentials, and deployment.

## Completed

- Supabase schema, RLS, seed data, atomic workflow RPCs, and database tests.
- Google OAuth sign-in with automatic student approval, invite-based faculty onboarding, first-admin claim, and admin account correction.
- Student faculty directory, availability calendar, booking, and consultation management.
- Faculty availability management and request decisions.
- Admin users, faculty, department, and consultation record views with CSV export.
- In-app notifications with read state and unread counts.
- Email outbox with status notifications, next-day reminders, Resend delivery, and a protected scheduled route.
- Responsive layouts, accessible dialogs, inline filters, cursor loading, and desktop/mobile E2E coverage.
- Unit, database, keyboard, type, lint, and production-build validation.

## Deferred

- Hosted Google OAuth, Resend, and cron credentials.
- Production deployment and live OAuth verification.
- Dark mode.
