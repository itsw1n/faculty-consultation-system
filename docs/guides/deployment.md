# Deployment Guide

## Supabase

1. Create the hosted Supabase project and enable Google as an Auth provider.
2. Add the application callback URL ending in `/auth/callback` to the provider and Supabase allowlists.
3. Link the CLI to the intended project and review pending migrations.
4. Apply migrations with `supabase db push` only through the team's approved release process.
5. Confirm the school domain exists in `approved_email_domains` and that no `*` wildcard row is present.

## Next.js host

Configure the public `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values, then build with `npm run build`.

Server-only values are required for email delivery and administration:

- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for email delivery.
- `SUPABASE_SERVICE_ROLE_KEY` for the queue processor.
- `CRON_SECRET` for the scheduled email route.
- `INITIAL_ADMIN_EMAIL` for the first-admin claim.

Do not expose a service-role key or OAuth client secret to the browser. Keep hosted Google credentials in the Supabase Auth provider settings rather than repository files.

## Scheduled email

The `00:00 UTC` daily Vercel schedule runs the protected `/api/cron/email` route. Configure the schedule to send `Authorization: Bearer $CRON_SECRET`. Reminders queue on each run; status notifications queue on the triggering RPC and are delivered by the same processor.

## Release checklist

Before release, run the validation commands from `AGENTS.md`, test OAuth against the target callback origin, and verify student, faculty, and admin access independently. Deployment and production migration execution require explicit operator approval.
