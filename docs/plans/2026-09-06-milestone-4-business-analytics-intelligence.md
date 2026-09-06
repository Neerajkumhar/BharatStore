# Milestone 4: Business Analytics & Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform BharatStore’s real transactional data (Orders, Payments, Products, InventoryLedger, Customers, KhataLedger) into a professional, real-time Business Intelligence dashboard for small-business owners.

**Architecture:** Server-aggregated analytics REST APIs under `/api/analytics/*` with ambient tenant isolation (`getTenantDb`). IST (Asia/Kolkata, UTC+5:30) date range calculations with previous period comparisons. React dashboard UI at `/dashboard/analytics` with tabbed navigation (Overview, Sales, Products, Customers, Inventory, Payments, Khata, Reports) and business alerts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma ORM 6, Tailwind CSS v4, Zod, Vitest.

**Spec:** [BHARATSTORE_MASTER_BLUEPRINT.md](../../BHARATSTORE_MASTER_BLUEPRINT.md)

## Global Constraints

- Version Floors: Node.js >= 20.0, Next.js 15.1, React 19.0, Prisma 6.4, TypeScript 5.7
- Naming Rules: CamelCase for variables/functions, PascalCase for components, snake_case for DB columns
- Design Tokens: Primary Slate (`#0f172a`), Saffron Accent (`#f59e0b`), Baseline grid 4px spacing
- Tenant Isolation: Every analytics query MUST be scoped to the authenticated tenant context (`getTenantDb(tenantId)`). No client-provided tenantId overrides.
- Timezone & Dates: IST (Asia/Kolkata, UTC+5:30) date boundaries for "Today", "7 Days", "30 Days", "90 Days", "This Year", and custom date ranges.
- Real Data Only: 0 fabricated numbers. All metrics calculated directly from database records with polished empty states for new tenants.

---

### Task 1: Date Range & Timezone Analytics Utilities & Unit Tests

**Files:**
- Create: `packages/shared/src/utils/analytics-date.ts`
- Create: `packages/database/src/analytics.test.ts`
- Modify: `packages/shared/src/utils/index.ts`

**Interfaces:**
- Consumes: Query string date range parameters (`range`: `today`, `7d`, `30d`, `90d`, `this_year`, `custom`; `startDate`, `endDate`)
- Produces: `getAnalyticsDateRange()` returning `{ currentStart, currentEnd, previousStart, previousEnd, periodLabel }` in IST boundaries.

- [ ] **Step 1: Build IST Date Range Calculation Utility**
  Create `packages/shared/src/utils/analytics-date.ts`:
  Calculates exact start and end `Date` objects in IST for current period and previous equivalent period for comparison.

- [ ] **Step 2: Export utility from barrels**
  Update `packages/shared/src/utils/index.ts`.

- [ ] **Step 3: Write Analytics & Tenant Isolation Unit Tests**
  Create `packages/database/src/analytics.test.ts`:
  Tests date calculations, revenue calculation, previous period comparisons, and verifies Tenant A cannot access Tenant B's analytics.

- [ ] **Step 4: Run unit tests**
  Run: `npm run test --workspace=packages/database`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run: `git add packages/shared packages/database && git commit -m "feat(analytics): add IST date range calculation engine and analytics tenant isolation tests"`

---

### Task 2: Server-Side Analytics Aggregation REST APIs

**Files:**
- Create: `apps/web/app/api/analytics/overview/route.ts`
- Create: `apps/web/app/api/analytics/sales/route.ts`
- Create: `apps/web/app/api/analytics/products/route.ts`
- Create: `apps/web/app/api/analytics/customers/route.ts`
- Create: `apps/web/app/api/analytics/inventory/route.ts`
- Create: `apps/web/app/api/analytics/payments/route.ts`
- Create: `apps/web/app/api/analytics/khata/route.ts`
- Create: `apps/web/app/api/analytics/alerts/route.ts`

