# Architecture Overview

Assumption College of Davao is a Next.js 16 App Router application backed by Supabase Auth and PostgreSQL.

## Runtime boundaries

- Route pages and layouts render on the server by default.
- Interactive calendars, dialogs, filters, and infinite lists are client components.
- Server actions validate `FormData`, authenticate the caller, authorize the required role, and delegate persistence to repositories or database RPCs.
- Repositories own Supabase queries. Atomic booking and status transitions live in PostgreSQL functions.
- `src/proxy.ts` refreshes the Supabase session cookie on each non-static request.
- Row-level security remains the final data-access boundary even when application authorization has already run.

## Feature ownership

Application code is organized under `src/features` by domain:

```text
auth
applications
admin
availability
booking
consultations
dashboard
email
notifications
```

Shared layout and accessible controls live under `src/components`.

Pages call repositories directly for initial server-rendered reads. `features/*/queries/*.ts` are `'use server'` loaders used by client components for cursor pagination; they add authorization and Zod validation around a repository read. Pages never call RPCs or table clients directly.

## Reliability and security

Untrusted mutation input is checked with Zod. Availability overlap and double booking are protected by database constraints and transactional RPCs. Browser-visible environment values contain only the project URL, public Supabase key, and canonical site URL.

## Identity and accounts

Google OAuth is the only sign-in path. The auth-user trigger creates profiles and applies the automatic student, invited-faculty, or legacy pending rule. Administrators invite faculty from Manage Users, claim the first admin through `/auth/claim-admin`, and correct approved accounts through RPCs. See `docs/architecture/auth-flow.md`.

## Consultation records and email

Consultation categories, descriptions, and outcomes are participant-only, enforced by RLS and the participant-only detail RPC. Admin listings and CSV reports return metadata and counts.

Status changes enqueue emails in PostgreSQL. The protected scheduled route claims queued items and calls Resend from server-only code. The `00:00 UTC` daily Vercel schedule runs at 08:00 Philippine time. Resend idempotency keys prevent duplicate sends when queue processing retries.
