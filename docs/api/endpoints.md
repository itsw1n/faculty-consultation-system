# Application Interfaces

## HTTP routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Returns application readiness information |
| `GET` | `/auth/callback` | Exchanges the Supabase OAuth code and redirects into the account flow |

## Server actions

Mutations are implemented as Next.js server actions rather than public REST endpoints. They cover sign-in/sign-out, application submission and review, department management, availability creation, consultation booking and lifecycle changes, and notification read state.

Each action validates input and performs role authorization. Booking, consultation decisions, cancellation, completion, and bulk application review delegate to transactional PostgreSQL functions where consistency spans multiple rows.

## Cursor loaders

Authenticated server functions load additional faculty, applications, consultations, and notifications using stable `(timestamp, id)` cursors. They are internal application interfaces and are not public HTTP APIs.
