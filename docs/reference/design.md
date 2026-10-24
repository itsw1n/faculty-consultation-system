# Design Reference

Design tokens and UI conventions. The token values live in `src/app/globals.css`; use the resulting Tailwind utilities, never raw hex.

## Direction

- Clean academic/admin application; light theme only in v1.
- Navy primary with a blue accent; high readability; minimal noise.
- Consistent across Student, Faculty, and Admin; mobile-first.

## Tokens

| Token                   | Value                             | Utilities                      |
| ----------------------- | --------------------------------- | ------------------------------ |
| `--color-primary`       | `#062e61`                         | `bg-primary`, `text-primary`   |
| `--color-primary-hover` | `#0a3b78`                         | `hover:bg-primary-hover`       |
| `--color-accent`        | `#1565de`                         | `bg-accent`, `text-accent`     |
| `--color-accent-hover`  | `#0d57b7`                         | `hover:bg-accent-hover`        |
| `--color-background`    | `#f6f8fc`                         | `bg-background`                |
| `--color-surface`       | `#ffffff`                         | `bg-surface`                   |
| `--color-subtle`        | `#edf3fb`                         | `bg-subtle`, `hover:bg-subtle` |
| `--color-border`        | `#dfe6ef`                         | `border-border`                |
| `--color-foreground`    | `#0f1f3a`                         | `text-foreground`              |
| `--color-muted`         | `#5f6f84`                         | `text-muted`                   |
| `--color-danger`        | `#c53939`                         | `text-danger`, `bg-danger`     |
| `--color-danger-hover`  | `#a52929`                         | `hover:bg-danger-hover`        |
| `--color-success`       | `#176d42`                         | `text-success`                 |
| `--color-warning`       | `#8a5a00`                         | `text-warning`                 |
| `--color-focus`         | `#70a7ff`                         | `focus-visible:outline-focus`  |
| `--shadow-card`         | `0 3px 10px rgb(10 26 51 / 0.08)` | `shadow-card`                  |
| `--shadow-dialog`       | `0 20px 60px rgb(0 0 0 / 0.25)`   | `shadow-dialog`                |

The `:root` block sets `color-scheme: light` and a native system sans-serif stack, with antialiased rendering. No external font requests are required.

## Status presentation

Statuses use text plus a tinted surface through the shared `StatusBadge` and semantic tokens.

```text
Approved / Open               text-success with a subtle surface
Completed                     text-accent-hover with a subtle surface
Pending / Reserved            text-warning with a subtle surface
Booked                        enabled darker accent surface, distinct from Open
Rejected                      text-danger with a subtle surface
Cancelled                     text-muted with a muted surface
Closed / Disabled             text-muted with a muted background
```

## Typography

System sans-serif, with a consistent hierarchy:

```text
Page title       24px / Semibold
Header title     18px / Semibold
Card title       16px / Semibold
Body             14px / Regular
Label            12px / Semibold
Meta             12px / Regular
```

Use responsive/rem-based Tailwind values while preserving this hierarchy.

## Spacing and radius

Use the standard Tailwind spacing scale; avoid one-off values. Keep radii consistent: small controls rounded, cards slightly larger, status badges softly rounded, avatar circular.

## Layout

- **Sidebar** — dark navy (`bg-primary`); active item uses a white surface with navy text; profile details pinned to the bottom on desktop.
- **Header** — white surface; breadcrumb/page context left, notification bell right.
- **Content surfaces** — prefer divided rows, summary strips, and border-separated sections. Use standalone cards only when the content is a distinct object or task.
- **Shadows** — reserve the stronger dialog shadow for overlays. Ordinary page content uses borders and spacing instead of stacked shadows.
- **Search and filters** — consistent control height and radius; search is the primary wide field; filters sit inline on desktop and stack below on mobile. There is no separate filter drawer.

The student dashboard is action-first: the next confirmed consultation and pending requests lead the page, status counts and quick actions sit in a side rail, and up to three deduplicated recent rows close the page. On mobile the side rail follows pending requests and precedes recent activity. Without a confirmed appointment, pending requests and a discovery card take its place; students with no consultation history see the discovery empty state alongside the side rail.

## Calendar status

```text
OPEN       visible + enabled
RESERVED   visible + disabled
BOOKED     visible + disabled
CLOSED     muted + disabled
```

The faculty availability view uses the same color language. Include a legend when several statuses are visible.

## Responsive

