# Deployment Guide

## Supabase

1. Create the hosted Supabase project and enable Google as an Auth provider.
2. Add the application callback URL ending in `/auth/callback` to the provider and Supabase allowlists.
3. Link the CLI to the intended project and review pending migrations.
4. Apply migrations with `supabase db push` only through the team's approved release process.

## Next.js host

Configure `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then build with `npm run build`. These are public values; do not expose a service-role key or OAuth client secret to the browser.

Before release, run the validation commands from `AGENTS.md`, test OAuth against the target callback origin, and verify student, faculty, and admin access independently. Deployment and production migration execution require explicit operator approval.
