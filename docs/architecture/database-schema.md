# Database Schema

## Core tables

| Table | Purpose | Key relationships |
|---|---|---|
| `departments` | School department codes and names | Referenced by profiles |
| `profiles` | Identity, application status, requested and approved role | One-to-one with `auth.users`; belongs to a department |
| `faculty_profiles` | Faculty-specific title and metadata | One-to-one with an approved faculty profile |
| `availability_slots` | Dated faculty time slots, mode, location, and state | Belongs to faculty |
| `consultations` | Student request, purpose, details, lifecycle state | Belongs to student, faculty, and an availability slot |
| `notifications` | Per-user in-app event messages and read state | Belongs to a profile |

Enums define user role, account status, availability status, consultation status, and consultation mode. Foreign keys preserve ownership. Check constraints enforce valid time ranges and role-dependent fields. Indexes support status, department, date, recipient, and cursor queries.

PostgreSQL exclusion/unique constraints and atomic RPCs prevent overlapping availability and double booking. RLS policies separate student, faculty, and admin visibility. See `supabase/migrations/` for the executable schema and `supabase/tests/` for role and concurrency coverage.
