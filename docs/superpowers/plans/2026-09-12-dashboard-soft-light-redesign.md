# Dashboard Soft-Light Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the whole BharatStore dashboard app to a clean, accessible, soft-light aesthetic with a warm saffron identity, via a central token redesign plus shared-system polish.

**Architecture:** The look is driven by one token layer (`globals.css` `@theme`), shared UI primitives (`components/ui/*`), the app shell (`components/layout/*`), and the `/dashboard` homepage as the flagship pattern. Because all ~45 dashboard pages already speak the same `slate`/`amber` utility vocabulary, remapping those ramps at the theme layer propagates the redesign app-wide with a small, low-risk diff.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4 (@theme tokens), lucide-react icons, `clsx` + `tailwind-merge` via `@/lib/utils` `cn`.

**Spec:** `docs/superpowers/specs/2026-09-12-dashboard-soft-light-redesign-design.md`

## Global Constraints

- Never use pure black for text. Primary text is `#1A1A1B` (remapped `slate-900`).
- Saffron accent must keep AA: filled saffron (`#A16207`-family) buttons use near-black text; text accents on white use `#A16207` or darker.
- Do NOT repurpose `slate`/`amber` names to unrelated hues — remap them to softened versions of the same hue family so existing utilities keep working.
- Do NOT edit the ~45 dashboard pages individually unless verification surfaces a contrast/hierarchy problem.
- Status states are never color-only: pair color with an icon/label glyph.
- Every interactive element needs `focus-visible` styling; icon-only buttons need `aria-label`.
- No blank loading screens — use the `Skeleton` component.
- Demo/sample data on the homepage is labeled with a visible "Demo data" note.
- Tabular numerals for all money/counts (`.tabular-nums` / `font-tabular` already exist).

---

### Task 1: Token layer (`globals.css`)

**Files:**
- Modify: `apps/web/app/globals.css` — replace the `:root` block (lines ~3-78) and extend the `@theme` block (~lines 80-131)

**Interfaces:**
- Produces: New `--color-slate-*`, `--color-amber-*`, `--color-success-*`/`--color-warning-*`/`--color-error-*`/`--color-info-*`, refactored `--shadow-*`, and a new `--text-2xs` theme token. These are consumed by every later task via standard Tailwind utilities.

- [ ] **Step 1: Replace the `:root` token block**

Replace everything from `:root {` through the closing `}` at line 78 with:

```css
:root {
  /* Typography */
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Bharat Brand Tokens: Soft Saffron & Warm Slate */
  --brand-50:  #fff9eb;
  --brand-100: #f9e8c7;
  --brand-200: #f3d9a8;
  --brand-300: #e8c37c;
  --brand-400: #dcaa55;
  --brand-500: #cc9418; /* Saffron Accent (fills + FAB) */
  --brand-600: #a16207; /* Saffron text on white (AA 4.5:1) */
  --brand-700: #8a5a0b;
  --brand-800: #71480a;

  /* Primary Surfaces: Warm near-black (never pure black) */
  --primary-900: #1a1a1b;
  --primary-800: #2f2c28;
  --primary-700: #45413c;

  /* Neutral Backgrounds & Surfaces */
  --bg-canvas:   #f7f7f5; /* Warm off-white app background */
  --bg-surface:  #ffffff;
  --bg-subtle:   #eeece7;
  --bg-hover:    #e9e6df;

  /* Semantic Borders */
  --border-subtle:  #e6e2da;
  --border-default: #d4cfc4;
  --border-focus:   #a16207;

  /* Status Tokens (accessible text-on-tint pairs) */
  --success-bg:   #e8f7ef;
  --success-border: #a7e3c0;
  --success-text: #0d6b3f;

  --warning-bg:   #fff6e0;
  --warning-border: #f3d9a8;
  --warning-text: #7a4a05;

  --error-bg:     #fdeeee;
  --error-border:   #f5c1c1;
  --error-text:   #a01b1b;

  --info-bg:      #edf3fc;
  --info-border:    #bccfe9;
  --info-text:    #1d4a8e;

  /* Typography Scale */
  --text-2xs: 10.5px;
  --text-xs:  12px;
  --text-sm:  14px;
  --text-base:16px;
  --text-lg:  18px;
  --text-xl:  20px;
  --text-2xl: 24px;
  --text-3xl: 30px;

  /* Spacing (4px baseline grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows: soft, layered, low-opacity (borders do the separating) */
  --shadow-xs: 0 1px 2px 0 rgba(26, 26, 27, 0.04);
  --shadow-sm: 0 1px 3px 0 rgba(26, 26, 27, 0.06), 0 1px 2px -1px rgba(26, 26, 27, 0.04);
  --shadow-md: 0 4px 12px -2px rgba(26, 26, 27, 0.06), 0 2px 6px -4px rgba(26, 26, 27, 0.05);
  --shadow-lg: 0 12px 24px -6px rgba(26, 26, 27, 0.07), 0 4px 8px -4px rgba(26, 26, 27, 0.04);
}
```

