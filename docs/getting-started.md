# Getting Started

## Prerequisites

- Node.js 22.14.0 or newer with npm 11.19.0 or newer (tested on Node.js 24.20.0)
- A running Docker-compatible runtime for the pinned local Supabase CLI

Tooling is installed through npm; never install ESLint, Prettier, TypeScript, Vitest, Playwright, or the framework CLIs globally. The Supabase CLI is a project dependency.

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

Point the app at the local stack in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local key from supabase status>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See [`reference/environment.md`](reference/environment.md) for every variable.

Then run:

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

The claim only succeeds while no approved admin exists. On success the account redirects to `/admin`.

## Faculty onboarding

1. Sign in as an admin.
2. Open `/admin/users`.
3. Enter 1–50 school emails, a department, and a position title.
4. Invite the faculty.

Each invited address becomes approved faculty the first time its owner signs in, with the invited department and position. Admins can later correct an approved account's role or department from the same page. See [`concepts/rules.md`](concepts/rules.md) for the full lifecycle.

## Validate

```bash
npm run check
npm run build
npm run supabase:test
npm run test:e2e
```

`npm run check` runs format, lint, typecheck, and unit tests. End-to-end specs under `e2e/` drive real Chromium against your local Supabase. Landing-page specs run anywhere; the click-to-database specs (`admin-users`, `admin-manage`, `auth-routing`, `consultation-lifecycle`, `faculty-availability`, `student-booking`) need `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (refresh it with `supabase status -o env`) and skip automatically when it is unavailable. Test sign-in bypasses Google OAuth by design: fixtures create password users through the Auth Admin API, inject the real GoTrue session cookie, and every click after login is genuine. Assertions check both the screen and the database row.

Commit the generated `package-lock.json`; CI uses `npm ci`.

## Optional Docker workflow

Docker Engine 27 or newer with Docker Compose v2.30 or newer is recommended, with at least 4 GB of memory and 10 GB of free disk space. Check occupied ports before startup with `ss -ltn` (Linux) or your platform's equivalent.

```bash
docker compose config
docker compose build
docker compose up -d
```

Compose builds only the Next.js app with `Dockerfile.dev`. Supabase still runs through the Supabase CLI, so start it separately with `npm run supabase:start`. Override a host-port collision with `FRONTEND_HOST_PORT`. The production `Dockerfile` uses the standalone Next.js output and is not needed for local development.
