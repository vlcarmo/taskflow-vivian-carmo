---
name: TaskFlow Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers a focused, high-clarity productivity environment engineered specifically for local-first execution and agile remote collaboration. The visual language balances utilitarian precision with responsive warmth, embodying the principles of Nielsen’s 10 Usability Heuristics at every layer:

- **Visibility of System Status:** Immediate, zero-latency feedback for all local saves, peer sync states, drag coordinates, and processing queues.
- **Match Between System and Real World:** Kanban lanes, task cards, stage indicators, and physical metadata reflect established real-world project workflows without esoteric abstraction.
- **User Control and Freedom:** Frictionless undo/redo capabilities, non-blocking modal dismissals, and non-destructive reordering gestures.
- **Consistency and Standards:** Uniform visual affordances across cards, inputs, tags, and controls, ensuring predictable interactions throughout.
- **Error Prevention and Recovery:** High-visibility confirmation toasts, optimistic reversible states, and context-rich inline validations.

The aesthetic follows an **engineered minimalist** approach—subtle borders, pristine neutral layering, restrained functional color accents, and intentional tactile depth that surfaces active tasks while receding chrome into the background.

## Colors

The color palette establishes an uncompromising functional hierarchy where neutral slate tones structure the workspace, while deliberate semantic tokens signal status, urgency, and system state.

### Color Tokens & Roles

- **Primary (`#4F46E5` / Hover `#4338CA`):** Signals actionable user intent, active focus states, primary buttons, and selected navigation nodes.
- **Secondary / Informational (`#0284C7` / Soft `#F0F9FF`):** Reserved for system documentation, peer presence markers, activity streams, and link references.
- **Success / Completed (`#10B981` / Soft `#ECFDF5`):** Denotes completed tasks, confirmed offline synchronization, healthy network links, and resolved check-lists.
- **Warning / In-Progress (`#F59E0B` / Soft `#FFFBEB`):** Flags pending sync reconciliations, blocked tickets, intermediate states, and approaching deadlines.
- **Destructive / Error (`#EF4444` / Soft `#FEF2F2`):** Communicates overdue statuses, failed validations, destructive deletion actions, and sync collision warnings.
- **Neutral Canvas & Surfaces:**
  - Base Application Background: `#F8FAFC`
  - Elevated Container / Board Column Background: `#F1F5F9`
  - Card & Modal Foreground: `#FFFFFF`
  - Structural Borders & Separators: `#E2E8F0`
  - Subtle Borders & Hover Contours: `#CBD5E1`
- **Typography Neutrals:**
  - Headings & Primary Content: `#0F172A`
  - Secondary Body & Metadata: `#334155`
  - Muted Placeholders, Icons & Task IDs: `#64748B`

### Accessibility & Contrast
All text combinations against canvas and card surfaces maintain a minimum 4.5:1 contrast ratio. Semantic tag pairings utilize saturated foregrounds on matched tinted light backgrounds to ensure effortless legibility in dense lists.

## Typography

The typography leverages **Inter** for its neutral grotesque rhythm and tall x-height, paired with **JetBrains Mono** for technical data like issue keys and hotkey shortcuts.

- **Tabular Figures (`tnum`):** Enforce `font-variant-numeric: tabular-nums` across all card counters, time trackers, task indicators, and priority ranks to prevent layout jitter during live updates.
- **Scale Discipline:** Strict caps on display sizing preserve high density. Hierarchy is reinforced primarily through calibrated weight transitions (`400` Regular for descriptive content, `500` Medium for interactive controls, `600` Semibold for grouping headers and active titles).
- **Readability & Tracking:** Tighter letter tracking on large headings (`-0.02em`) preserves compactness, while positive tracking (`0.01em` - `0.02em`) on small uppercase labels prevents visual crowding in micro-badges.

## Layout & Spacing

The layout structure relies on a strict 4px/8px incremental base unit tailored for high-information density and board horizontal scrolling.

### Breakpoints & Adaptive Strategy
- **Desktop (≥ 1280px):** Multi-column fluid Kanban view with fixed column widths (`304px` to `340px`), persistent navigation sidebar (`240px` expanded, `64px` collapsed), and dynamic right-side detail panels (`420px`).
- **Tablet (768px – 1279px):** Horizontal swipeable Kanban board with snap-to-column points or structured dual-column list toggle. Retractable overlay navigation.
- **Mobile (< 768px):** Single-column stacked board with segmented tab switches across workflow stages (e.g., *Backlog*, *In Progress*, *Done*). Bottom sheet inspection for task details.

### Spacing Philosophy
- **Component Density:** Core interactive targets meet standard touch/cursor expectations without superfluous empty space (`space-sm` for badge interiors, `space-md` for standard card padding).
- **Kanban Column Flow:** Board lanes maintain consistent `gutter` (16px) separation, utilizing `space-sm` (8px) between vertically stacked cards for rapid scanning.

