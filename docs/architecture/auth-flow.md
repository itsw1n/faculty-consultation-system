# Authentication Flow

1. The user starts Google OAuth from `/`.
2. Supabase redirects to `/auth/callback`, where the server exchanges the authorization code for a cookie-backed session.
3. `/auth/continue` loads the authenticated profile and chooses a destination.
4. A verified school email is approved as a student on first sign-in, and an invited address is promoted to approved faculty. Profiles that still carry a `PENDING` or `REJECTED` status are parked at `/application/pending` or `/application/rejected`.
5. Approved users are routed to `/student`, `/faculty`, or `/admin` according to the role stored in `profiles`.

The auth-user trigger creates the profile from trusted identity metadata and never trusts the browser for email, role, or account status. School addresses are approved automatically, and invited addresses become faculty with their department.

Protected layouts and every mutation call `requireRole`; reads shared across roles call `requireApprovedProfile`. Row-level security independently limits table access. Sign-out clears the Supabase session and returns to `/`.
