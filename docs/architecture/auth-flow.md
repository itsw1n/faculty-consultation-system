# Authentication Flow

1. The user starts Google OAuth from `/`.
2. Supabase redirects to `/auth/callback`, where the server exchanges the authorization code for a cookie-backed session.
3. `/auth/continue` loads the authenticated profile and chooses a destination.
4. Users without a submitted application go to `/apply`; pending and rejected users go to their status pages.
5. Approved users are routed to `/student`, `/faculty`, or `/admin` according to the role stored in `profiles`.

The auth-user trigger creates a pending profile from trusted identity metadata. Application submission accepts the requested role and department but never accepts email or approved role from the browser. Admin approval is a separate operation.

Protected layouts and every mutation call `requireRole`. Row-level security independently limits table access. Sign-out clears the Supabase session and returns to `/`.
