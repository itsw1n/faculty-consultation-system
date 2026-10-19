# Frontend Specification

This document describes the implemented Next.js App Router frontend.

## 1. Principles

- Mobile-first layout.
- Light mode only in v1.
- Server Components by default; `'use client'` only for interaction.
- React Aria Components for accessible select, modal, and dialog behavior.
- One shared layout across student, faculty, and admin workspaces.
- Shared controls live under `src/components`; domain UI lives under `src/features`.

## 2. Application tree

```text
src/app
├── page.tsx                       public landing and Google sign-in
├── layout.tsx                     root metadata and global styles
├── error.tsx
├── loading.tsx
├── not-found.tsx
├── api/
│   ├── health/route.ts
│   ├── cron/email/route.ts
│   └── faculty/[facultyId]/availability/route.ts
├── auth/
│   ├── callback/route.ts
│   ├── claim-admin/page.tsx
│   └── continue/page.tsx
├── application/
│   ├── pending/page.tsx
│   └── rejected/page.tsx
├── student/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── book/page.tsx
│   ├── book/[facultyId]/page.tsx
│   ├── consultations/page.tsx
│   └── consultations/[id]/page.tsx
├── faculty/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── availability/page.tsx
│   ├── requests/page.tsx
│   ├── consultations/page.tsx
│   └── consultations/[id]/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── users/page.tsx
│   ├── faculty/page.tsx
│   ├── departments/page.tsx
│   ├── consultations/page.tsx
│   └── consultations/export/route.ts
└── notifications/page.tsx
```

## 3. Shared components

### Layout

```text
src/components/layout/AppShell.tsx
src/components/layout/Breadcrumbs.tsx
src/components/layout/Container.tsx
src/components/layout/Navigation.tsx
src/components/layout/RoleLayout.tsx
src/components/layout/Section.tsx
```

- `RoleLayout` calls `requireRole` and renders `AppShell`.
- `AppShell` owns the desktop sidebar, mobile navigation panel, breadcrumb header, notification details dropdown, profile details, and sign out.
- `Navigation` renders role-specific links and marks the active route.
- `Breadcrumbs` derives labels from the current path.

### Common

```text
src/components/common/AlertDialog.tsx
src/components/common/EmptyState.tsx
src/components/common/InfiniteListMarker.tsx
src/components/common/PageHeading.tsx
src/components/common/SearchInput.tsx
src/components/common/StatusBadge.tsx
src/components/common/SubmitButton.tsx
src/components/common/button/Button.tsx
src/components/common/modal/Modal.tsx
src/components/common/select/Select.tsx
```

Small primitives may use a subfolder under `common` (`button`, `modal`, `select`). Do not introduce unrelated generic folders such as `ui/` or `shared/`.

## 4. Feature tree

Each feature owns its components, queries, repositories, schemas, services, and types as needed:

```text
src/features/auth
src/features/applications
src/features/admin
src/features/availability
src/features/booking
src/features/consultations
src/features/dashboard
src/features/email
src/features/notifications
```

Rules:

- Pages render feature components and call repositories for initial data.
- Client components call `features/*/queries/*.ts` for additional pages.
- Mutations call server actions.
- Domain-only components stay inside their feature.

## 5. Workspace navigation

### Student

- Dashboard
- Book Consultation
- My Consultations

### Faculty

- Dashboard
- My Availability
- Consultation Requests
- My Consultations

### Admin

- Dashboard
- Manage Users
- Manage Faculty
- Departments
- Consultation Records

The profile details panel is pinned to the bottom of the desktop sidebar. Notifications open from the header bell.

## 6. Student screens

### Dashboard

- Upcoming and pending counts.
- Five most recent consultations.
- Book consultation action.

### Book consultation — faculty

- Server-rendered first page of faculty.
- Search input and department select.
- Infinite scrolling with cursor reset on search or filter change.

### Book consultation — schedule/details/review

- Three-step client wizard.
- Weekly desktop grid, mobile day tabs.
- `OPEN` slots are selectable; other states are disabled.
- Refresh action fetches `/api/faculty/[facultyId]/availability`.
- Purpose select and optional 2,000-character description.
- Review screen and atomic submit.

### My consultations

- Search and status filter.
- Cursor-based infinite scrolling.
- Status badge, detail link, and cancellation dialog for `PENDING` or `APPROVED`.
- Detail page shows category, description, schedule, mode, and outcome when completed.

## 7. Faculty screens

### Dashboard

- Pending requests, confirmed consultations, and open availability counts.
- Add availability action.

### My availability

- Upcoming slots list.
- Add availability modal.
- Edit and remove actions only for `OPEN` slots.
- Slot details modal.
- Mode-specific fields: location for `IN_PERSON`, meeting link for `ONLINE`.

### Consultation requests

- Pending requests only.
- Search and infinite scrolling.
- Approve and reject confirmation dialogs.

### My consultations

- Confirmed and completed consultations.
- Search and status filter.
- Detail page with completion form and optional outcome.

## 8. Admin screens

### Dashboard

- Pending application, approved faculty, and consultation counts.

### Manage users

- Search and status/role/department filters.
- Infinite scrolling.
- Faculty invite form with a department and position.
- Account correction modal for approved accounts.
- Legacy pending accounts are visible without an approve/reject action.

### Manage faculty

- Search field.
- Read-only faculty list with department, position, and status.

### Departments

- Add form.
- Editable cards for existing departments.

### Consultation records

- Read-only consultation directory with search and status filter.
- CSV date-range form.
- Admin rows omit participant-only descriptions.

## 9. Notifications

- Header bell lists the five latest notifications and an unread count.
- `/notifications` shows the full paginated list.
- `Mark all as read` is shown when unread items exist.
- Notification detail actions use server actions and RLS.

## 10. Search and pagination

- Text search debounces for 300 ms.
- Select changes apply immediately.
- A new search or filter resets the cursor and loaded items.
- `useInfinitePage` owns the loaded page, pending state, and marker ref.
- `InfiniteListMarker` triggers the next request and shows the end state.

## 11. Forms and dialogs

- Server actions receive `FormData`.
- Client mutation forms use `useActionState` and display a safe error message.
- `AlertDialog` handles confirmations.
- `Modal` handles add, edit, details, and correction panels.
- Dialogs trap and restore focus.
- `SubmitButton` shows a pending label while the action runs.

## 12. Styling

- Tailwind CSS 4 with tokens declared in `src/app/globals.css`.
- Use semantic token classes such as `bg-surface`, `text-muted`, `border-border`, `text-primary`, and `bg-accent`.
- Shared controls use consistent heights, radii, and focus rings.
- Status is conveyed with text as well as color.

## 13. Accessibility

- Semantic landmarks and headings.
- Keyboard access for navigation, calendars, dialogs, and forms.
- Visible focus styles.
- `aria-current` for active navigation and booking steps.
- Disabled slot states use native disabled behavior.
- Error messages use `role="alert"`.
- Tables and card lists preserve readable order on narrow screens.
