# Environment Reference

Copy `.env.example` to `.env.local` before starting. Setup steps are in [`../getting-started.md`](../getting-started.md).

## Client and public values

| Variable                               | Required | Purpose                                                               |
| -------------------------------------- | -------: | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             |      yes | Supabase project URL.                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |      yes | Public Supabase key; RLS protects data.                               |
| `NEXT_PUBLIC_SITE_URL`                 |      yes | Canonical application origin used for the allowlisted OAuth callback. |

Values with `NEXT_PUBLIC_` are bundled into client code and must never contain secrets. Keep real environment files out of version control.

## Server-only values

| Variable                    | Required for    | Purpose                                             |
| --------------------------- | --------------- | --------------------------------------------------- |
| `RESEND_API_KEY`            | email delivery  | Resend API credential.                              |
| `RESEND_FROM_EMAIL`         | email delivery  | Verified sender address.                            |
| `SUPABASE_SERVICE_ROLE_KEY` | email queue     | Queue processor access to the private email outbox. |
| `CRON_SECRET`               | scheduled email | Bearer token for the scheduled email route.         |
| `INITIAL_ADMIN_EMAIL`       | first admin     | Address allowed to claim the first admin role.      |

Do not prefix these with `NEXT_PUBLIC_`. Email delivery is optional locally; without Resend credentials the outbox processor returns zero claimed and sent emails.

For a demonstration, verify a sender domain or subdomain you control in Resend and send to test accounts. A Vercel app subdomain hosts the application but does not grant control of email DNS records; school-branded email needs ICTC approval for school DNS and sender identity.

## Local Google OAuth credentials

Google provider credentials for local Supabase are repository-scoped in `supabase/.env.local`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Copy `supabase/.env.example` to create it. The file is ignored by Git. Do not put these in `NEXT_PUBLIC_*` variables or commit them. Production Google credentials are configured in the hosted Supabase project's Auth provider settings.

## Approved email domains

`approved_email_domains` is database data, not an environment variable. Migrations set the confirmed school domain. Local seed data adds a `*` wildcard for development only; never add that row to a hosted environment.
