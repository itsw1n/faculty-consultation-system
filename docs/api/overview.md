# API Overview

Assumption College of Davao primarily uses authenticated Next.js server actions and Supabase PostgreSQL RPCs rather than a public REST API.

## HTTP endpoint

`GET /api/health` returns `{ "status": "ok" }`.

Authentication and authorization behavior is documented in `docs/architecture/auth-flow.md`. The implemented HTTP routes and internal action boundary are summarized in `docs/api/endpoints.md`.
