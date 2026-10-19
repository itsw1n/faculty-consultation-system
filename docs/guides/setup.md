# Local Setup Guide

## Prerequisites

- Node.js 22.14.0 or newer with npm 11.19.0 or newer (tested on Node.js 24.20.0)
- A running Docker-compatible runtime for the pinned local Supabase CLI

## Install and start

```bash
cp .env.example .env.local
npm install
```

Before the first local start, configure Google OAuth for this repository:

```bash
cp supabase/.env.example supabase/.env.local
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `supabase/.env.local`. This file is ignored by Git and applies only to this project's local Supabase container. Add this authorized redirect URI to the Google OAuth web client:

```text
http://127.0.0.1:54321/auth/v1/callback
```

The local Supabase config reads the credentials through `env(GOOGLE_CLIENT_ID)` and `env(GOOGLE_CLIENT_SECRET)`.

The application connection values belong in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local key from supabase status>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then use the normal local workflow:

```bash
npm run supabase:start
npm run supabase:reset
npm run dev
```

Local `supabase:reset` applies `supabase/seed.sql`, which allows any email domain so the team can sign in with personal Google accounts. Hosted environments never receive the seed — only school domains work there. To test strict domain checks locally, run:

```sql
delete from public.approved_email_domains where domain = '*';
```

## First administrator

1. Add `INITIAL_ADMIN_EMAIL` to `.env.local`.
2. Restart the dev server.
3. Sign in with that Google account.
4. Open `/auth/claim-admin` and claim the first admin role.

The claim only succeeds while no approved admin exists. When the claim succeeds, the account is redirected to `/admin`.

## Faculty onboarding

1. Sign in as an admin.
2. Open `/admin/users`.
3. Enter 1–50 school emails, a department, and a position title.
4. Invite the faculty.

Each invited address becomes approved faculty the first time its owner signs in. The invite assigns the department and position. Admins can later correct an approved account's role or department from the same page.

## Validate

```bash
npm run check
npm run build
npm run supabase:test
npm run test:e2e
```

End-to-end specs under `e2e/` drive real Chromium against your local Supabase. Landing-page specs run anywhere; the click-to-database specs (`admin-users`, `admin-manage`, `auth-routing`, `consultation-lifecycle`, `faculty-availability`, `student-booking`) need `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (refresh it from `supabase status -o env`) and skip automatically when it is unavailable. Test sign-in bypasses Google OAuth by design: fixtures create password users through the Auth Admin API, inject the real GoTrue session cookie, and every click after login is genuine. Assertions check both the screen and the database row.

Commit the generated `package-lock.json`; CI uses `npm ci`.
