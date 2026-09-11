# Faculty Consultation & Scheduling System — Project Plan

## 1. Project Summary

The Faculty Consultation & Scheduling System is a school-focused web application for students, faculty, and administrators.

The system allows students to request consultation schedules, faculty to manage availability and consultation requests, and administrators to manage user applications, faculty records, departments, and consultation records.

## 2. Primary Goals

1. Make faculty consultation scheduling easier for students.
2. Prevent double-booking through controlled availability-slot states.
3. Give faculty control over their own availability and consultation requests.
4. Give administrators control over account approval and role assignment.
5. Keep the UI consistent, responsive, accessible, and easy to maintain.

## 3. Users

- Student
- Faculty
- Admin

## 4. Core Scope

### Authentication and onboarding
- Google OAuth login through Supabase Auth.
- Existing approved users go directly to their role dashboard.
- New users choose whether to apply as Student or Faculty.
- Google-provided name/email are prefilled and email is read-only.
- New applications start as `PENDING`.
- Admin approves or rejects applications.
- Final role is assigned only after approval.
- Admin role is assigned manually and is never self-selected.

### Student
- Dashboard.
- Book Consultation.
- Search/filter faculty.
- View faculty weekly availability.
- Select only `OPEN` slots.
- View `RESERVED` and `BOOKED` slots as disabled.
- Enter consultation details.
- Review before submission.
- View own consultations.
- Cancel eligible consultations.
- View notifications.

### Faculty
- Dashboard.
- Manage weekly availability.
- Add availability through a modal.
- View consultation requests.
- Approve/reject requests.
- View approved/completed consultations.
- Mark approved consultations as completed.
- View notifications.

### Admin
- Dashboard.
- Review user applications.
- Search/filter user applications.
- Bulk approve/reject applications.
- Manage faculty records.
- Manage departments.
- View consultation records.
- Search/filter large datasets.
- View notifications.

## 5. Out of Scope for Initial Version

- Direct messaging/chat.
- Complex analytics/reporting.
- Dark mode.
- Automatic verification against private school records.
- School ID integration.
- Full calendar-provider synchronization.
- Student/faculty self-assignment of privileged roles.
- Advanced rescheduling workflow.

## 6. Technical Direction

- Frontend: Next.js + React + TypeScript.
- Authentication/Data: Supabase.
- Database: PostgreSQL via Supabase.
- UI behavior: React Aria for accessible interactive components where appropriate.
- Notifications: in-app notifications; Resend can be used for email notifications.
- Styling: shared design tokens and reusable components.

## 7. Architecture Priorities

1. Correct auth and role boundaries.
2. Booking consistency and prevention of double-booking.
3. Database constraints and RLS.
4. Shared UI patterns.
5. Mobile-first responsive behavior.
6. Search/filter/infinite-scroll behavior.
7. Notifications and secondary polish.

## 8. Delivery Phases

### Phase 1 — Foundation
- Project setup.
- Environment configuration.
- Supabase connection.
- Database schema.
- Authentication.
- RLS policies.
- Shared layout/common components.

### Phase 2 — Account Applications
- First-login flow.
- Student application.
- Faculty application.
- Pending/rejected state.
- Admin approval queue.
- Bulk approval/rejection.

### Phase 3 — Student Booking
- Faculty discovery.
- Search/filter.
- Weekly availability view.
- Booking steps.
- Consultation creation.
- Student consultation list.

### Phase 4 — Faculty Workflow
- Availability management.
- Add availability modal.
- Consultation request review.
- Approve/reject logic.
- Consultation completion.

### Phase 5 — Admin Management
- Manage users.
- Manage faculty.
- Departments.
- Consultation records.
- Infinite scrolling.

### Phase 6 — Notifications and Polish
- Notification dropdown.
- Notifications page.
- Confirmation dialogs.
- Loading/empty/error states.
- Mobile refinements.
- Accessibility review.

## 9. Documentation Links

- [Implementation Plan](./implementation-plan.md)
- [Product Requirements](../specs/product-requirements.md)
- [Business Rules](../specs/business-rules.md)
- [Frontend Specification](../specs/frontend.md)
- [Backend Specification](../specs/backend.md)
- [Database Specification](../specs/database.md)
- [Authentication Specification](../specs/authentication.md)
- [Design Palette](../design/pallete.md)
