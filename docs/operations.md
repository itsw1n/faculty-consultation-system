# Operations

Deployment and scheduled email. Local setup is in [`getting-started.md`](getting-started.md); behavior is in [`concepts/rules.md`](concepts/rules.md).

## Supabase

1. Create the hosted Supabase project and confirm email authentication is enabled.
2. Configure SMTP or Supabase's email service, set the hosted site URL, and update the confirmation and recovery templates to link to `/auth/confirm` with `{{ .TokenHash }}`.
3. Link the CLI to the intended project and review pending migrations.
4. Apply migrations with `supabase db push` only through the team's approved release process.
5. Confirm the school domain exists in `approved_email_domains` and that no `*` wildcard row is present.

## Temporary Auth email pause

For the October 2026 deadline demo, the app hides password recovery and supports immediate sign-in when Supabase Auth does not require confirmation. In the **hosted** project, set Authentication → Sign In / Providers → Email → **Confirm email** to off. Leave email/password sign-in enabled. The app's Resend consultation notifications and reminders are separate and stay enabled.

This is a temporary demo setting. With confirmation off, Supabase automatically marks new email addresses confirmed; matching `@acdeducation.com` alone does **not** prove that the registrant owns that inbox. Verify that the first administrator has already claimed their account before using this setting. Do not treat an automatically confirmed email as school-verified identity for real users.

Before allowing fresh sign-ups on hosted production, bring the linked database through the released migrations and confirm `approved_email_domains` contains only the approved school domain. The October 25 audit found the hosted database applied only through `20261013000000`; the pending `20261020000001` migration adds the database trigger rejection for non-school Auth accounts, and the later migrations supply the current role/profile schema. Review backups and migration effects before applying them through the approved release process. The app-side domain check alone is insufficient for direct Auth API calls.

The same audit later found zero rows in `public.profiles` after a manual change, while four Supabase Auth accounts remained. Auth credentials alone do not grant access to the Student, Faculty, or Admin dashboards. The operator chose to leave these existing accounts unusable for the demo. Do not silently recreate their profiles or grant a role to the historical Gmail account. A later signup test must use an unused school address after the hosted migrations are applied; reusing an address still present in Supabase Auth will not create a fresh account. Any future profile recovery must inspect the Auth users and previously assigned roles before restoring Admin access.

The app no longer exposes a password reset form or action. For a demo account that loses its password, an authorized operator must verify the person's identity outside the app and use the Supabase Auth administration tools to set a temporary password. Do not send passwords in chat or email. Recovery via direct Supabase Auth APIs is outside the app's controls.

To resume the intended flow, configure and test hosted SMTP, turn **Confirm email** on, restore the password-reset forms/actions and recovery callback from Git history, test signup and recovery links against the hosted origin, then update this section and the manual test case. Restoring the setting does not prove ownership for accounts created while confirmation was off.

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

Run the validation commands from [`getting-started.md`](getting-started.md), complete the primary lifecycle pass in [`reference/manual-test-cases.md`](reference/manual-test-cases.md), and verify student, faculty, and admin access independently. While Auth email is paused, verify that the hosted Confirm email setting and the app's signup message agree. On continuation, test confirmation and recovery emails against the target origin before restoring those flows. Deployment and production migration execution require explicit operator approval.
