# Design Palette and UI Tokens

> File name intentionally follows the requested `pallete.md` spelling.

## 1. Design direction

- Clean academic/admin application.
- Light theme only for v1; dark mode is a later phase.
- Navy primary identity with a blue accent.
- High readability, minimal visual noise.
- Consistent across Student, Faculty, and Admin.
- Mobile-first responsive behavior.

## 2. Token source of truth

Design tokens are declared once in `src/app/globals.css` under `@theme`. Components must use the resulting Tailwind utilities instead of raw hex values.

| Token                   | Value                             | Utility examples               |
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

## 3. Status presentation

Statuses are conveyed with text plus a tinted surface. Use the shared `StatusBadge` and semantic token classes rather than introducing new hex values.

```text
Approved / Completed / Open   text-success with a subtle surface
Pending / Reserved            text-warning with a subtle surface
Booked                        enabled darker accent surface, distinct from Open
Rejected / Cancelled          text-danger with a subtle surface
Closed / Disabled             text-muted with a muted background
```

## 4. Typography

The application uses **Inter**. Keep the hierarchy consistent:

```text
Page title       24px / Bold
Header title     18px / Semibold
Card title       14px / Semibold
Body             14px / Regular
Label            12px / Semibold
Meta             12px / Regular
```

Use responsive/rem-based Tailwind values while preserving this hierarchy.

## 5. Spacing and radius

Use the standard Tailwind spacing scale and avoid one-off values. Keep radii consistent: small controls rounded, cards slightly larger, status pills full, avatar circular.

## 6. Layout notes

### Sidebar

- Dark navy (`bg-primary`).
- Active item uses a lighter navy highlight.
- Profile details are pinned to the bottom on desktop.

### Header

- White surface.
- Breadcrumb/page context on the left.
- Notification bell on the right.

### Cards

- White surface, border, and `shadow-card`.
- Clear title hierarchy.

### Search and filters

- Consistent control height and radius across roles.
- Search is the primary wide field.
- Filters sit inline beside search on desktop and stack below it on mobile. There is no separate filter drawer.

## 7. Calendar status presentation

Student booking calendar:

```text
OPEN       visible + enabled
RESERVED   visible + disabled
BOOKED     visible + disabled
CLOSED     muted + disabled
```

The faculty availability view uses the same color language. Include a legend when several statuses are visible.

## 8. Responsive notes

### Desktop

- Persistent sidebar.
- Weekly calendar grid.

### Mobile

- Hamburger navigation drawer.
- Day selector with a vertical time-slot list instead of a squeezed weekly grid.
- Card lists replace wide rows.

## 9. Accessibility

- Maintain sufficient text/background contrast.
- Do not rely on color alone for status; include text labels.
- Visible focus styles are required.
- Dialogs trap and restore focus.
- Interactive controls must be keyboard accessible.
- Disabled slots use native disabled behavior, not only muted styling.