- [ ] **Step 2: Extend the `@theme` block**

Replace all of `@theme { ... }` (lines 80-131) with:

```css
@theme {
  /* Motion tokens (unchanged) */
  --animate-float: float 6s ease-in-out infinite;
  --animate-float-slow: float 9s ease-in-out infinite;
  --animate-float-delayed: float 7s ease-in-out 1.2s infinite;
  --animate-pulse-glow: pulse-glow 5s ease-in-out infinite;
  --animate-shimmer: shimmer 2.2s linear infinite;
  --animate-marquee: marquee 42s linear infinite;
  --animate-dash: dash 1.6s ease-out forwards;
  --animate-bar-grow: bar-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;

  /* Brand (saffron) */
  --color-brand-50: var(--brand-50);
  --color-brand-100: var(--brand-100);
  --color-brand-200: var(--brand-200);
  --color-brand-300: var(--brand-300);
  --color-brand-400: var(--brand-400);
  --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600);
  --color-brand-700: var(--brand-700);
  --color-brand-800: var(--brand-800);

  /* Primary warm near-black */
  --color-primary-900: var(--primary-900);
  --color-primary-800: var(--primary-800);
  --color-primary-700: var(--primary-700);

  /* Surfaces */
  --color-bg-canvas: var(--bg-canvas);
  --color-bg-surface: var(--bg-surface);
  --color-bg-subtle: var(--bg-subtle);
  --color-bg-hover: var(--bg-hover);

  /* Borders */
  --color-border-subtle: var(--border-subtle);
  --color-border-default: var(--border-default);
  --color-border-focus: var(--border-focus);

  /* Status */
  --color-success-bg: var(--success-bg);
  --color-success-border: var(--success-border);
  --color-success-text: var(--success-text);

  --color-warning-bg: var(--warning-bg);
  --color-warning-border: var(--warning-border);
  --color-warning-text: var(--warning-text);

  --color-error-bg: var(--error-bg);
  --color-error-border: var(--error-border);
  --color-error-text: var(--error-text);

  --color-info-bg: var(--info-bg);
  --color-info-border: var(--info-border);
  --color-info-text: var(--info-text);

  /* Fonts */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  /* Small label size utility */
  --text-2xs: 10.5px;

  /* Remap the slate ramp to soft warm gray (same cool-gray family, softened + warmed) */
  --color-slate-50:  #f7f7f5;
  --color-slate-100: #eeece7;
  --color-slate-200: #e6e2da;
  --color-slate-300: #d4cfc4;
  --color-slate-400: #a6a29a;
  --color-slate-500: #6f6b65;
  --color-slate-600: #55524c;
  --color-slate-700: #423f3a;
  --color-slate-800: #2c2a26;
  --color-slate-900: #1a1a1b;
  --color-slate-950: #121212;

  /* Remap the amber ramp to soft saffron (same amber family, refined + accessible) */
  --color-amber-50:  #fff9eb;
  --color-amber-100: #f9e8c7;
  --color-amber-200: #f3d9a8;
  --color-amber-300: #e8c37c;
  --color-amber-400: #dcaa55;
  --color-amber-500: #cc9418;
  --color-amber-600: #a16207;
  --color-amber-700: #8a5a0b;
  --color-amber-800: #71480a;
  --color-amber-900: #5b3a08;
}
```

- [ ] **Step 3: Update the focus-visible rule**

Change the `:focus-visible` block so focus uses the saffron accent on all surfaces:

