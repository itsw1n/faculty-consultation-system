# Authentication and Authorization Specification

## 1. Authentication Provider

Use Supabase Auth with Google OAuth.

No application-managed username/password flow is required for v1.

## 2. Google Data

On successful authentication, the application may use available Google identity metadata such as:

- Email.
- Display name.
- Avatar.

Email displayed in onboarding must be read-only and should come from the authenticated identity rather than trusted form input.

## 3. First Login Flow

```text
Google Login
    |
    v
Authenticated Supabase user
    |
    v
Profile/application lookup
    |
    +-- Approved -> Role dashboard
    |
    +-- Pending -> Pending approval screen
    |
    +-- Rejected -> Rejected screen
    |
    +-- No application -> Choose Student or Faculty application
```

## 4. Requested Role vs Assigned Role

Do not treat user's selection as authorization.

New application:

```text
requested_role = STUDENT | FACULTY
role = null
account_status = PENDING
```

After admin approval:

```text
role = requested_role
account_status = APPROVED
```

Admin is never available as a requested role.

## 5. Access Rules

### Pending

May:

- View pending approval state.
- Sign out.

May not:

- Access Student/Faculty/Admin application routes.

### Rejected

May:

- View rejection state.
- Sign out.
- Reapply only if business policy explicitly allows it.

### Approved Student

May access Student routes only.

### Approved Faculty

May access Faculty routes only.

### Admin

May access Admin routes.

## 6. Route Protection

Protect routes on the server, not only through client navigation hiding.

Conceptual route groups:

```text
/student/*
/faculty/*
/admin/*
/notifications
```

A server-side role check should reject unauthorized access even if a user manually enters a URL.

## 7. Session Handling

- Use Supabase-supported server session handling for Next.js.
- Refresh tokens/session according to current Supabase guidance.
- Do not trust role information passed by the browser when authorizing mutations.
- Fetch authorization state from trusted server/session/database context.

## 8. Profile Creation

On first successful Google authentication:

- Ensure an application/profile shell can be associated with `auth.users.id`.
- Store only required school application fields.
- Do not collect School ID in v1.

## 9. Sensitive Role Fields

The following fields are privileged:

- `role`
- `account_status`
- approval/rejection metadata

Normal users must not be able to update these through direct client writes.

## 10. Admin Approval

Single approval:

1. Validate current user is Admin.
2. Validate target is `PENDING`.
3. Assign role from requested role.
4. Set `APPROVED`.
5. Create notification.

Bulk approval/rejection:

- Same authorization and validation rules per selected record.
- Operation should return per-record failures if a subset changed state concurrently.

## 11. Sign Out

Sign out is accessible from profile modal/panel and clears the authenticated session through Supabase Auth.