**Interfaces:**
- Consumes: Scoped Prisma DB (`getTenantDb`), `getAnalyticsDateRange`
- Produces: Server-aggregated JSON endpoints for Overview, Sales, Products, Customers, Inventory, Payments, Khata, and Business Alerts.

- [ ] **Step 1: Create Overview Analytics API**
  `GET /api/analytics/overview`: Computes top KPIs (Revenue, Orders, AOV, Customers, Outstanding Khata, Items Sold) for current vs previous period with percentage changes.

- [ ] **Step 2: Create Sales Analytics API**
  `GET /api/analytics/sales`: Computes daily/weekly/monthly revenue trends, orders over time, channel breakdown (`POS_COUNTER`, `STOREFRONT`, `WHATSAPP`), and payment method distribution.

- [ ] **Step 3: Create Product & Category Analytics API**
  `GET /api/analytics/products`: Computes top selling products, revenue by SKU, low performing SKUs, and category revenue/units breakdown.

- [ ] **Step 4: Create Customer Analytics API**
  `GET /api/analytics/customers`: Computes LTV, new vs returning customer growth, top buyers, and dynamic behavior segmentation.

- [ ] **Step 5: Create Inventory Analytics API**
  `GET /api/analytics/inventory`: Computes total stock units, inventory valuation at cost/mrp, stock movements (`INWARD`, `SALE`, `DAMAGE`, `RETURN`), fast & slow moving products.

- [ ] **Step 6: Create Khata & Payment Analytics APIs**
  `GET /api/analytics/khata` & `GET /api/analytics/payments`: Credit sales vs cash collections, payment status breakdown (`SUCCESS`, `INITIATED`, `FAILED`).

- [ ] **Step 7: Create Business Alerts API**
  `GET /api/analytics/alerts`: Actionable alerts for low stock, out of stock, high Khata balance, and unfulfilled orders.

- [ ] **Step 8: Commit**
  Run: `git add apps/web/app/api/analytics && git commit -m "feat(api): add server-side analytics REST aggregation endpoints"`

---

### Task 3: Analytics Layout & Header Date Filter Controls

**Files:**
- Create: `apps/web/app/(dashboard)/analytics/layout.tsx`
- Create: `apps/web/components/analytics/analytics-header.tsx`
- Modify: `apps/web/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: Dashboard shell, active path navigation
- Produces: Analytics layout with tabbed navigation (Overview, Sales, Products, Customers, Inventory, Payments, Khata, Reports) and date range filter header.

- [ ] **Step 1: Add Analytics Link to Sidebar navigation**
  Update `apps/web/components/layout/Sidebar.tsx` to include "Analytics BI" in Overview group.

- [ ] **Step 2: Create Analytics Header Component**
  Create `apps/web/components/analytics/analytics-header.tsx` with date preset pills (Today, 7D, 30D, 90D, This Year, Custom) and tab navigation.

- [ ] **Step 3: Create Analytics Sub-layout**
  Create `apps/web/app/(dashboard)/analytics/layout.tsx`.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): implement analytics sub-layout and date range filter controls"`

---

### Task 4: Analytics Overview & Business Alerts UI

**Files:**
- Create: `apps/web/app/(dashboard)/analytics/page.tsx`
- Create: `apps/web/components/analytics/kpi-card.tsx`
- Create: `apps/web/components/analytics/business-alerts.tsx`

**Interfaces:**
- Consumes: `/api/analytics/overview`, `/api/analytics/alerts`
- Produces: Executive Overview screen with KPI cards, percentage growth indicators, and actionable business alerts.

- [ ] **Step 1: Build KPI Card Primitive**
  Create `apps/web/components/analytics/kpi-card.tsx` supporting numerical formatting, tabular figures, trend badge (+14.2% vs previous period), and loading skeleton.