## Elevation & Depth

Depth in this design system reinforces tactile interaction and spatial feedback rather than decorative ornament. Surfaces transition between elevation planes to signal hierarchy, dragging actions, and modal focus.

### Surface Tiers
- **Tier 0 (App Canvas):** Flat `#F8FAFC`, non-elevated ground plane.
- **Tier 1 (Lanes & Static Cards):**
  - Columns: `#F1F5F9` with a subtle outline (`border: 1px solid #E2E8F0`).
  - Cards (Rest): `#FFFFFF`, `border: 1px solid #E2E8F0`, `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Tier 2 (Card Hover & Tooltips):**
  - Hovered items elevate subtly: `border-color: #CBD5E1`, `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
  - Tooltips: `#0F172A` background with crisp white typography and a sharp 2px shadow.
- **Tier 3 (Active Drag & Drop):**
  - When a user lifts a task card, it scales to `1.02`, rotates slightly (`1deg`), and casts an ambient shadow: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
  - Drop targets display a 2px dashed border in `#4F46E5` over an indigo tint `#EEF2FF` insertion slot.
- **Tier 4 (Toasts & Overlays):**
  - Undo notifications and slide-out detail drawers sit at `box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25)`.

## Shapes

The design system employs a refined geometric curve discipline (Level 2: `0.5rem` / 8px default roundedness) that delivers clean visual definition while avoiding excessive, informal circularity.

- **Small Interactive Controls (8px / `0.5rem`):** Applied to buttons, inputs, badge tags, dropdowns, and nested card checkboxes.
- **Structural Containers (12px / `0.75rem` via `rounded-lg`):** Applied to Kanban board lanes, modal viewports, flyout sheets, and notification snackbars.
- **Micro-Indicators (Pill / Full Round):** Reserved exclusively for status indicators, unread count badges, member avatars, and keyboard badge shortcut indicators (`KBD`).

## Components

### Buttons
- **Primary:** Filled `#4F46E5`, text `#FFFFFF`, hover `#4338CA`, active `#3730A3`. Height: 36px (desktop), 44px (touch). Includes focused keyboard rings (`2px offset`, `#4F46E5`).
- **Secondary / Subtle:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, text `#334155`. Hover: `#F8FAFC`, border `#CBD5E1`.
- **Destructive:** Borderless or faint red surface (`#FEF2F2`), text `#EF4444`. Hover: `#FEE2E2`.
- **Icon Actions:** 32x32px squircle buttons with subtle gray hover states for fast column actions.

### Task Cards (Kanban / List Item)
- **Base Style:** Background `#FFFFFF`, border `1px solid #E2E8F0`, radius `8px`, padding `12px`.
- **Header Slot:** Issue Key (`code-mono`, `#64748B`), drag grip handle affordance, and priority icon.
- **Body:** Task summary text (`body-md`, `600` weight, `#0F172A`).
- **Footer Metadata:** Due date badge with conditional dynamic color (amber if < 24h, rose if overdue), checklist completion fraction (`tnum`), and assignees' overlapping avatar cluster.
- **Active States:** Drag placeholder shows an outline with a dashed blue perimeter; active clone displays elevated Tier 3 depth.

### Chips & Semantic Badges
- **Structure:** Height 22px, radius 6px, padding `2px 8px`, typography `label-sm`.
- **Status Variants:**
  - *Success (Done):* Background `#ECFDF5`, text `#065F46`, dot `#10B981`.
  - *Warning (In Progress):* Background `#FFFBEB`, text `#92400E`, dot `#F59E0B`.
  - *Urgent / Overdue:* Background `#FEF2F2`, text `#991B1B`, dot `#EF4444`.
  - *Informational:* Background `#F0F9FF`, text `#075985`, dot `#0284C7`.

### Input Fields & Controls
- **Text Inputs:** Height 36px, border `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`. Focused state: border `#4F46E5`, ring `3px rgba(79, 70, 229, 0.15)`.
- **Checkboxes:** 16x16px, radius 4px, border `1.5px solid #CBD5E1`. Checked state: background `#4F46E5`, border `#4F46E5`, white checkmark icon. Strike-through body text animation when ticked.

### Heuristic Feedback Components
- **System Status Bar (Local-First Sync):** Persistent micro-indicator at the viewport footer. Displays green check ("All changes saved locally & synced") or yellow pulse ("3 updates pending sync").
- **Undo / Redo Action Toasts:** Bottom-left pinned snackbar triggered after state changes (e.g., "Task archived · Undo (Ctrl+Z)"). High contrast (`#0F172A` background, `#FFFFFF` text) with an embedded count-down progress bar showing time until permanent local persistence.
- **Empty States:** Clear explanatory copy matching real-world task terms, paired with a single prominent call-to-action button to eliminate user hesitation.