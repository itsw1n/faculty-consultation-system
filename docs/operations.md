# Operations

Deployment and scheduled email. Local setup is in [`getting-started.md`](getting-started.md); behavior is in [`concepts/rules.md`](concepts/rules.md).

## Supabase

1. Create the hosted Supabase project and confirm email authentication is enabled.
2. Configure SMTP or Supabase's email service, set the hosted site URL, and update the confirmation and recovery templates to link to `/auth/confirm` with `{{ .TokenHash }}`.
3. Link the CLI to the intended project and review pending migrations.
4. Apply migrations with `supabase db push` only through the team's approved release process.
5. Confirm the school domain exists in `approved_email_domains` and that no `*` wildcard row is present.

## Next.js host

Configure the public `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values, then build with `npm run build`.

Server-only values required for email and administration:

- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for email delivery.
- `SUPABASE_SERVICE_ROLE_KEY` for the queue processor.
- `CRON_SECRET` for the scheduled email route.
- `INITIAL_ADMIN_EMAIL` for the first-admin claim.

Do not expose a service-role key or email credentials to the browser. Keep hosted SMTP credentials in the Supabase Auth settings, not repository files. See [`reference/environment.md`](reference/environment.md).

## Scheduled email

The `00:00 UTC` daily Vercel schedule runs the protected `/api/cron/email` route. Configure the schedule to send `Authorization: Bearer $CRON_SECRET`. The route compares the credential as UTF-8 bytes without leaking length timing. Reminders queue on each run; status notifications queue on the triggering RPC and are delivered by the same processor. Failed sends receive a 10-minute retry lease.

## Releases

Merging `dev` → `main` runs full CI; on green, the release workflow tags the next semantic version from Conventional Commits (`feat` → minor, `fix` → patch) and publishes generated notes. Production database pushes and hosting deploys are separate, explicitly approved steps.

## Release checklist

Run the validation commands from [`getting-started.md`](getting-started.md), test the confirmation and recovery emails against the target origin, and verify student, faculty, and admin access independently. Deployment and production migration execution require explicit operator approval.