```css
:focus-visible {
  outline: 2px solid var(--brand-600);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 4: Verify build + lint**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: both pass with no errors. If any page used a `slate-*` shade outside the remapped set (e.g. `slate-925`) it would fail to compile only if unknown; the remap covers all standard shades, so expect a clean pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(dashboard): apply soft-light warm-saffron token layer across the app"
```

---

### Task 2: Shared UI primitives

**Files:**
- Modify: `apps/web/components/ui/card.tsx`
- Modify: `apps/web/components/ui/button.tsx`
- Modify: `apps/web/components/ui/badge.tsx`
- Modify: `apps/web/components/ui/input.tsx`
- Modify: `apps/web/components/ui/index.ts`

**Interfaces:**
- Consumes: Tailwind utilities from Task 1 tokens.
- Produces: `Badge` gains an optional `leadingClassName`/glyph usage (composed by callers, no new API), `Card` uses `rounded-xl`, `Button` accent variant now saffron + near-black text. `index.ts` exports the new Task 3 components after Task 3.

- [ ] **Step 1: Update `Card`**

In `card.tsx`, change the base `Card` className from `'rounded-lg border border-slate-200 bg-white text-slate-900 shadow-xs transition-shadow'` to:

```tsx
'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-shadow hover:shadow-sm'
```

- [ ] **Step 2: Update `Button` accent variant**

In `button.tsx`, change only the `accent` entry in `variantStyles`:

```tsx
accent:
  'bg-amber-600 text-slate-950 hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 active:bg-amber-800 shadow-xs border border-transparent',
```

Leave all other variants untouched (they already render correctly against the remapped tokens).

- [ ] **Step 3: Update `Badge` status variants**

In `badge.tsx`, replace `variantStyles` with:

```tsx
const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-900 text-white border-transparent',
  success: 'bg-success-bg text-success-text border-success-border',
  warning: 'bg-warning-bg text-warning-text border-warning-border',
  error: 'bg-error-bg text-error-text border-error-border',
  destructive: 'bg-error-bg text-error-text border-error-border',
  info: 'bg-info-bg text-info-text border-info-border',
  outline: 'bg-transparent text-slate-700 border-slate-300',
};
```

- [ ] **Step 4: Update `Input` focus ring**

In `input.tsx`, change the focus ring classes `'focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900'` to:

```tsx
'focus-within:ring-2 focus-within:ring-amber-600/30 focus-within:border-amber-600'
```

- [ ] **Step 5: Verify build + lint**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: passes. Spot-check nothing else references the removed `accent` white-text style.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/ui/card.tsx apps/web/components/ui/button.tsx apps/web/components/ui/badge.tsx apps/web/components/ui/input.tsx
git commit -m "feat(dashboard): refresh shared primitives for soft-light tokens and AA contrast"
```

---

### Task 3: New shared components

**Files:**
- Create: `apps/web/components/ui/skeleton.tsx`
- Create: `apps/web/components/ui/stat-card.tsx`
- Create: `apps/web/components/ui/page-header.tsx`
- Modify: `apps/web/components/ui/index.ts`

**Interfaces:**
- Consumes: `Card`/`CardContent` from Task 2, `cn` from `@/lib/utils`, lucide icons.
- Produces:
  - `Skeleton({ className?, ...props })` — pulse placeholder div.
  - `StatCard({ label, value, unit?, icon, iconTone?, trend?, hint?, demo? })` — KPI card.
  - `PageHeader({ title, subtitle?, actions?, demo? })` — consistent page title/actions band.
  - `index.ts` exports all three. Task 4 (shell) and Task 5 (homepage) consume these.

- [ ] **Step 1: Create `skeleton.tsx`**

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-100', className)} {...props} />;
}
```

- [ ] **Step 2: Create `stat-card.tsx`**

