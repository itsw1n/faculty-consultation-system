# Environment Variables

Copy the generated example before starting. Client environment location: `.env.local`.

| Variable                               | Visibility    | Required | Purpose                                                               |
| -------------------------------------- | ------------- | -------: | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client/public |      yes | Supabase project URL.                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client/public |      yes | Public Supabase key; RLS protects data.                               |
| `NEXT_PUBLIC_SITE_URL`                 | client/public |      yes | Canonical application origin used for the allowlisted OAuth callback. |

Values with `NEXT_PUBLIC_` are bundled into client code and must never contain secrets. Keep real environment files out of version control.

| Variable                    | Visibility  | Required for email | Purpose                                             |
| --------------------------- | ----------- | -----------------: | --------------------------------------------------- |
| `RESEND_API_KEY`            | server only |                yes | Resend API credential.                              |
| `RESEND_FROM_EMAIL`         | server only |                yes | Verified sender address.                            |
| `SUPABASE_SERVICE_ROLE_KEY` | server only |                yes | Queue processor access to the private email outbox. |
| `CRON_SECRET`               | server only |                yes | Bearer token for Vercel's scheduled email route.    |

| Variable              | Visibility  | Purpose                                              |
| --------------------- | ----------- | ---------------------------------------------------- |
| `INITIAL_ADMIN_EMAIL` | server only | Designated address allowed to claim the first admin. |

Do not prefix these values with `NEXT_PUBLIC_`. For a class demonstration, verify a sender domain or subdomain you control in Resend and send to test accounts. A Vercel app subdomain hosts the application but does not grant control of email DNS records. School-branded email needs ICTC approval for school DNS and sender identity.

## Local Google OAuth credentials

Google provider credentials for local Supabase are repository-scoped in `supabase/.env.local`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Copy `supabase/.env.example` to create it. The file is ignored by Git. Do not put these values in `NEXT_PUBLIC_*` variables or commit them. Production Google credentials are configured separately in the hosted Supabase project's Auth provider settings.
