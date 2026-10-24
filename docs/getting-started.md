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

Local email verification uses Supabase's built-in mail catcher and the templates in `supabase/config.toml`. No provider credentials are needed. Confirmation and recovery messages appear at `http://127.0.0.1:54324` while the local stack is running.

Point the app at the local stack in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local key from supabase status>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=<local secret key from supabase status>
```

See [`reference/environment.md`](reference/environment.md) for every variable.

Then run:

```bash
npm run supabase:start
npm run supabase:reset
npm run dev
```

Local `supabase:reset` applies `supabase/seed.sql`, which allows any email domain so the team can sign up with any email address. Hosted environments never receive the seed — only school domains work there. To test strict domain checks locally, run:

```sql
delete from public.approved_email_domains where domain = '*';
```

## Demo accounts

`supabase db reset` loads six local demo accounts (one admin, three faculty, and two students), seventeen availability slots, twelve consultations covering every lifecycle state, twelve notifications, and twelve email outbox records:

| Role    | Name                       | Email                                | Password       |
| ------- | -------------------------- | ------------------------------------ | -------------- |
| Admin   | Erwin Curato               | `erwin@acdeducation.com`             | `Password123!` |
| Faculty | Alexandra Mendoza          | `mendoza@acdeducation.com`           | `Password123!` |
| Faculty | Jose Miguel A. Santos      | `jose.santos@acdeducation.com`       | `Password123!` |
| Faculty | Angela Marie L. Villanueva | `angela.villanueva@acdeducation.com` | `Password123!` |
| Student | John Frence Cuevas Bitas   | `bitas@acdeducation.com`             | `Password123!` |
| Student | Bien Panzo                 | `panzo@acdeducation.com`             | `Password123!` |

Jose and Angela are supporting faculty for department filtering and faculty-directory variety. Jose has no future availability, which demonstrates the admin “faculty without future slots” indicator. Mendoza is the primary faculty account for the Bitas and Panzo bookings.

Re-apply just the demo data without rebuilding the database:

```bash
make seed
```

Remove the demo data by rebuilding only the local database from migrations, without applying the seed:

```bash
make reset
```

Both targets pass `--local`, so they never touch a linked or hosted Supabase project. `make reset` also clears any other local development data.

The demo accounts use the approved `acdeducation.com` domain, so they work with or without the local `*` wildcard. Do not add `gmail.com` as an explicit allowed domain: the database tests use Gmail as the rejected-domain example. The seeded admin also means `/auth/claim-admin` reports that an administrator already exists.

## First administrator

1. Add `INITIAL_ADMIN_EMAIL` to `.env.local`.
2. Restart the dev server.
3. Register that address, confirm it through the local mail catcher, then sign in with the app password.
4. Open `/auth/claim-admin` and claim the first admin role.

The claim only succeeds while no approved admin exists. On success the account redirects to `/admin`.

## Faculty onboarding

1. Ask the faculty member to register with their email and an app password, then verify the email.
2. Sign in as an admin and open `/admin/users`.
3. Select **Add Faculty**, enter the registered email, department, and position, then submit.

The existing student account becomes faculty immediately. No invitation or pending faculty record is created. Admins can later correct an approved account's role or department from the same page. See [`concepts/rules.md`](concepts/rules.md) for the full lifecycle.

## Validate

```bash
npm run check
npm run build
npm run supabase:test
npm run test:e2e
```

For a release or a workflow change, run the primary lifecycle pass in [`reference/manual-test-cases.md`](reference/manual-test-cases.md) alongside these automated checks.

`npm run check` runs format, lint, typecheck, and unit tests. End-to-end specs under `e2e/` drive real Chromium against your local Supabase. Landing-page specs run anywhere; the click-to-database specs (`admin-users`, `admin-manage`, `auth-routing`, `consultation-lifecycle`, `faculty-availability`, `password-auth`, `student-booking`) need `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (refresh it with `supabase status -o env`) and skip automatically when it is unavailable. Password specs exercise the real sign-in form; fixtures create users through the Auth Admin API and generate verification tokens where a test must not depend on reading mail. Assertions check both the screen and the database row.

Database-backed browser tests run only against localhost. Their setup and teardown remove accounts and departments reserved with the `e2e-` / `E2E Department` prefixes, so test fixtures do not remain in the development UI. Seeded demo accounts and developer-created records are preserved.

Commit the generated `package-lock.json`; CI uses `npm ci`.

## Optional Docker workflow

Docker Engine 27 or newer with Docker Compose v2.30 or newer is recommended, with at least 4 GB of memory and 10 GB of free disk space. Check occupied ports before startup with `ss -ltn` (Linux) or your platform's equivalent.

```bash
docker compose config
docker compose build
docker compose up -d
```

Compose builds only the Next.js app with `Dockerfile.dev`. Supabase still runs through the Supabase CLI, so start it separately with `npm run supabase:start`. Override a host-port collision with `FRONTEND_HOST_PORT`. The production `Dockerfile` uses the standalone Next.js output and is not needed for local development.