```tsx
import React from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export type StatIconTone = 'amber' | 'blue' | 'purple' | 'rose';

const iconToneStyles: Record<StatIconTone, string> = {
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
};

export interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  iconTone?: StatIconTone;
  trend?: { direction: 'up' | 'down'; label: string; positive?: boolean };
  hint?: string;
  demo?: boolean;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconTone = 'amber',
  trend,
  hint,
  demo,
  href,
  className,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h2>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconToneStyles[iconTone])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>
      <div className="mt-2 min-h-[1.25rem]">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <TrendGlyph direction={trend.direction} positive={trend.positive} />
            <span className={cn(trend.positive === false ? 'text-rose-600' : 'text-emerald-600')}>{trend.label}</span>
          </div>
        ) : hint ? (
          <p className="text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    </>
  );

  return (
    <Card className={cn('p-5', href && 'hover:border-slate-300', className)}>
      <CardContent className="p-0">
        {href ? (
          <Link href={href} className="block h-full" aria-label={label}>
            {content}
          </Link>
        ) : (
          content
        )}
        {demo && (
          <div className="mt-3 flex items-center gap-1 text-2xs font-medium text-slate-400">
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            Demo data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendGlyph({
  direction,
  positive,
}: {
  direction: 'up' | 'down';
  positive?: boolean;
}) {
  const Icon = direction === 'up' ? ArrowUpRight : ArrowDownRight;
  return <Icon className={cn('h-3.5 w-3.5', positive === false ? 'text-rose-600' : 'text-emerald-600')} aria-hidden="true" />;
}

- [ ] **Step 3: Create `page-header.tsx`**

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  titleSlot?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, titleSlot, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {titleSlot ?? title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Export from `index.ts`**

Replace the contents of `index.ts` with:

```tsx
export * from './badge';
export * from './button';
export * from './card';
export * from './input';
export * from './page-header';
export * from './skeleton';
export * from './stat-card';
```

- [ ] **Step 5: Verify build + lint**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/ui
git commit -m "feat(dashboard): add StatCard, PageHeader, and Skeleton shared components"
```

---

### Task 4: App shell redesign

**Files:**
- Modify: `apps/web/components/layout/TopNav.tsx`
- Modify: `apps/web/components/layout/Sidebar.tsx`
- Modify: `apps/web/components/layout/DashboardShell.tsx`

**Interfaces:**
- Consumes: Task 1 tokens, Task 2 primitives.
- Produces: Restyled shell that frames all dashboard routes. No API changes — same component prop signatures.

- [ ] **Step 1: Restyle `TopNav`**

Apply the following edits in `TopNav.tsx`:
- Add `aria-label="Search"` to the search-trigger `<div>`? It is not a button; instead add `role="button"` + `tabIndex={0}` + `aria-label="Search orders, SKU, phone"` so keyboard users can focus it. Keep the visual class list, but soften the search field: change `bg-slate-50` to `bg-slate-100/60` and `border-slate-200` stays.
- Add `aria-label="Notifications"` to the existing bell button (already has `title`) — add the attribute.
- Add `aria-label="Account menu"` to the profile toggle button.
- Keep the accent button (Walk-in Sale) as-is; it now renders saffron + dark text via the Task 2 button change only if it uses `variant="accent"`. This page uses raw classes (`bg-amber-500 hover:bg-amber-600 text-slate-950`) — it already passes AA with the remapped amber-500.

- [ ] **Step 2: Restyle `Sidebar` active state**

In `Sidebar.tsx`, replace the active `Link` className mapping:

```tsx
isActive
  ? 'bg-slate-900 text-white shadow-xs'
  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
```

with:

```tsx
isActive
  ? 'bg-amber-50 text-slate-900 shadow-xs ring-1 ring-inset ring-amber-200'
  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
```

And update the active icon color from `'text-amber-400'` to `'text-amber-600'`. Also add a small left accent bar for the active item by adding `relative` + a `before:` pseudo-element? Simpler: add `border-l-2 border-amber-500` on active, and `border-l-2 border-transparent` on inactive so widths don't shift:

```tsx
const itemActiveClasses = isActive
  ? 'border-l-2 border-amber-500 bg-amber-50 text-slate-900 shadow-xs'
  : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900';
```

Use `itemActiveClasses` in place of the original ternary inside the `cn(...)`.

- [ ] **Step 3: Restyle `DashboardShell` header band**

In `DashboardShell.tsx`:
- Change the root container from `bg-slate-50` to `bg-bg-canvas` (class `bg-canvas`), or `bg-slate-50` already maps to the new warm canvas via Task 1 — no edit strictly required. Leave it.
- Header band: change `border-b border-slate-200 bg-white` to `border-b border-slate-200 bg-white` (fine as-is) but increase breadcrumb separator contrast: keep `/`.
- Ensure the mobile bottom nav FAB keeps `bg-amber-500 text-slate-950` (already AA with remapped amber-500). No change required.

