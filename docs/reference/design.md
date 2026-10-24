# Design reference

[Documentation guide](../README.md) · [System walkthrough](../walkthrough.md)

The application uses a light, navy-led visual language appropriate to an academic institution. Shared typography, surfaces, controls, and navigation keep Student, Faculty, Admin, and account screens cohesive. Each portal organizes its actual tasks rather than adding decorative charts or filler content.

The token definitions in [globals.css](../../src/app/globals.css) are the implementation source. Use their Tailwind utilities in components rather than introducing unrelated colors.

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

## Typography and proportions

| Element              | Size and weight |
| -------------------- | --------------- |
| Workspace page title | 24px, semibold  |
| Dialog/header title  | 18px, semibold  |
| Section title        | 16px, semibold  |
| Body and input text  | 14px, regular   |
| Labels               | 12px, semibold  |
| Metadata             | 12px, regular   |

Inputs and select popovers keep these proportions when rendered through portals outside the workspace shell. Account forms use the same control language. The sign-in page has a larger institutional introduction on desktop and a compact introduction on mobile so the form remains reachable.

Use the standard spacing scale, consistent small control radii, and bordered section surfaces. Panels use rounded corners and divided rows; strong shadows are reserved for dialogs and overlays.

## Navigation and shared components

- **Application shell:** a persistent navy sidebar on desktop, a white context header, and a mobile navigation disclosure. A skip link leads to the main workspace.
- **Headers:** compact titles, a short description where useful, and a recognizable primary action.
- **Search and filters:** labelled controls inline when space permits, stacked on narrow screens, without a separate filter drawer.
- **Controls:** shared Button, Select, SearchInput, StatusBadge, DataTable, and Modal components provide consistent states.
- **Account screens:** the shared AccountPanel combines institution identity, a concise explanation, and the current form or account status.

Header icon controls have 44px touch targets. Navigation and notification disclosures are height-bounded, scroll on short screens, and dismiss on outside interaction, navigation, or Escape. Escape restores trigger focus. Native menus opened before hydration remain open when JavaScript arrives.

## Status presentation

Text labels accompany every semantic status; color alone does not carry meaning.

| Status             | Treatment                               |
| ------------------ | --------------------------------------- |
| Approved / Open    | Success text and a tinted surface       |
| Completed / Booked | Darker accent text and a tinted surface |
| Pending / Reserved | Warning text and a tinted surface       |
| Rejected           | Danger text and a tinted surface        |
| Cancelled / Closed | Muted text and a quiet surface          |

The booking slot list enables only requestable open times. Reserved and booked slots remain visible but disabled; closed slots use a muted disabled treatment. The calendar includes a status legend. The exact lifecycle is defined in [Business rules](../concepts/rules.md#booking-transitions).

## Layout by responsibility

| Experience | Composition                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student    | The next confirmed appointment and pending requests lead; summary and quick actions sit in a desktop side rail, with recent records below. Faculty discovery uses identity cards and booking keeps the chosen faculty visible through Schedule, Details, and Review. |
| Faculty    | Open availability, requests needing a decision, and confirmed appointments lead the dashboard. Availability and consultation screens use labelled filters and compact records. Detail views separate schedule information from the outcome form.                     |
| Admin      | Account/capacity totals, management shortcuts, recent consultation metadata, and follow-up counts support institution-wide management. User and department controls prioritize editing and feedback; the export section explains its independent date range.         |

All summaries use application data. Consultation descriptions and outcomes remain absent from Admin presentation. User management keeps faculty promotion visible; department forms retain failed edits and display pending, error, and success feedback.

## Responsive behavior

Workspace lists keep a single React Aria table with column labels, row headers, and keyboard interaction. Below 1024px, Student and Faculty rows become labelled two-column records with full-width actions. Admin lists switch below 1280px to accommodate denser columns and the desktop sidebar. The content and actions remain available.

The booking calendar and time slots split into adjacent panels at the xl breakpoint and stack below it. Calendar cells fit the available width. Mobile dashboards preserve workflow priority; whitespace and density adapt to the actual content.

## Dialogs and feedback

Dialogs bound their height to the viewport and allow content to scroll. Shared form dialogs retain a visible heading and close control. Consultation details use readable definition rows; confirmations stack long action labels on narrow screens. Date/time presentation includes the year and uses Philippine time.

Loading states use restrained, reduced-motion-aware indicators. Empty states explain what is missing and offer a relevant next action where appropriate. Paginated list failures keep loaded results, announce safe feedback, pause automatic fetching, and offer an explicit retry. Notification read actions show pending and recoverable failure feedback.

## Accessibility conventions

- Preserve semantic labels, headings, table relationships, and a single workspace main landmark.
- Provide visible keyboard focus; dialogs trap and restore focus.
- Use native disabled behavior rather than muted styling alone.
- Pair status color with text, and announce actionable feedback.
- Keep normal text readable on white, workspace, and subtle surfaces; the muted/accent text token pairings meet at least 4.5:1 contrast on those surfaces.
- Respect reduced-motion preferences and retain access to controls at narrow widths and short viewport heights.

These conventions describe the implemented design; they are not a claim of exhaustive accessibility certification. Current test commands and prerequisites are in [Getting started](../getting-started.md#validate).
