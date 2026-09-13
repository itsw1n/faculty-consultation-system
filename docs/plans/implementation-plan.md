# Implementation Plan

## Status Legend

- `[ ]` Todo
- `[-]` In progress
- `[x]` Done

## 1. Foundation

- [ ] Initialize Next.js + TypeScript project.
- [ ] Configure environment variables.
- [ ] Install/configure Supabase client.
- [ ] Configure Supabase server utilities.
- [ ] Establish route groups/layouts.
- [ ] Add shared `components/layout` folder.
- [ ] Add shared `components/common` folder.
- [ ] Add global design tokens.
- [ ] Add React Aria where required for accessible interactions.

## 2. Database

- [ ] Create `departments` table.
- [ ] Create `profiles` table.
- [ ] Create `faculty_profiles` table.
- [ ] Create `availability_slots` table.
- [ ] Create `consultations` table.
- [ ] Create `notifications` table.
- [ ] Add enums/check constraints.
- [ ] Add indexes for common filters/search.
- [ ] Add booking integrity constraints.
- [ ] Add RLS policies.
- [ ] Add seed data for development.

## 3. Authentication and Applications

- [ ] Google OAuth login.
- [ ] Auth callback handling.
- [ ] Profile lookup after login.
- [ ] Existing approved user redirect by role.
- [ ] New-user application type screen.
- [ ] Student application form.
- [ ] Faculty application form.
- [ ] Pending approval screen.
- [ ] Rejected application state.
- [ ] Admin application review screen.
- [ ] Single approve/reject actions.
- [ ] Bulk approve/reject actions.

## 4. Shared Layout

- [ ] Responsive desktop sidebar.
- [ ] Mobile hamburger drawer.
- [ ] Breadcrumb header.
- [ ] Notification bell.
- [ ] Notification dropdown.
- [ ] Profile control pinned to bottom of sidebar.
- [ ] Read-only profile modal/panel.
- [ ] Common confirmation dialog.
- [ ] Common status badge.
- [ ] Common search field.
- [ ] Common filters.
- [ ] Common infinite-scroll loading state.
- [ ] Common empty/error states.

## 5. Student

- [ ] Student dashboard.
- [ ] Book Consultation — Choose Faculty.
- [ ] Faculty search with ~300 ms debounce.
- [ ] Department filter.
- [ ] Infinite faculty loading.
- [ ] Book Consultation — Choose Schedule.
- [ ] Weekly desktop calendar.
- [ ] Mobile day-based schedule view.
- [ ] Show `OPEN`, `RESERVED`, `BOOKED`, `CLOSED` state styling.
- [ ] Allow selection of `OPEN` only.
- [ ] Book Consultation — Details.
- [ ] Book Consultation — Review.
- [ ] Atomic booking transaction/RPC.
- [ ] My Consultations.
- [ ] Cancellation flow.
- [ ] Student notifications.

## 6. Faculty

- [ ] Faculty dashboard.
- [ ] My Availability page.
- [ ] Add Availability modal.
- [ ] Availability validation.
- [ ] Slot detail modal.
- [ ] Consultation Requests.
- [ ] Search/filter requests.
- [ ] Approve confirmation.
- [ ] Reject confirmation.
- [ ] My Consultations.
- [ ] Mark consultation completed.
- [ ] Faculty notifications.

## 7. Admin

- [ ] Admin dashboard.
- [ ] Manage Users / Applications.
- [ ] Search with ~300 ms debounce.
- [ ] Role/department/status filters.
- [ ] Cursor-based infinite scrolling.
- [ ] Bulk selection.
- [ ] Bulk approve/reject.
- [ ] Manage Faculty.
- [ ] Departments.
- [ ] Consultation Records.
- [ ] Admin notifications.

## 8. Notifications

- [ ] Create notification helper/service.
- [ ] Trigger on application approval/rejection.
- [ ] Trigger on consultation request.
- [ ] Trigger on consultation approval/rejection.
- [ ] Trigger on cancellation.
- [ ] Trigger on completion where useful.
- [ ] Notification dropdown latest items.
- [ ] View All notifications page.
- [ ] Mark-as-read behavior.
- [ ] Optional Resend email integration.

## 9. Quality

- [ ] Server-side authorization checks.
- [ ] Zod/schema validation for mutations.
- [ ] Concurrency test for double booking.
- [ ] RLS test by role.
- [ ] Mobile responsive test.
- [ ] Keyboard navigation test.
- [ ] Focus management for modals/dialogs.
- [ ] Loading/empty/error-state review.
- [ ] Final Figma-to-implementation consistency review.

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
