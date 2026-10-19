# Database Schema

## Core tables

| Table                    | Purpose                                                | Key relationships                                     |
| ------------------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| `departments`            | School department codes and names                      | Referenced by profiles and invites                    |
| `profiles`               | Identity, account status, requested and approved role  | One-to-one with `auth.users`; belongs to a department |
| `faculty_profiles`       | Faculty-specific title and metadata                    | One-to-one with an approved faculty profile           |
| `availability_slots`     | Dated faculty time slots, mode, location, and state    | Belongs to faculty                                    |
| `consultations`          | Student request, category, details, outcome, lifecycle | Belongs to student, faculty, and an availability slot |
| `notifications`          | Per-user in-app event messages and read state          | Belongs to a profile                                  |
| `approved_email_domains` | Domains allowed to auto-approve student accounts       | Read by `is_approved_email`                           |
| `faculty_invites`        | Pending faculty invitations by school email            | Belongs to a department; created by an admin          |
| `email_outbox`           | Private status-email and reminder queue                | Belongs to a consultation and recipient               |

Enums define user role, account status, availability status, consultation status, and consultation mode. Foreign keys preserve ownership. Check constraints enforce valid time ranges, mode-specific fields, category values, and role-dependent fields. Indexes support status, department, date, recipient, and cursor queries.

PostgreSQL exclusion/unique constraints and atomic RPCs prevent overlapping availability and double booking. A partial unique index allows one active consultation per slot while preserving history. RLS policies separate student, faculty, and admin visibility; availability and account lifecycle writes go through security-definer RPCs. See `supabase/migrations/` for the executable schema and `supabase/tests/` for role and concurrency coverage.

## Email and identity support tables

- `approved_email_domains` has no grants to `anon` or `authenticated`; `is_approved_email` is security definer.
- `faculty_invites` has RLS enabled and no direct grants; invitations use `invite_faculty`.
- `email_outbox` has RLS enabled and no direct grants; queue functions are granted only to `service_role`.

## Deprecated objects

Migration history is append-only, so these superseded objects stay in the schema but must not be used by new code: the `examples` scaffold table, the `list_faculty` and `list_open_faculty_slots` RPCs, `review_applications`, `complete_consultation` (revoked; use `complete_consultation_with_outcome`), and the legacy `submit_application`/`review_application` path.
