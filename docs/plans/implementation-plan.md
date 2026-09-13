# Implementation Plan

## Status Legend

- `[ ]` Todo
- `[-]` In progress
- `[x]` Done

## 1. Foundation

- [x] Initialize Next.js + TypeScript project.
- [x] Configure environment variables.
- [x] Install/configure Supabase client.
- [x] Configure Supabase server utilities.
- [x] Establish route groups/layouts.
- [x] Add shared `components/layout` folder.
- [x] Add shared `components/common` folder.
- [x] Add global design tokens.
- [x] Add React Aria where required for accessible interactions.

## 2. Database

- [x] Create `departments` table.
- [x] Create `profiles` table.
- [x] Create `faculty_profiles` table.
- [x] Create `availability_slots` table.
- [x] Create `consultations` table.
- [x] Create `notifications` table.
- [x] Add enums/check constraints.
- [x] Add indexes for common filters/search.
- [x] Add booking integrity constraints.
- [x] Add RLS policies.
- [x] Add seed data for development.

## 3. Authentication and Applications

- [x] Google OAuth login.
- [x] Auth callback handling.
- [x] Profile lookup after login.
- [x] Existing approved user redirect by role.
- [x] New-user application type screen.
- [x] Student application form.
- [x] Faculty application form.
- [x] Pending approval screen.
- [x] Rejected application state.
- [x] Admin application review screen.
- [x] Single approve/reject actions.
- [x] Bulk approve/reject actions.

## 4. Shared Layout

- [x] Responsive desktop sidebar.
- [x] Mobile hamburger drawer.
- [x] Breadcrumb header.
- [x] Notification bell.
- [x] Notification dropdown.
- [x] Profile control pinned to bottom of sidebar.
- [x] Read-only profile modal/panel.
- [x] Common confirmation dialog.
- [x] Common status badge.
- [x] Common search field.
- [x] Common filters.
- [x] Common infinite-scroll loading state.
- [x] Common empty/error states.

## 5. Student

- [x] Student dashboard.
- [x] Book Consultation — Choose Faculty.
- [x] Faculty search with ~300 ms debounce.
- [x] Department filter.
- [x] Infinite faculty loading.
- [x] Book Consultation — Choose Schedule.
- [x] Weekly desktop calendar.
- [x] Mobile day-based schedule view.
- [x] Show `OPEN`, `RESERVED`, `BOOKED`, `CLOSED` state styling.
- [x] Allow selection of `OPEN` only.
- [x] Book Consultation — Details.
- [x] Book Consultation — Review.
- [x] Atomic booking transaction/RPC.
- [x] My Consultations.
- [x] Cancellation flow.
- [x] Student notifications.

## 6. Faculty

- [x] Faculty dashboard.
- [x] My Availability page.
- [x] Add Availability modal.
- [x] Availability validation.
- [x] Slot detail modal.
- [x] Consultation Requests.
- [x] Search/filter requests.
- [x] Approve confirmation.
- [x] Reject confirmation.
- [x] My Consultations.
- [x] Mark consultation completed.
- [x] Faculty notifications.

## 7. Admin

- [x] Admin dashboard.
- [x] Manage Users / Applications.
- [x] Search with ~300 ms debounce.
- [x] Role/department/status filters.
- [x] Cursor-based infinite scrolling.
- [x] Bulk selection.
- [x] Bulk approve/reject.
- [x] Manage Faculty.
- [x] Departments.
- [x] Consultation Records.
- [x] Admin notifications.

## 8. Notifications

- [x] Create notification helper/service.
- [x] Trigger on application approval/rejection.
- [x] Trigger on consultation request.
- [x] Trigger on consultation approval/rejection.
- [x] Trigger on cancellation.
- [x] Trigger on completion where useful.
- [x] Notification dropdown latest items.
- [x] View All notifications page.
- [x] Mark-as-read behavior.
- [-] Optional Resend email integration — deferred from v1.

## 9. Quality

- [x] Server-side authorization checks.
- [x] Zod/schema validation for mutations.
- [x] Concurrency test for double booking.
- [x] RLS test by role.
- [x] Mobile responsive test.
- [x] Keyboard navigation test.
- [x] Focus management for modals/dialogs.
- [x] Loading/empty/error-state review.
- [x] Final supplied-design-to-implementation consistency review.

## Recommended Build Order

1. Database + RLS.
2. Authentication + role/application state.
3. Shared layout/common components.
4. Admin application approval.
5. Faculty availability.
6. Student booking.
7. Faculty request processing.
8. Consultation history/cancellation/completion.
9. Notifications.
10. Mobile/accessibility/polish.