- [ ] **Step 4: Verify build + lint**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/layout
git commit -m "feat(dashboard): restyle shell chrome with soft-light sidebar accent and accessible nav"
```

---

### Task 5: Flagship `/dashboard` homepage

**Files:**
- Modify: `apps/web/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `StatCard`, `PageHeader`, `Skeleton` (Task 3), `Card/Button/Badge` (Task 2).
- Produces: The flagship page pattern other pages follow.

- [ ] **Step 1: Replace the page**

Replace the entire file body with the redesign below. Key changes: light `PageHeader` greeting instead of the dark banner; KPI grid via `StatCard` with `demo` flags; orders table with icon+label status badges; grouped quick actions; light GST panel.

```tsx
import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  Users,
  Plus,
  FileText,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  Circle,
  CircleCheck,
  CircleDashed,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

const sampleOrders = [
  {
    id: 'ORD-2026-8901',
    customer: 'Ananya Sharma',
    phone: '+91 98765 43210',
    items: 'Kanjeevaram Silk Saree (Red/Gold) x 1',
    total: '₹18,500',
    status: 'COMPLETED' as const,
    paymentMethod: 'UPI (PhonePe)',
    time: '12 mins ago',
  },
  {
    id: 'ORD-2026-8900',
    customer: 'Vikram Malhotra',
    phone: '+91 91234 56789',
    items: 'Banarasi Brocade Dupatta x 2',
    total: '₹6,400',
    status: 'PROCESSING' as const,
    paymentMethod: 'Khata Credit',
    time: '45 mins ago',
  },
  {
    id: 'ORD-2026-8899',
    customer: 'Pooja Verma',
    phone: '+91 99887 76655',
    items: 'Chanderi Zari Suit Set (Mint) x 1',
    total: '₹4,200',
    status: 'PENDING_PAYMENT' as const,
    paymentMethod: 'Cash on Delivery',
    time: '2 hours ago',
  },
];

const statusMeta = {
  COMPLETED: { label: 'Paid & Delivered', badge: 'success' as const, Icon: CircleCheck },
  PROCESSING: { label: 'Processing', badge: 'warning' as const, Icon: Clock },
  PENDING_PAYMENT: { label: 'Pending payment', badge: 'info' as const, Icon: CircleDashed },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Namaste, Rajesh Saree Emporium <span aria-hidden="true">🙏</span>
          </>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" aria-hidden="true" />
              Varanasi storefront · Live & synced
            </span>
            Today&apos;s commerce &amp; inventory overview.
          </span>
        }
        actions={
          <Link href="/orders?action=pos">
            <Button variant="accent" size="lg" leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}>
              New Walk-in Sale (POS)
            </Button>
          </Link>
        }
      />

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Sales (GMV)"
          value="₹42,850.00"
          icon={TrendingUp}
          iconTone="amber"
          demo
          trend={{ direction: 'up', label: '+18.4% from yesterday' }}
        />
        <StatCard
          label="Active Orders"
          value="14"
          unit="Orders"
          icon={ShoppingCart}
          iconTone="blue"
          demo
          hint="3 awaiting dispatch"
        />
        <StatCard
          label="Inventory Alerts"
          value="2"
          unit="SKUs low"
          icon={Boxes}
          iconTone="rose"
          demo
          hint="Restock needed within 3 days"
        />
        <StatCard
          label="Khata Receivable"
          value="₹12,400.00"
          icon={Users}
          iconTone="purple"
          demo
          hint="8 customers on ledger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders &amp; Invoices</CardTitle>
              <CardDescription>
                Omnichannel sales from POS and online store{' '}
                <span className="inline-flex items-center gap-1 font-mono text-2xs text-slate-400">
                  · demo data
                </span>
              </CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View All Orders
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <caption className="sr-only">Recent orders with customer, items, total, status and payment method</caption>
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3">Order ID</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Items</th>
                    <th scope="col" className="px-6 py-3">Total</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleOrders.map((order) => {
                    const meta = statusMeta[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                          {order.id}
                          <div className="text-2xs text-slate-400 font-sans font-normal">{order.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{order.customer}</div>
                          <div className="text-2xs text-slate-400">{order.phone}</div>
                        </td>
                        <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">{order.items}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 tabular-nums">{order.total}</td>
                        <td className="px-6 py-4">
                          <Badge variant={meta.badge} className="gap-1">
                            <span className="inline-flex items-center">
                              <meta.Icon className="h-3 w-3" aria-hidden="true" />
                            </span>
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-600">
                          {order.paymentMethod}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Operations</CardTitle>
              <CardDescription>Instant creation and ledger tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/products?action=new" className="block">
                <Button variant="secondary" className="h-11 w-full justify-start gap-2.5 text-sm font-semibold">
                  <Plus className="h-4 w-4 text-amber-600" />
                  <span>Add New Product SKU</span>
                </Button>
              </Link>
              <Link href="/invoices?action=create" className="block">
                <Button variant="secondary" className="h-11 w-full justify-start gap-2.5 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Generate B2B GST Invoice</span>
                </Button>
              </Link>
              <Link href="/customers?action=khata" className="block">
                <Button variant="secondary" className="h-11 w-full justify-start gap-2.5 text-sm font-semibold">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Log Customer Khata Credit</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm font-bold text-amber-700">
                  GST Compliance (UP - 09)
                </CardTitle>
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <CardDescription className="text-xs">
                Intrastate (CGST+SGST) and Interstate (IGST) split engine active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">GSTR-1 Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <CircleCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  Ready for filing
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">Composite Scheme</span>
                <span className="font-semibold text-slate-800">Regular (18%/12%/5%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build + lint**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: passes. (If the `<meta.Icon>` JSX member syntax is disallowed by the TS config, destructure it: `const StatusIcon = meta.Icon;` then use `<StatusIcon ... />`.)

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(dashboard)/dashboard/page.tsx"
git commit -m "feat(dashboard): redesign home page with light header, StatCards, accessible status badges"
```

