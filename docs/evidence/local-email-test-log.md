# Local Email Test Log

Date: October 25, 2026

## Runtime

- Application: `http://127.0.0.1:3000`
- Supabase API: `http://127.0.0.1:54321`
- Local mailbox UI: `http://127.0.0.1:54324`
- Mailbox service: Supabase Inbucket/Mailpit container
- Database service: local Supabase PostgreSQL on `127.0.0.1:54322`

## Evidence captured

- [Mailbox list](local-mailbox-auth-confirmation.png)
- [Confirmation email detail](local-mailbox-auth-confirmation-detail.png)

The mailbox detail shows a locally generated Supabase Auth confirmation email,
including the sender, recipient, subject, timestamp, and confirmation link.

## Faculty and student notification check

The local `email_outbox` contained consultation events for both seeded students
and faculty recipients, including `APPROVED`, `REJECTED`, `CANCELLED`, and
`REMINDER` events. The application delivery service sends these consultation
notifications through Resend, not through the local Supabase mailbox. Therefore,
those messages cannot appear in the local mailbox unless a local Resend-compatible
transport is configured.

The local cron endpoint was also checked at `/api/cron/email`; an unauthenticated
request returned HTTP 401 as expected. No external email was sent during this
test, and no production data was changed.