# Design Palette and UI Tokens

> File name intentionally follows the requested `pallete.md` spelling.

## 1. Design Direction

- Clean academic/admin application.
- Light theme only for v1.
- Navy/blue primary identity.
- High readability.
- Minimal visual noise.
- Consistent across Student, Faculty, and Admin.
- Mobile-first responsive behavior.

## 2. Core Colors

The existing Figma direction uses a dark navy foundation similar to:

```text
Primary Navy      #062E61
Primary Hover     #0A3B78
Sidebar Surface   #0A356B
Page Background   #F6F8FC
Surface           #FFFFFF
Subtle Surface    #F8FAFD
Border            #DFE6EF
Text Primary      #0F1F3A
Text Secondary    #66758A
Text Muted        #9AA7B7
```

These are baseline tokens; implementation should centralize them rather than scatter raw hex values through components.

## 3. Status Colors

### Success / Open / Approved

```text
Success Text       #1F9D55
Success Surface    #EAF8EF or #CFEFD9
```

### Pending / Reserved

Use a restrained amber or blue-muted treatment depending on context.

Suggested semantic tokens:

```text
Pending Text
Pending Surface
Reserved Text
Reserved Surface
```

### Booked

Booked should be clearly visible but disabled for Student booking.

Suggested:

- medium blue surface/text distinct from Open.

### Danger / Rejected / Cancelled

```text
Danger Text        #C53939
Danger Border      #E7B1B1
Danger Surface     light red/pink tint
```

### Closed / Disabled

```text
Disabled Text      #9AA7B7
Disabled Surface   #F1F4F8
```

## 4. Semantic Token Names

Prefer semantic CSS variables/tokens:

```text
--color-primary
--color-primary-hover
--color-background
--color-surface
--color-surface-subtle
--color-border
--color-text
--color-text-muted
--color-success
--color-success-surface
--color-warning
--color-warning-surface
--color-danger
--color-danger-surface
--color-disabled
```

## 5. Typography

Current Figma direction uses **Inter**.

Recommended hierarchy:

```text
Page title       24px / Bold
Header title     18px / Semi Bold
Card title       14px / Semi Bold
Body             12-14px / Regular
Label            10-12px / Semi Bold
Small/meta        9-11px / Regular/Medium
```

Actual implementation should use responsive/rem-based values while preserving hierarchy.

## 6. Spacing

Use a predictable spacing scale.

Suggested:

```text
4
6
8
12
16
20
24
32
```

Avoid arbitrary one-off spacing values unless required by layout.

## 7. Radius

Suggested semantic sizes:

```text
Small controls   6-7px
Cards            8-10px
Pills/status     full/pill
Avatar           full circle
```

## 8. Shadows

Cards should use subtle shadows only.

Existing visual direction resembles:

```text
0 3px 10px rgba(10, 26, 51, 0.08)
```

Do not overuse elevation.

## 9. Layout Notes

### Sidebar

- Dark navy.
- Active nav item uses lighter navy highlight.
- Profile pinned at bottom.

### Header

- White surface.
- Breadcrumb/page context left.
- Notification bell right.

### Cards

- White surface.
- Border + subtle shadow.
- Clear title hierarchy.

### Search/filters

- Same control height/radius across roles.
- Search is primary wide field.
- Desktop filters align in same row where space allows.
- Mobile uses a dedicated filter drawer/sheet.

## 10. Calendar Status Presentation

Student booking calendar:

```text
OPEN       visible + enabled
RESERVED   visible + disabled
BOOKED     visible + disabled
CLOSED     muted + disabled
```

Faculty availability calendar may use the same colors for consistency.

Include a legend when multiple statuses are visible.

## 11. Responsive Notes

### Desktop

- Persistent sidebar.
- Weekly calendar grid.
- Table layouts.

### Mobile

- Hamburger navigation drawer.
- Day selector + vertical time-slot list instead of squeezed weekly grid.
- Table rows may become cards.
- Filters move to drawer/bottom sheet.

## 12. Accessibility Notes

- Maintain sufficient text/background contrast.
- Do not rely on color alone for status; include text labels.
- Visible focus styles are required.
- Dialogs must trap/restore focus correctly.
- Interactive controls must be keyboard accessible.
- Disabled slot states must be semantically disabled, not only visually muted.
