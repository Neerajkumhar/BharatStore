# BharatStore Dashboard Soft-Light Redesign

Date: 2026-09-12
Status: Approved

## Context

The dashboard app lives under `apps/web/app/(dashboard)/` and is rendered inside a shared shell
(`DashboardShell` → `TopNav` + `Sidebar`). The app uses Tailwind CSS v4 with a central `@theme`
token block in `apps/web/app/globals.css`. Shared primitives (`Card`, `Button`, `Badge`, `Input`)
live in `apps/web/components/ui/`. Roughly 45 dashboard pages exist and they already speak a
uniform `slate`/`amber` utility vocabulary.

Today the palette is a hard slate/amber scheme: cool-gray canvas, dark-navy primary, and amber
accents that fail WCAG AA in several places (e.g. `amber-600` background with white text on the
accent button, `amber-500` as a text color). The home dashboard opens with a heavy near-black
banner and dense cards.

## Direction

Whole-dashboard-app redesign toward a clean, soft-light aesthetic inspired by Linear/Supabase,
while preserving BharatStore's warm saffron identity. "Good ethics" is treated explicitly as
accessible, honest, well-crafted design: WCAG AA contrast, no color-only state indicators,
keyboard-focusable everywhere, honest labeling of demo/sample data, and calm visual hierarchy.

## Approach

**Central token redesign + shared-system polish (Approach A).**

1. Redefine the palette/radii/shadows at the `@theme` layer in `globals.css` — one central file.
2. Upgrade the shared primitives (`Card/Button/Badge/Input`) and shell (`Sidebar/TopNav/DashboardShell`).
3. Fully redesign the `/dashboard` homepage as the flagship pattern.
4. Because every page already uses the same utility vocabulary, the new tokens flow through the
   whole app with a small, low-risk diff concentrated in ~10 files plus the flagship page.

## Design Spec

### 1. Tokens (`globals.css` `:root` + `@theme`)

- **Canvas**: warm off-white `#F7F7F5` (replaces `bg-slate-50`).
- **Surfaces**: card surface white `#FFFFFF`, subtle `#EFEDE7`, hover `#E9E6DF`.
- **Borders**: subtle warm-gray `#E6E2DA`, default `#D4CFC4`, focus uses the accent.
- **Text**: primary near-black `#1A1A1B` (never pure black), secondary/muted warm gray
  `#6B6B66`; minted/blue status texts use dark accessible shades.
- **Accent (saffron)**: keep a saffron/amber identity. Button fills use saffron with
  near-black text (AA pass), mirroring the Supabase "brand background + dark text" rule.
  Icon tiles keep soft saffron tints; text-on-white accents use the darkest saffron shades
  (`#8a5a0b`–`#a16207`) to pass 4.5:1.
- **Status colors**: success (emerald), warning (amber), error (red), info (blue) — each with
  accessible text-on-tint pairs; never emitted as color-only.
- **Shadows**: very subtle layered shadows (`rgba(15,23,42,0.04–0.08)`), borders as the primary
  separator.
- **Radii**: slightly larger card radius (`12px`), buttons `8px`.
- **Mapping**: remap Tailwind's `slate` ramp → soft-warm neutral values and `amber` ramp → refined
  saffron values at the `@theme` layer so existing utilities adopt the new look app-wide.
- Keep `--font-sans` (Plus Jakarta Sans) and `--font-mono` (JetBrains Mono); keep the tabular
  numerals helper for all money/count values.

### 2. Shared primitives (`components/ui/`)

- **Card**: new radius, border color, soft shadow, hover lift only where appropriate.
- **Button**: softened ring/focus styles; `accent` variant becomes saffron fill + near-black text
  (`aria` props preserved). All variants keep `focus-visible` outlines.
- **Badge**: status variants updated to accessible text/tint pairs; support an optional leading
  glyph (dot/icon) so state is never color-only.
- **Input**: new border/ring tokens; keep label/helper/error wiring and `aria-invalid` handling.

### 3. New shared components

- `StatCard` — KPI card with muted label, icon tile, big tabular value, trend line, optional
  "demo" flag.
- `Skeleton` — pulse placeholder used instead of blank loading screens (aligns with guardrail).
- `PageHeader` — standardized page title/subtitle/actions block used by the shell and pages.

### 4. Shell (`components/layout/`)

- **TopNav**: softened surface, accessible icon buttons (descriptive `aria-label`), calmer search
  trigger, business switcher and profile menus preserved.
- **Sidebar**: active item uses subtle tint + left saffron accent bar instead of a heavy black
  pill; softened group labels; storefront quick link preserved.
- **DashboardShell**: light page-header band (no heavy black blocks), consistent breadcrumb
  styling, mobile bottom nav retained with accessible labels.

### 5. `/dashboard` flagship page

- Replace the near-black welcome banner with a soft light **page header** (greeting, subtitle,
  contextual actions).
- KPI grid via **StatCard** (Today's GMV, Active Orders, Inventory Alerts, Khata Receivable).
- **Recent orders** table: icon + label status badges (not color-only), sticky header, tabular
  totals, cleaner row density.
- **Quick operations**: grouped, descriptive, icon-backed actions.
- **GST compliance** panel: softened dark → light card, readable status rows.
- Demo/sample data labeled with a subtle **"Demo data"** tag (honest-data requirement).

### 6. Ethics & accessibility checklist

- WCAG AA: ≥4.5:1 body text, ≥3:1 large text; verify accent/status pairs.
- No color-only state: badges pair color with icon/label.
- `focus-visible` ring on every interactive element.
- Descriptive action labels; `aria-label` on icon-only buttons.
- Skeleton placeholders; no blank loading screens.
- No pure-black text; no auto-play media; native scrollbars; mobile 16px inputs.
- `prefers-reduced-motion` honored (already present in `globals.css`).

## Files touched

- `apps/web/app/globals.css` — token layer (main lever).
- `apps/web/components/ui/{card,button,badge,input}.tsx` — primitives.
- `apps/web/components/layout/{DashboardShell,Sidebar,TopNav}.tsx` — shell.
- `apps/web/app/(dashboard)/dashboard/page.tsx` — flagship page.
- New: `apps/web/components/ui/{stat-card,skeleton,page-header}.tsx` (and `index.ts` export).

All other pages inherit the new look via tokens; no per-page edits unless verification surfaces
contrast or hierarchy problems.

## Verification

- `npm run lint --workspace=apps/web`
- `npm run build --workspace=apps/web` (Next type-check + build)
- Browser render check of `/dashboard` at desktop and mobile widths for visual regression,
  keyboard focus, and console errors.