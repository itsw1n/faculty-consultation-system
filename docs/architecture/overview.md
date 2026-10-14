# Architecture Overview

Assumption College of Davao is a Next.js 16 App Router application backed by Supabase Auth and PostgreSQL.

## Runtime boundaries

- Route pages and layouts render on the server by default.
- Interactive calendars, drawers, dialogs, filters, and infinite lists are client components.
- Server actions validate `FormData`, authenticate the caller, authorize the required role, and delegate persistence to repositories or database RPCs.
- Repositories own Supabase queries. Atomic booking and status transitions live in PostgreSQL functions.
- Row-level security remains the final data-access boundary even when application authorization has already run.

## Feature ownership

Application code is organized under `src/features` by domain: auth, applications, availability, booking, consultations, dashboard, notifications, and admin. Shared layout and accessible controls live under `src/components`.

Repositories named `list*`/`get*` are the query layer for thin reads — pages call them directly. Add a `queries/` module only when a read gains policy (merging sources, extra permission logic). Pages never call RPCs or table clients directly.

## Reliability and security

Untrusted mutation input is checked with Zod. Availability overlap and double booking are protected by database constraints and transactional RPCs. Browser-visible environment values contain only the project URL, public Supabase key, and canonical site URL.

## Consultation records and email

Consultation descriptions and outcomes are read only by the student and assigned faculty, enforced by RLS and participant-only detail RPCs. Admin listings and CSV reports return metadata and counts. Status changes enqueue emails in PostgreSQL; the protected scheduled route claims queued items and calls Resend from server-only code. The 00:00 UTC daily Vercel schedule runs at 08:00 Philippine time. Resend idempotency keys prevent duplicate sends when queue processing retries.
