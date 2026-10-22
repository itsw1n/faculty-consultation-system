# Architecture

Next.js 16 App Router front end backed by Supabase Auth and PostgreSQL. Product behavior is in [`product.md`](product.md); exact rules are in [`rules.md`](rules.md); schema detail is in [`data-model.md`](data-model.md).

## Runtime boundaries

- Route pages and layouts render on the server by default; interactive calendars, dialogs, filters, and infinite lists are client components.
- Server actions validate `FormData`, authenticate, authorize the required role, and delegate persistence to repositories or database RPCs.
- Repositories own Supabase queries. Atomic booking and status transitions live in PostgreSQL functions.
- `src/proxy.ts` refreshes the Supabase session cookie on each non-static request.
- Row-level security is the final data-access boundary even after application authorization runs.

## Layers

```text
page / layout / route handler
        |
        v
server action or 'use server' query loader
        |
        v
feature repository
        |
        v
Supabase table or RPC
```

Pages call repositories directly for initial server-rendered reads. `features/*/queries/*.ts` are `'use server'` loaders used by client components for cursor pagination; they add authorization and Zod validation around a repository read. Pages never call RPCs or table clients directly.

## Feature ownership

```text
src/features/auth          sign-in, sign-out, first-admin claim, profile guards
src/features/applications  account page, faculty promotion, corrections
src/features/admin         departments, faculty records
src/features/availability  faculty availability actions and reads
src/features/booking       faculty directory, slots, booking action
src/features/consultations lifecycle actions, lists, detail, CSV
src/features/dashboard     role-specific dashboard counts
src/features/email         outbox claim and Resend delivery
src/features/notifications in-app notifications and read state
```

Shared code lives in `src/lib` (`env.ts`, `actionState.ts`, `useInfinitePage.ts`, `supabase/server.ts`). Shared UI lives in `src/components`.

## Authentication model

Supabase Auth with email + password and mandatory email verification. Sign-up and password recovery email links are verified by `/auth/confirm`, which exchanges the token hash for a cookie-backed session. Supabase stores only the bcrypt hash in `auth.users.encrypted_password`; the application never sees or stores plaintext passwords. The auth-user trigger `handle_new_auth_user` builds a profile from trusted metadata (`id`, `email`, `full_name` falling back to the email local part, `avatar_url`). The browser is never trusted for email, role, or account status. The sign-in routing and account rules are in [`rules.md`](rules.md#sign-in-routing).

## Authorization

- `getAuthenticatedProfile()` reads claims and the profile row.
- `requireRole(role)` redirects unauthenticated users to `/`, and wrong-role or wrong-status users to `/auth/continue`.
- `requireApprovedProfile()` throws without an approved profile and guards shared reads.
- `RoleLayout` wraps `/student`, `/faculty`, and `/admin` with `requireRole`.
- Every server action calls one of these helpers before touching data.

## Reliability and security

- Untrusted mutation input is validated with Zod at the server boundary.
- Availability overlap and double booking are protected by database constraints and transactional RPCs, not application checks alone.
- Privileged fields (`role`, `account_status`, `requested_role`, `department_id`, invite and approval metadata) change only through security-definer RPCs and the auth-user trigger.
- Browser-visible environment values contain only the project URL, public Supabase key, and canonical site URL. See [`reference/environment.md`](../reference/environment.md).
- Database and provider errors stay server-side; see [`reference/api.md`](../reference/api.md).

## Email pipeline

1. Lifecycle RPCs enqueue rows in the private `email_outbox`; status notifications and next-day reminders are separate event types.
2. The protected `GET /api/cron/email` route (bearer `CRON_SECRET`) queues reminders and calls `deliverEmails`.
3. The processor claims up to 25 outbox records with `FOR UPDATE SKIP LOCKED` and a 10-minute lease, sends each through Resend using the record ID as an idempotency key, then marks it sent.
4. Resend idempotency keys prevent duplicate sends when processing retries.

The `00:00 UTC` daily Vercel schedule runs the route at 08:00 Philippine time. Deployment details are in [`operations.md`](../operations.md).
