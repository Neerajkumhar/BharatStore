# BharatStore Dashboard Remake: Collapsible Rail Shell + Live Home

Date: 2026-09-16
Status: Approved

## Context

The dashboard app lives under `apps/web/app/(dashboard)/` rendered by `DashboardShell`
(`components/layout/DashboardShell.tsx`), which stacks a full-width `TopNav` (h-16) plus a
second horizontal menu row (`NavBar`, h-12) on desktop, and a bottom bar + slide-over on
mobile. The soft-light Linear-inspired token system (amber remapped to indigo, slate to cool
neutral) from the 2026-09-12 spec is already in place.

Pain points driving the remake (user-confirmed, all apply):

- The stacked top-bar + horizontal menu-bar feels cramped and cluttered to navigate.
- The home page (`/dashboard`) is a static demo page: hardcoded `sampleOrders`, `demo` KPI
  cards, no live data.
- The visual identity is present but the shell proportions/navigation need refinement.

## Direction (user-confirmed)

- **Refine not repaint** — keep the current slate + indigo/amber palette and design tokens.
- **Collapsible icon rail** — replace the horizontal menu row with a persistent left sidebar
  that collapses between icon-only (64px) and expanded (224px).
- **Live data home** — wire `/dashboard` to a new `/api/dashboard` route backed by real
  tenant-ledger queries so KPIs, recent orders, and alerts are real.

## Design

### 1. Shell: `AppShell` + `RailNav`

- New client component `apps/web/components/layout/AppShell.tsx` becomes the dashboard
  wrapper. `app/(dashboard)/layout.tsx` imports it instead of `DashboardShell`.
- Composition:
  - **Left icon rail** (`RailNav.tsx`, desktop `md:`+ only): collapsible `w-16` ⇄ `w-56`,
    toggled by a rail chevron button and the `Cmd/Ctrl+\` shortcut. Collapsed state persisted
    to `localStorage` key `bs-rail-collapsed`.
  - **TopNav** (evolved): keeps brand, business switcher, global search trigger, POS button,
    notifications, profile. The `NavBar` horizontal row is no longer rendered by the shell.
  - **Mobile**: unchanged bottom bar + slide-over; slide-over reuses rail item markup.
  - `isBuilderRoute` full-bleed behavior preserved (`/storefront/builder` hides rail+topbar).
- `components/layout/navigation.ts` gains:
  - Optional `railIcon` per group (used for the collapsed rail's group glyph).
  - A `getRailGroups(pathname)` helper returning grouped items for render.
  - Group sub-labels already exist (`group`); collapsed rail shows a stacked-glyph column.
- Active rail state: `isGroupActive`/`isItemActive` already exist — reused.
- `DashboardShell.tsx` retained as a thin wrapper calling `<AppShell>` (backwards compat) OR
  replaced; simplest path: `layout.tsx` uses `AppShell` directly; `DashboardShell` removed from
  the import graph after checking no other references.

### 2. Visual refinement (token-preserving)

- Rail: `bg-white` surface, `border-r border-slate-200`; active item `bg-slate-100` + indigo
  icon + 2px left accent (`bg-brand-500`); group headers `text-2xs uppercase tracking-wider
  text-slate-400`.
- Expander glyph: chevron in a ghost button at the rail bottom (or top under the logo tile).
- Content canvas stays `bg-slate-50`; page-header band refined spacing
  (`px-4 sm:px-6`, `text-lg sm:text-xl`) — already consistent with `PageHeader` component.

### 3. Live home page

- **New API** `apps/web/app/api/dashboard/route.ts` (same authorization pattern as analytics
  routes; `PERMISSIONS.SETTINGS_READ`; `getTenantDb(auth.tenantId)`). Returns `data`:
  - `kpis`: `{ todayRevenue, todayOrderCount, activeOrders, lowStockCount, outOfStockCount,
    khataReceivable, khataDebtors }`
  - `recentOrders`: latest 8 non-cancelled orders with `{ id, orderNumber, customerName, phone,
    itemSummary, total, status, paymentMethod, createdAt }` (join customer; itemSummary from
    items like `"Kanjeevaram Silk Saree x 1"` truncated)
  - `alerts`: array derived from same logic as `/api/analytics/alerts`
    (out-of-stock, low-stock, high-khata, pending orders) with `{ type, severity, title,
    message, count, actionUrl }`
  - `periodLabel` + `generatedAt`
- **Rewrite** `apps/web/app/(dashboard)/dashboard/page.tsx` as a client page:
  - Greeting `PageHeader` (Namaste greeting, live-status pill filled from API, POS action).
  - KPI grid (5 StatCards): Today's GMV, Active Orders, Inventory Alerts, Khata Receivable,
    Today's Orders — values from API, no `demo` flag.
  - Real **Recent Orders** table (status badges from API status).
  - **Quick Operations** card (unchanged actions).
  - Alerts strip via existing `BusinessAlerts` component when alerts exist.
  - Removes `sampleOrders`/`statusMeta`/`demo` entirely.

### 4. Status/payment label mapping in home page

Reuse display conventions already in the app:
- Order status map: `PAID`/`COMPLETED` → success, `PENDING`/`PROCESSING` → warning,
  `CANCELLED` → error; gateway labels via existing `payments` page convention
  (`UPI_DIRECT → UPI`).

## Files touched

- New: `apps/web/components/layout/AppShell.tsx`, `apps/web/components/layout/RailNav.tsx`,
  `apps/web/app/api/dashboard/route.ts`
- Edit: `apps/web/app/(dashboard)/layout.tsx`, `apps/web/components/layout/TopNav.tsx`,
  `apps/web/components/layout/navigation.ts`, `apps/web/app/(dashboard)/dashboard/page.tsx`
- Delete (after reference check): `apps/web/components/layout/NavBar.tsx` horizontal bar +
  `DashboardShell.tsx` if unused elsewhere.

## Verification

- `npx tsc --noEmit` and `npm run lint` in `apps/web`.
- Playwright sweep on port 3002: `/dashboard` (desktop + mobile), rail collapse persist,
  `/analytics` + sub-pages, `/orders`, `/products`, `/inventory`, `/settings` — zero page
  errors; rail toggles; mobile bottom bar navigates.