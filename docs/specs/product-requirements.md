# Product Requirements

## 1. Product Name

Faculty Consultation & Scheduling System

## 2. User Roles

### Student
A verified/approved student who can discover faculty and request consultations.

### Faculty
A verified/approved faculty member who can manage availability and consultation requests.

### Admin
A privileged system user who approves applications and manages system records.

## 3. Authentication Journey

### Returning approved user

1. User signs in with Google.
2. System obtains authenticated identity from Supabase Auth.
3. System checks application/profile status.
4. If `APPROVED`, user is redirected to the dashboard for the assigned role.

### New user

1. User signs in with Google.
2. System detects no approved profile/application.
3. User selects:
   - Apply as Student
   - Apply as Faculty
4. Google name/email are prefilled.
5. Email is read-only.
6. User completes role-specific details.
7. Application is submitted with `PENDING` status.
8. Admin approves or rejects.
9. Role is assigned only upon approval.

## 4. Student Requirements

### Dashboard
Must show a concise overview such as:
- Upcoming consultation.
- Recent consultations.
- Quick action to Book Consultation.
- Relevant counts/status summaries.

### Book Consultation
Flow:

1. Choose Faculty.
2. Choose Schedule.
3. Enter Details.
4. Review and Confirm.

#### Choose Faculty
- Search by faculty name.
- Filter by department.
- Student's department may be the default filter.
- Other departments may remain selectable.
- Results load in chunks, not all at once.

#### Choose Schedule
- Weekly calendar on desktop.
- Day-based schedule list on narrow mobile screens.
- `OPEN`: visible and selectable.
- `RESERVED`: visible and disabled.
- `BOOKED`: visible and disabled.
- `CLOSED`: visible only when useful; disabled/muted.

#### Details
At minimum:
- Purpose/subject.
- Description/details.
- Optional related course if included in implementation.
- Consultation mode/location is displayed from faculty availability.

#### Review
Must display:
- Faculty.
- Date/time.
- Purpose.
- Consultation mode/location.
- Confirmation action.

### My Consultations
- Search/filter own consultations when necessary.
- Show statuses.
- Allow cancellation only when business rules permit.

## 5. Faculty Requirements

### Dashboard
Must show:
- Upcoming consultations.
- Pending consultation requests.
- Availability summary.
- Quick action to add availability.

### My Availability
- Weekly calendar.
- Add Availability button.
- Add Availability modal with date, start time, end time, and mode/location fields.
- Cannot create overlapping availability for the same faculty.
- Reserved/booked slots cannot be deleted as ordinary open availability.

### Consultation Requests
- Show pending and historical requests.
- Search/filter.
- Approve.
- Reject.
- Confirmation dialog before state-changing action.

### My Consultations
- Upcoming/approved consultations.
- Completed consultations.
- Mark eligible approved consultations completed.

## 6. Admin Requirements

### Dashboard
Must show useful operational summaries such as:
- Pending applications.
- Approved users/faculty count.
- Recent consultation activity.

### Manage Users / Applications
- Search name/email.
- Filter role/application type.
- Filter department.
- Filter status.
- Infinite scrolling.
- Row selection.
- Bulk approve/reject.
- Single approve/reject.

### Manage Faculty
- Search/filter faculty records.
- View faculty department and profile information.
- Perform only business-approved management actions.

### Departments
- List departments.
- Add/update department records if enabled.

Initial known departments include:
- IT
- HM
- BSBA
- BSED
- BSSW

### Consultation Records
- Read-only administrative visibility by default.
- Search/filter.
- Infinite scrolling.
- No bulk deletion of consultation history.

## 7. Notifications

### Dropdown
- Bell is shown in top-right header.
- Clicking bell opens recent notifications.
- Show latest limited set (for example 5).
- `View all notifications` routes to full notifications page.

### Important notification events

Student:
- Application approved/rejected.
- Consultation approved/rejected.
- Consultation cancelled/changed when applicable.

Faculty:
- New consultation request.
- Student cancellation.

Admin:
- New Student/Faculty application.

## 8. Profile

- Profile entry is pinned to bottom of sidebar.
- Profile is read-only in v1.
- Prefer modal/panel instead of dedicated page.
- Approved role/department are not user-editable.
- Sign out is available from profile UI.

## 9. Responsive Requirements

- Mobile-first design.
- Light theme only for v1.
- Sidebar becomes hamburger drawer on mobile.
- Tables may transform into stacked cards on narrow screens.
- Complex filter bars become a filter drawer/bottom sheet on mobile.
- Calendar becomes a day-focused list when weekly grid is too narrow.