- [ ] **Step 2: Build Business Alerts Panel**
  Create `apps/web/components/analytics/business-alerts.tsx` displaying actionable alerts (Low Stock, High Khata, Unpaid Orders) with direct links.

- [ ] **Step 3: Build Overview Dashboard Page**
  Create `apps/web/app/(dashboard)/analytics/page.tsx`.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): build executive analytics overview page and business alerts panel"`

---

### Task 5: Sales, Product & Category Analytics Views

**Files:**
- Create: `apps/web/app/(dashboard)/analytics/sales/page.tsx`
- Create: `apps/web/app/(dashboard)/analytics/products/page.tsx`
- Create: `apps/web/components/analytics/sales-charts.tsx`

**Interfaces:**
- Consumes: `/api/analytics/sales`, `/api/analytics/products`
- Produces: Sales performance graphs, channel & payment distributions, top/low product SKU rankings linking to existing product context.

- [ ] **Step 1: Build Sales Charts & Visual Distribution Component**
  Create `apps/web/components/analytics/sales-charts.tsx` with responsive bar/line visualizers for revenue trend, sales channel breakdown, and payment distribution.

- [ ] **Step 2: Build Sales Analytics Page**
  Create `apps/web/app/(dashboard)/analytics/sales/page.tsx`.

- [ ] **Step 3: Build Product & Category Performance Analytics Page**
  Create `apps/web/app/(dashboard)/analytics/products/page.tsx` with sorting by Revenue, Units, Orders.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): build sales trend charts and product performance analytics"`

---

### Task 6: Customer, Inventory, Payments & Khata Analytics Views

**Files:**
- Create: `apps/web/app/(dashboard)/analytics/customers/page.tsx`
- Create: `apps/web/app/(dashboard)/analytics/inventory/page.tsx`
- Create: `apps/web/app/(dashboard)/analytics/khata/page.tsx`
- Create: `apps/web/app/(dashboard)/analytics/payments/page.tsx`

**Interfaces:**
- Consumes: `/api/analytics/customers`, `/api/analytics/inventory`, `/api/analytics/khata`, `/api/analytics/payments`
- Produces: Customer cohort LTV analytics, inventory valuation & movement trends, Khata credit vs collections, payment gateway success/failure reports.

- [ ] **Step 1: Build Customer Insights Page**
  Create `apps/web/app/(dashboard)/analytics/customers/page.tsx` with dynamic segmentation (New, Returning, High Value, Inactive).

- [ ] **Step 2: Build Inventory Analytics Page**
  Create `apps/web/app/(dashboard)/analytics/inventory/page.tsx` with stock movement audit breakdown.

- [ ] **Step 3: Build Khata Credit Analytics Page**
  Create `apps/web/app/(dashboard)/analytics/khata/page.tsx` with credit sales vs cash collections.

- [ ] **Step 4: Build Payments Analytics Page**
  Create `apps/web/app/(dashboard)/analytics/payments/page.tsx`.

- [ ] **Step 5: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): build customer, inventory, khata, and payment analytics screens"`

---

### Task 7: Business Reports & Monorepo Build Verification

**Files:**
- Create: `apps/web/app/(dashboard)/analytics/reports/page.tsx`

**Interfaces:**
- Consumes: All analytics APIs
- Produces: Unified business reports tab (Sales, Orders, Product Performance, Customer, Inventory Movement, Khata Outstanding, Payments) with clean tabular layouts.

- [ ] **Step 1: Build Business Reports Page**
  Create `apps/web/app/(dashboard)/analytics/reports/page.tsx` with report type switcher.

- [ ] **Step 2: Verify monorepo build**
  Run: `npm run build`
  Expected: Clean compilation with 0 errors across all static/dynamic pages.

- [ ] **Step 3: Run full test suite**
  Run: `npm run test --workspace=packages/database`
  Expected: All 17 existing tests + new analytics tests PASS.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(reports): implement business report views and verify production build"`
