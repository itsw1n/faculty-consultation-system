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
| `--color-accent`        | `#1769e8`                         | `bg-accent`, `text-accent`     |
| `--color-accent-hover`  | `#0d57b7`                         | `hover:bg-accent-hover`        |
| `--color-background`    | `#f6f8fc`                         | `bg-background`                |
| `--color-surface`       | `#ffffff`                         | `bg-surface`                   |
| `--color-subtle`        | `#edf3fb`                         | `bg-subtle`, `hover:bg-subtle` |
| `--color-border`        | `#dfe6ef`                         | `border-border`                |
| `--color-foreground`    | `#0f1f3a`                         | `text-foreground`              |
| `--color-muted`         | `#66758a`                         | `text-muted`                   |
| `--color-danger`        | `#c53939`                         | `text-danger`, `bg-danger`     |
| `--color-danger-hover`  | `#a52929`                         | `hover:bg-danger-hover`        |
| `--color-success`       | `#176d42`                         | `text-success`                 |
| `--color-warning`       | `#8a5a00`                         | `text-warning`                 |
| `--color-focus`         | `#70a7ff`                         | `focus-visible:outline-focus`  |
| `--shadow-card`         | `0 3px 10px rgb(10 26 51 / 0.08)` | `shadow-card`                  |
| `--shadow-dialog`       | `0 20px 60px rgb(0 0 0 / 0.25)`   | `shadow-dialog`                |

The `:root` block sets `color-scheme: light` and the Inter font stack.

## Status presentation

Statuses use text plus a tinted surface through the shared `StatusBadge` and semantic tokens.

```text
Approved / Completed / Open   text-success with a subtle surface
Pending / Reserved            text-warning with a subtle surface
Booked                        enabled darker accent surface, distinct from Open
Rejected / Cancelled          text-danger with a subtle surface
Closed / Disabled             text-muted with a muted background
```

## Typography

Inter, with a consistent hierarchy:

```text
Page title       24px / Bold
Header title     18px / Semibold
Card title       14px / Semibold
Body             14px / Regular
Label            12px / Semibold
Meta             12px / Regular
```

Use responsive/rem-based Tailwind values while preserving this hierarchy.

## Spacing and radius

Use the standard Tailwind spacing scale; avoid one-off values. Keep radii consistent: small controls rounded, cards slightly larger, status pills full, avatar circular.

## Layout

- **Sidebar** — dark navy (`bg-primary`); active item uses a lighter navy highlight; profile details pinned to the bottom on desktop.
- **Header** — white surface; breadcrumb/page context left, notification bell right.
- **Content surfaces** — prefer divided rows, summary strips, and border-separated sections. Use standalone cards only when the content is a distinct object or task.
- **Shadows** — reserve the stronger dialog shadow for overlays. Ordinary page content uses borders and spacing instead of stacked shadows.
- **Search and filters** — consistent control height and radius; search is the primary wide field; filters sit inline on desktop and stack below on mobile. There is no separate filter drawer.

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
