# Frontend Specification

## 1. Frontend Principles

- Mobile-first.
- Light mode only for v1.
- Consistent shared layout across Student, Faculty, and Admin.
- Accessible interactions using React Aria where appropriate.
- Avoid page-specific duplicated UI when a shared component can handle the behavior.

## 2. Component Folder Rule

Only two shared component groups:

```text
components/
├── layout/
└── common/
```

### `components/layout`
Structural application components only.

Examples:
- `AppShell`
- `Sidebar`
- `MobileSidebarDrawer`
- `Header`
- `Breadcrumbs`

### `components/common`
Reusable controls and patterns.

Examples:
- `Button`
- `Input`
- `SearchField`
- `Select`
- `ComboBox`
- `Checkbox`
- `Dialog`
- `ConfirmDialog`
- `StatusBadge`
- `Table`
- `FilterBar`
- `FilterDrawer`
- `InfiniteList`
- `EmptyState`
- `LoadingState`
- `NotificationDropdown`
- `ProfilePanel`

Do not create extra generic folders such as `ui/` or `shared/` unless the project rules are formally changed.

## 3. Global Layout

### Desktop

- Left sidebar.
- Top header in main content area.
- Breadcrumb/page context on left.
- Notification bell on right.
- Profile control pinned to bottom of sidebar.

### Mobile

- Sidebar hidden by default.
- Hamburger button opens navigation drawer.
- Header retains page title/breadcrumb context and notification bell.

## 4. Navigation

### Student
- Dashboard
- Book Consultation
- My Consultations

Profile is pinned separately at sidebar bottom.

### Faculty
- Dashboard
- My Availability
- Consultation Requests
- My Consultations

Profile is pinned separately at sidebar bottom.

### Admin
- Dashboard
- Manage Users
- Manage Faculty
- Departments
- Consultation Records

Profile is pinned separately at sidebar bottom.

## 5. Breadcrumb Rules

Use breadcrumbs only when hierarchy is useful.

Examples:

```text
Book Consultation / Schedule
Manage Users / Application Details
```

Avoid redundant patterns such as `Home / Dashboard`.

## 6. Notifications UI

### Bell dropdown
- Shows unread indicator.
- Opens recent notifications.
- Shows small number of latest items.
- Provides `View all notifications` action.

### Notifications page
- Infinite-scroll if dataset grows.
- Unread/read styling.
- Optional mark-as-read actions.

## 7. Profile UI

- Open from profile control at bottom of sidebar.
- Use modal/panel in v1.
- Read-only school profile.
- Show name, email, role, department, and role-specific fields.
- Include sign out.

## 8. Search and Filter Pattern

All searchable collection pages should follow one consistent pattern.

### Desktop

```text
Title
Description

[ Search................................ ] [Filter] [Filter] [Clear]

Content

Infinite loading state
```

### Mobile

```text
[ Search......................... ]
[ Filters (n) ]
```

`Filters` opens a bottom sheet/drawer.

### Search behavior
- ~300 ms debounce for server-backed text search.
- Do not debounce deliberate select changes.
- Search change resets loaded collection and cursor.

## 9. Infinite Scroll Pattern

UI has no visible page numbers.

State should conceptually include:

```text
items
nextCursor
hasMore
isLoading
search
filters
sort
```

Initial recommended chunk: 20.

States:
- Initial loading.
- Loaded.
- Loading more.
- Empty.
- No search results.
- Error.
- End of results.

## 10. Student Screens

### Dashboard
- Greeting/context.
- Upcoming consultation.
- Recent consultations.
- Quick action: Book Consultation.
- Small status summary cards.

### Book Consultation — Faculty
- Department select/filter.
- Search field.
- Faculty result cards/list.
- Infinite scrolling.

### Book Consultation — Schedule
Desktop:
- Weekly calendar grid.
- Week previous/next controls.
- Today action.
- Faculty summary.
- Legend.

Mobile:
- Horizontal/compact day selector.
- Vertical slot list for selected day.

Slot states:
- Open: selectable.
- Reserved: disabled.
- Booked: disabled.
- Closed: muted/disabled.

### Book Consultation — Details
- Purpose/subject.
- Description.
- Optional related course if included.
- Display consultation mode/location.

### Book Consultation — Review
- Full booking summary.
- Back.
- Confirm booking.

### My Consultations
- Search/filter where useful.
- Status badges.
- Contextual actions only.

## 11. Faculty Screens

### Dashboard
- Upcoming consultations.
- Pending requests.
- Availability summary.
- Add Availability quick action.

### My Availability
- Weekly calendar.
- Status legend.
- Add Availability modal.
- Slot detail modal when clicking existing slot.

### Add Availability Modal
Fields:
- Date.
- Start time.
- End time.
- Mode.
- Location or meeting link depending on mode.

### Consultation Requests
- Search/filter.
- Infinite scrolling.
- Approve/reject.
- Confirmation dialogs.

### My Consultations
- Approved/upcoming.
- Completed.
- Mark completed where eligible.

## 12. Admin Screens

### Dashboard
- Pending applications.
- Approved user/faculty counts.
- Recent activity.

### Manage Users
- Search.
- Role filter.
- Department filter.
- Status filter.
- Infinite scrolling.
- Checkbox selection.
- Bulk approve/reject.

### Manage Faculty
- Search/filter.
- Faculty records.
- Infinite scrolling.

### Departments
- Department cards/table.
- Add/edit only if included in implementation.

### Consultation Records
- Search/filter.
- Infinite scrolling.
- Read-only by default.

## 13. Confirmation Rules

Use shared confirmation dialog for actions such as:
- Student cancellation.
- Faculty approve/reject.
- Admin bulk approve/reject.

Dialogs must manage focus correctly and be keyboard accessible.
