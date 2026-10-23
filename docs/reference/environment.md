# Environment Reference

Copy `.env.example` to `.env.local` before starting. Setup steps are in [`../getting-started.md`](../getting-started.md).

## Client and public values

| Variable                               | Required | Purpose                                                 |
| -------------------------------------- | -------: | ------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             |      yes | Supabase project URL.                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |      yes | Public Supabase key; RLS protects data.                 |
| `NEXT_PUBLIC_SITE_URL`                 |      yes | Canonical application origin used for auth email links. |

Values with `NEXT_PUBLIC_` are bundled into client code and must never contain secrets. Keep real environment files out of version control.

## Server-only values

| Variable                    | Required for                      | Purpose                                                           |
| --------------------------- | --------------------------------- | ----------------------------------------------------------------- |
| `RESEND_API_KEY`            | email delivery                    | Resend API credential.                                            |
| `RESEND_FROM_EMAIL`         | email delivery                    | Verified sender address.                                          |
| `SUPABASE_SERVICE_ROLE_KEY` | email queue and first-admin claim | Server-only access to the private email outbox and bootstrap RPC. |
| `CRON_SECRET`               | scheduled email                   | Bearer token for the scheduled email route.                       |
| `INITIAL_ADMIN_EMAIL`       | first admin                       | Address allowed to claim the first admin role.                    |

Do not prefix these with `NEXT_PUBLIC_`. Email delivery is optional locally; without Resend credentials the outbox processor returns zero claimed and sent emails.

For a demonstration, verify a sender domain or subdomain you control in Resend and send to test accounts. A Vercel app subdomain hosts the application but does not grant control of email DNS records; school-branded email needs ICTC approval for school DNS and sender identity.

## Auth email templates

Supabase Auth sends sign-up confirmation and password recovery emails. Locally these are captured automatically and displayed at `http://127.0.0.1:54324`. The templates live in `supabase/templates/` and are wired in `supabase/config.toml`; they link to `/auth/confirm` using `{{ .TokenHash }}`.

For a hosted project, configure SMTP or Supabase's email service in the Supabase Auth settings and update the same templates there. These auth emails are separate from the application's Resend delivery for consultation status notifications.

## Approved email domains

`approved_email_domains` is database data, not an environment variable. Migrations set the confirmed school domain. Local seed data adds a `*` wildcard for development only; never add that row to a hosted environment.

New accounts are checked against this table when created, and sign-in and faculty promotion check it again. The local wildcard permits any domain only while that row exists. Email confirmation remains required with or without the wildcard.
