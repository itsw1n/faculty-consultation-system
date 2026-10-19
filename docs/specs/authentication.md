# Authentication and Authorization Specification

This document describes the implemented authentication model.

## 1. Provider

Supabase Auth with Google OAuth. There is no application-managed username/password flow.

## 2. Identity data

The auth-user trigger reads trusted identity metadata:

- `id` from `auth.users`.
- `email` from `auth.users`.
- `full_name` from `raw_user_meta_data.full_name`, falling back to the email local part.
- `avatar_url` from `raw_user_meta_data.avatar_url`.

The browser is never trusted for email, role, or account status.

## 3. Sign-in flow

```text
Google OAuth from /
    |
    v
/auth/callback exchanges the code
    |
    v
/auth/continue reads the profile
    |
    +-- PENDING   -> /application/pending
    +-- REJECTED  -> /application/rejected
    +-- STUDENT   -> /student
    +-- FACULTY   -> /faculty
    +-- ADMIN     -> /admin
```

`handle_new_auth_user` inserts a profile on first sign-in. If the email passes `is_approved_email`, the trigger then:

1. Looks for an unconsumed `faculty_invites` row matching the email.
2. If found, sets `role = FACULTY`, `account_status = APPROVED`, applies the invited department, creates the `faculty_profiles` row, and marks the invite consumed.
3. If not found, sets `role = STUDENT` and `account_status = APPROVED`.

Existing `PENDING` or `REJECTED` profiles are not overwritten by the trigger.

## 4. Approved email domains

`approved_email_domains` stores the allowed domains. `is_approved_email` accepts an exact domain match or the local `*` wildcard.

- Migrations set the confirmed school domain to `acdeducation.com`.
- `supabase/seed.sql` adds `*` for local development only.
- Hosted environments receive migrations, not the seed, so only configured school domains work there.
- Tests remove the wildcard row before asserting strict domain checks.

## 5. Faculty invitations

Admins call `invite_faculty` from `/admin/users` with:

- 1 to 50 email addresses.
- A department.
- A position title.

The function:

- Requires `is_admin()`.
- Rejects emails outside approved domains.
- Skips emails that already belong to approved faculty.
- Inserts or refreshes the `faculty_invites` row and clears `consumed_at`.
- Returns a per-email result with `invited` and an optional `reason`.

The invite only takes effect the first time that email signs in.

## 6. First administrator

The account whose profile email matches `INITIAL_ADMIN_EMAIL` may open `/auth/claim-admin` and call `claim_first_admin`.

- Authentication is required.
- An advisory lock serializes concurrent claims.
- The claim fails if any approved admin already exists.
- The supplied email must match the caller's profile email.
- The caller must use an approved school email.
- On success the profile becomes `ADMIN / APPROVED`.

## 7. Account correction

Admins call `correct_user_account` for an approved account:

- Cannot target the caller.
- Cannot assign `ADMIN`.
- Requires an existing department.
- Requires the target to already be `APPROVED`.
- Creates, updates, or removes `faculty_profiles` according to the new role.

This is the supported way to fix a misclassified account. Users cannot change their own role or department.

## 8. Legacy application states

The database still contains `submit_application` and `review_application` from the pre-auto-approval model. The current UI does not expose an approve/reject action in Manage Users, so legacy `PENDING` accounts remain visible but are not actioned there. `REJECTED` accounts see `/application/rejected`.

## 9. Route protection

- `src/proxy.ts` refreshes the Supabase session cookies for every non-static request.
- `RoleLayout` calls `requireRole` for `/student`, `/faculty`, and `/admin`.
- `requireRole` redirects unauthenticated users to `/` and mismatched roles to `/auth/continue`.
- Shared reads use `requireApprovedProfile`.
- Every server action validates input and re-checks authorization.
- RLS independently limits table access.

## 10. Session handling

- Server components use the cookie-backed Supabase server client.
- The proxy refreshes claims on each request.
- Browser-passed role data is never used for authorization.
- Sign-out clears the Supabase session and redirects to `/`.

## 11. Privileged fields

These fields are privileged and are not writable by normal users:

- `profiles.role`
- `profiles.account_status`
- `profiles.requested_role`
- `profiles.department_id`
- approval, correction, and invite metadata

Only security-definer RPCs and the auth-user trigger change them.