- **Desktop** — persistent sidebar; booking shows a monthly calendar beside its slot list.
- **Mobile** — hamburger navigation drawer; the booking calendar stacks above a vertical slot list; card lists replace wide rows.

Wide data lists use the shared React Aria `DataTable` wrapper, with labelled columns, row headers, keyboard navigation, and horizontal scrolling when the viewport is narrow. Primary actions remain visible without turning every row into a separate card.

## Accessibility

- Maintain contrast; never rely on color alone for status.
- Visible focus styles are required; dialogs trap and restore focus.
- Interactive controls must be keyboard accessible.
- Disabled slots use native disabled behavior, not only muted styling.

## Reference image

[`ui-inspo.png`](ui-inspo.png) is the original visual reference. Labels pictured there do not override product behavior.

## Shared foundation and faculty benchmark

Workspace body and input text use 14px; labels and metadata use 12px. Page headings pair a quiet eyebrow with a compact title and one primary action. Buttons use subtle edge definition; status badges use semantic tinted surfaces. Panels use 12px corners and borders, with divided rows rather than stacked shadows.

The faculty dashboard pairs an availability strip with decision and appointment panels. Pending counts come from the existing summary, and all list content remains backed by the existing repositories. Mobile stacks the same content without removing actions. Shared shell disclosures close on navigation, outside pointer interaction, and Escape; Escape restores trigger focus. A skip link leads to the main workspace.

## Faculty workspace lists and details

Availability and consultation lists use labelled filters inside a bordered toolbar, followed by a result count and a divided table. Below 1024px, the same table rows form compact two-column records with visible field labels and a full-width action area. No action or data field is hidden; React Aria table semantics remain intact.

Availability forms keep schedule and meeting fields together, with a separated footer and intrinsic-width submit control. Faculty consultation details use a bounded surface, readable definition rows, and a separate outcome form. Faculty details dialogs keep their heading and action footer visible while scrolling. The faculty route has a reduced-motion-aware loading placeholder; the dashboard retains the approved benchmark composition.

## Student workspace

The next appointment leads the dashboard; the desktop side rail aligns with its first row while mobile retains pending requests before summary and quick actions. Faculty discovery uses bounded identity cards, a wider search field, department filter, and a clear-filter empty state. Booking keeps the chosen faculty visible through all three steps and provides a change-faculty link. Calendar cells flex to the available width; calendar and slots split only at the xl breakpoint. Selected slots use navy emphasis, with semantic status badges retained. Student consultation lists share the responsive record layout and labelled actions from the faculty workspace. Details use the same bounded reading surface without a nested main landmark.

## Administration workspace

The admin dashboard leads with account and capacity totals, compact management shortcuts, recent consultation metadata, and a follow-up/status rail on wide screens. It uses existing live counts, with no decorative charts. User management uses a responsive search/role/department toolbar; the primary faculty promotion action remains visible at all widths. Admin lists use the same accessible table-to-record treatment as the other portals, switching below 1280px to account for the sidebar and denser management columns.

Consultation records display student, faculty, schedule, category, and status; no empty action column or private descriptions/outcomes are shown. The separate summary export surface states that its dates affect only the CSV, with the default end date based on Philippine time. Export routes and permissions are unchanged. Department forms call the existing authorized server actions and provide pending, safe inline error, and success feedback. Controlled inputs retain failed edits; successful creation clears its fields.

## Final consistency and recovery

Inputs and select popovers retain the same text proportions when rendered through dialog portals outside the workspace shell. Account creation, recovery, application gates, and initial administrator access share the compact `AccountPanel` surface and institution identity. Mobile sign-in keeps the introduction brief so the form is immediately reachable; the desktop reference composition is retained. Muted text and accent tokens are dark enough for normal text on the white, workspace, and subtle surfaces (minimum 4.5:1 for these pairings).

Header icon controls have 44px touch targets. Native disclosures preserve menus opened before hydration and dismiss on actual route changes. Mobile navigation and notification popovers are height-bounded and scroll on short screens. Confirmation dialogs share the 14px body / 18px heading hierarchy, bound their height, and stack long action labels on narrow screens. Consultation detail pages and dialogs share Philippine date/time presentation, including the year.

Paginated directories preserve loaded results on request failure, announce a safe error, stop automatic retries, and offer an explicit retry. Notification read actions show pending and recoverable error feedback without exposing server details. These are presentation and request-state changes; authorization, mutation actions, privacy, and lifecycle rules remain unchanged.
