# Architecture Overview

CampusConnect is a Next.js 16 App Router application backed by Supabase Auth and PostgreSQL.

## Runtime boundaries

- Route pages and layouts render on the server by default.
- Interactive calendars, drawers, dialogs, filters, and infinite lists are client components.
- Server actions validate `FormData`, authenticate the caller, authorize the required role, and delegate persistence to repositories or database RPCs.
- Repositories own Supabase queries. Atomic booking and status transitions live in PostgreSQL functions.
- Row-level security remains the final data-access boundary even when application authorization has already run.

## Feature ownership

Application code is organized under `src/features` by domain: auth, applications, availability, booking, consultations, dashboard, notifications, and admin. Shared layout and accessible controls live under `src/components`.

## Reliability and security

Untrusted mutation input is checked with Zod. Availability overlap and double booking are protected by database constraints and transactional RPCs. Browser-visible environment values contain only the project URL, public Supabase key, and canonical site URL.