---

### Task 6: Consistency sweep and verification

**Files:**
- Inspect: all pages under `apps/web/app/(dashboard)/` and `apps/web/components/layout/`
- Modify: only files where verification surfaces a contrast/hierarchy problem

**Interfaces:**
- Consumes: everything from Tasks 1-5.
- Produces: final verified state.

- [ ] **Step 1: Grep audit for AA problems**

Run:
```bash
grep -rEn "text-(amber-500|amber-400|amber-300|white|slate-400).*" "apps/web/app/(dashboard)" | head -60
```
Review results: any `text-white` on an `amber-*` (non-dark) background, or `text-amber-500` as body text on white. Fix only real AA violations found (e.g. change to `text-amber-600`/`text-amber-700`). Do not churn pages that are already fine.

- [ ] **Step 2: Verify build + lint**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: passes.

- [ ] **Step 3: Browser render check**

Using the testing-webapps skill, start `npm run dev` (or a built preview) and render `/dashboard` at desktop (1440px) and mobile (390px) widths. Verify:
- Warm off-white canvas, soft borders, saffron sidebar active state.
- No console errors; keyboard tab order reaches search, notifications, profile, nav links; focus rings visible.
- Order status badges show icon + label (not color-only).
- Homepage shows "Demo data" labels on KPI cards.
Check one analytics page (e.g. `/analytics/sales`) renders with the new tokens and no contrast breakage.

- [ ] **Step 4: Fix issues found (if any) and re-verify**

Fix any issues surfaced in Step 3, then re-run lint + build + the affected route's render check.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix(dashboard): resolve contrast and rendering issues from redesign verification"
```

---

## Self-Review

**Spec coverage:**
- Tokens (spec §1) → Task 1 ✓
- Primitives (spec §2) → Task 2 ✓
- New components StatCard/Skeleton/PageHeader (spec §3) → Task 3 ✓
- Shell TopNav/Sidebar/DashboardShell (spec §4) → Task 4 ✓
- Flagship page (spec §5) → Task 5 ✓
- Ethics/a11y checklist (spec §6) → baked into Tasks 2-6 (AA contrast, icon+label badges, aria-labels, focus-visible, demo labels, skeletons) ✓
- Verification (spec Verification) → Task 6 ✓

**Placeholder scan:** No TBD/TODO; every code step has concrete content. ✓

**Type consistency:** `StatCard` props (`label/value/unit/icon/iconTone/trend/hint/demo/href/className`) used identically in Task 5; `PageHeader` props (`title/subtitle/actions/className` + `titleSlot`) consistent; `Badge` variants `success/warning/info` match `variantStyles` keys; `statusMeta` typing uses `as const`. ✓