# Authentication Flow

1. The user starts Google OAuth from `/`.
2. Supabase redirects to `/auth/callback`, where the server exchanges the authorization code for a cookie-backed session.
3. `/auth/continue` loads the authenticated profile and chooses a destination.
4. The auth-user trigger creates a profile from trusted Google identity data.
5. A verified school email is approved as a student on first sign-in.
6. An invited address is promoted to approved faculty with the invited department and position.
7. Profiles that still carry a `PENDING` or `REJECTED` status are parked at `/application/pending` or `/application/rejected`.
8. Approved users are routed to `/student`, `/faculty`, or `/admin` according to the role stored in `profiles`.
9. The account matching `INITIAL_ADMIN_EMAIL` can claim the first admin role once at `/auth/claim-admin`.
10. Admins invite faculty from `/admin/users` and can correct an approved account's role or department.

The auth-user trigger never trusts the browser for email, role, or account status. School-domain approval uses `approved_email_domains`; local seed data adds a wildcard domain for development only.

Protected layouts and every mutation call `requireRole`; reads shared across roles call `requireApprovedProfile`. Row-level security independently limits table access. Sign-out clears the Supabase session and returns to `/`.

## Account administration

- `invite_faculty` accepts 1–50 school emails, a department, and a position title. The invite is consumed on first sign-in.
- `correct_user_account` changes the role or department of an already-approved account. It cannot target the caller or assign `ADMIN`.
- Legacy application functions remain in the database, but the current Manage Users UI does not expose approve/reject actions.
