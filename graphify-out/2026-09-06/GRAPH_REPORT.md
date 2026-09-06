# Graph Report - BharatStore  (2026-09-06)

## Corpus Check
- 141 files · ~93,429 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 754 nodes · 1214 edges · 50 communities (39 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fba3833d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- button.tsx
- schemas/auth.ts
- scripts
- 7. Screen Architecture
- authorizeRequest
- dependencies
- 3.1 Detailed Module Breakdown (18 Core Modules)
- BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core
- scripts
- login/route.ts
- compilerOptions
- onboarding/page.tsx
- shared/package.json
- web/tsconfig.json
- 13. Security Architecture
- 15. Development Roadmap
- BharatStore — Product & Technical Blueprint
- database/tsconfig.json
- shared/tsconfig.json
- Global Constraints
- 6. UI/UX Design System
- 8. User Flows
- 9. Technical Architecture
- 10. Multi-Tenant Architecture
- 5. Application Navigation
- 11. Database Entity Model
- 1. Product Vision
- 12. API Architecture
- 2. User Types
- seed.ts
- app/layout.tsx
- next.config.mjs
- next-env.d.ts
- kpi-card.tsx
- Global Constraints
- Global Constraints
- Global Constraints
- reports/page.tsx
- DashboardShell.tsx
- [slug]/layout.tsx
- staff/page.tsx
- StorefrontSettingsPage
- audit/page.tsx
- security/page.tsx
- SettingsPage

## God Nodes (most connected - your core abstractions)
1. `authorizeRequest()` - 58 edges
2. `getTenantDb()` - 48 edges
3. `prisma` - 37 edges
4. `7. Screen Architecture` - 28 edges
5. `PERMISSIONS` - 26 edges
6. `cn()` - 24 edges
7. `BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core` - 24 edges
8. `Button` - 19 edges
9. `3.1 Detailed Module Breakdown (18 Core Modules)` - 19 edges
10. `BharatStore — Product & Technical Blueprint` - 18 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `calculateGstTaxSplit()`  [EXTRACTED]
  apps/web/app/api/store/[slug]/checkout/route.ts → packages/shared/src/utils/tax.ts
- `GET()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/admin/storefront/route.ts → packages/database/src/client.ts
- `PUT()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/admin/storefront/route.ts → packages/database/src/client.ts
- `GET()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/analytics/alerts/route.ts → packages/database/src/client.ts
- `GET()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/analytics/customers/route.ts → packages/database/src/client.ts

## Import Cycles
- None detected.

## Communities (50 total, 11 thin omitted)

### Community 0 - "button.tsx"
Cohesion: 0.07
Nodes (44): sampleOrders, AnalyticsHeader(), analyticsTabs, dateRanges, CustomerModal(), CustomerModalProps, KhataPaymentModal(), KhataPaymentModalProps (+36 more)

### Community 1 - "schemas/auth.ts"
Cohesion: 0.29
Nodes (6): LoginInput, LoginSchema, OnboardBusinessInput, OnboardBusinessSchema, RegisterInput, RegisterSchema

### Community 2 - "scripts"
Cohesion: 0.06
Nodes (30): dependencies, bcryptjs, @prisma/client, devDependencies, prisma, tsx, @types/bcryptjs, @types/node (+22 more)

### Community 3 - "7. Screen Architecture"
Cohesion: 0.07
Nodes (28): 7.10 Categories (`/dashboard/categories`), 7.11 Inventory (`/dashboard/inventory`), 7.12 Inventory Details (drawer `/dashboard/inventory/[id]`), 7.13 Orders (`/dashboard/orders`), 7.14 Order Details (`/dashboard/orders/[id]`), 7.15 Customers (`/dashboard/customers`), 7.16 Customer Details (`/dashboard/customers/[id]`), 7.17 Payments (`/dashboard/payments`) (+20 more)

### Community 4 - "authorizeRequest"
Cohesion: 0.05
Nodes (59): GET(), GET(), DELETE(), PUT(), GET(), POST(), GET(), PUT() (+51 more)

### Community 5 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, bcryptjs, @bharatstore/database, @bharatstore/shared, clsx, jose, lucide-react, next (+40 more)

### Community 6 - "3.1 Detailed Module Breakdown (18 Core Modules)"
Cohesion: 0.04
Nodes (44): 10. Database Entity Model & Relational Schema, 10. Payments & UPI Engine, 11. Invoices & GST Compliance, 11. Preliminary REST API Specification, 12. Security Architecture & Threat Defense, 12. Storefront Engine & Theme Builder, 13. Marketing & Customer Engagement, 13. Repository Structure (+36 more)

### Community 7 - "BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core"
Cohesion: 0.08
Nodes (24): BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core, File Structure Map, Out of Scope (Deferred to Future Plans), Plan Completion Criteria, Task 10: Tailwind Tokens, Button Classes & UI Primitives, Task 11: CI Pipeline & Dev Runbook, Task 12: Password, Session & Email Libraries, Task 13: Auth Service & Routes (+16 more)

### Community 8 - "scripts"
Cohesion: 0.08
Nodes (24): dependencies, bcryptjs, devDependencies, typescript, bcryptjs, typescript, name, private (+16 more)

### Community 9 - "login/route.ts"
Cohesion: 0.18
Nodes (15): loginSchema, POST(), POST(), registerSchema, getJwtSecret(), SESSION_COOKIE_NAME, signJWT(), UserSessionPayload (+7 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): DOM, DOM.Iterable, ESNext, compilerOptions, allowJs, declaration, declarationMap, esModuleInterop (+11 more)

### Community 12 - "shared/package.json"
Cohesion: 0.11
Nodes (17): dependencies, zod, devDependencies, typescript, exports, ./constants, ./schemas, ./types (+9 more)

### Community 13 - "web/tsconfig.json"
Cohesion: 0.15
Nodes (12): compilerOptions, paths, plugins, exclude, extends, include, ../../tsconfig.base.json, next-env.d.ts (+4 more)

### Community 14 - "13. Security Architecture"
Cohesion: 0.15
Nodes (13): 13.10 HTTP Security, 13.11 Secrets, 13.12 Backups & Recovery, 13.1 Passwords, 13.2 Tokens & Sessions, 13.3 Authentication, 13.4 Authorization & RBAC, 13.5 Tenant Isolation (recap) (+5 more)

### Community 15 - "15. Development Roadmap"
Cohesion: 0.17
Nodes (12): 15. Development Roadmap, M0 — Foundations (wk 1–2), M10 — Hardening & Launch (wk 12–14), M1 — Auth & Tenant Core (wk 2–3), M2 — Products & Categories (wk 3–4), M3 — Inventory (wk 4–5), M4 — Storefront (wk 5–6), M5 — Orders & Payments (wk 6–8) (+4 more)

### Community 16 - "BharatStore — Product & Technical Blueprint"
Cohesion: 0.18
Nodes (10): 14. Repository Structure, 16. Risks and Technical Considerations, 3.1 Module Breakdown, 3.2 Cross-Cutting Concerns, 3. Feature Architecture, 4.1 Sitemap, 4.2 Navigation Grouping, 4. Information Architecture (+2 more)

### Community 17 - "database/tsconfig.json"
Cohesion: 0.18
Nodes (10): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*, ../../tsconfig.base.json (+2 more)

### Community 18 - "shared/tsconfig.json"
Cohesion: 0.22
Nodes (8): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*, ../../tsconfig.base.json

### Community 19 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Milestone 1: Foundations, Auth, Multi-Tenancy Shell & Design System Implementation Plan, Task 1: Docker Services & Database Setup, Task 2: Database Seeding & Multi-Tenant Verification, Task 3: Design Tokens & UI Component Primitives, Task 4: Authentication Handlers & Tenant Middleware, Task 5: App Shell Layout & Dashboard Landing

### Community 20 - "6. UI/UX Design System"
Cohesion: 0.29
Nodes (7): 6.1 Visual Identity, 6.2 Design Tokens (globals.css :root), 6.3 Typography, 6.4 Spacing & Density, 6.5 Components, 6.6 Motion, 6. UI/UX Design System

### Community 21 - "8. User Flows"
Cohesion: 0.29
Nodes (7): 8.1 New Business Registration → Published Store, 8.2 Receive Order → Fulfill → Invoice → Inventory, 8.3 Add Product (full), 8.4 Staff Invitation → Role Assignment → First Login, 8.5 Login → Tenant Resolution → Authorization → Dashboard, 8.6 Payment Reconciliation (Razorpay webhook), 8. User Flows

### Community 22 - "9. Technical Architecture"
Cohesion: 0.29
Nodes (7): 9.1 System Context Diagram, 9.2 Request/Response Lifecycle, 9.3 Real-time Updates, 9.4 Background Jobs (BullMQ), 9.5 Technology Decisions & Rationale, 9.6 Development Environment, 9. Technical Architecture

### Community 23 - "10. Multi-Tenant Architecture"
Cohesion: 0.33
Nodes (6): 10.1 Model, 10.2 Tenant Identification & Resolution, 10.3 Database Isolation (defense in depth), 10.4 Preventing Cross-Tenant Leakage, 10.5 Authorization inside a tenant, 10. Multi-Tenant Architecture

### Community 24 - "5. Application Navigation"
Cohesion: 0.33
Nodes (6): 5.1 Authenticated App Shell (Desktop), 5.2 Responsive / Mobile Navigation, 5.3 Page Header Pattern, 5.4 Global Search, 5.5 Notifications, 5. Application Navigation

### Community 25 - "11. Database Entity Model"
Cohesion: 0.40
Nodes (5): 11.1 Global Tables (non-tenant), 11.2 Tenant Tables (all carry `business_id`, RLS on), 11.3 Key Relationships, 11.4 Integrity & Indexes, 11. Database Entity Model

### Community 26 - "1. Product Vision"
Cohesion: 0.40
Nodes (5): 1.1 The Problem, 1.2 The Vision, 1.3 Key Differentiators, 1.4 Product Principles, 1. Product Vision

### Community 27 - "12. API Architecture"
Cohesion: 0.50
Nodes (4): 12.1 Conventions, 12.2 Endpoints by Module, 12.3 Error codes, 12. API Architecture

### Community 28 - "2. User Types"
Cohesion: 0.50
Nodes (4): 2.1 Personas, 2.2 Role Model, 2.3 Permission Matrix, 2. User Types

### Community 37 - "kpi-card.tsx"
Cohesion: 0.06
Nodes (17): CustomersContent(), InventoryContent(), KhataContent(), OverviewData, ProductData, SalesData, PaymentsContent(), ProductsContent() (+9 more)

### Community 38 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Milestone 2: Product Catalog, Variants, HSN Tax Mapping & Double-Entry Inventory Ledger Implementation Plan, Task 1: Shared Schemas & GST HSN Rate Constants, Task 2: API Endpoints for Categories & Product Catalog Management, Task 3: Double-Entry Inventory Ledger & Stock Adjustment API, Task 4: Product Catalog Management UI Pages, Task 5: Add/Edit Product & Variant Matrix Generator UI, Task 6: Double-Entry Inventory Ledger Management UI

### Community 40 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Global Constraints, Milestone 4: Business Analytics & Intelligence Implementation Plan, Task 1: Date Range & Timezone Analytics Utilities & Unit Tests, Task 2: Server-Side Analytics Aggregation REST APIs, Task 3: Analytics Layout & Header Date Filter Controls, Task 4: Analytics Overview & Business Alerts UI, Task 5: Sales, Product & Category Analytics Views, Task 6: Customer, Inventory, Payments & Khata Analytics Views (+1 more)

### Community 41 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Milestone 3: Omnichannel Orders, Customer Directory, Khata Ledger & Counter POS Terminal Implementation Plan, Task 1: Shared Schemas & GST Tax Calculation Engine, Task 2: API Endpoints for Omnichannel Checkout, Customers & Khata Ledger, Task 3: Customer Directory & Khata Ledger UI, Task 4: Counter POS Terminal Interface, Task 5: Omnichannel Orders & GST Invoice Management UI

### Community 45 - "DashboardShell.tsx"
Cohesion: 0.21
Nodes (7): DashboardShell(), DashboardShellProps, NavGroup, navigationGroups, NavItem, Sidebar(), TopNav()

### Community 47 - "[slug]/layout.tsx"
Cohesion: 0.11
Nodes (16): indianStates, StorefrontCheckoutPage(), CartContext, CartContextType, CartItem, CartProvider(), useCart(), CartDrawer() (+8 more)

## Knowledge Gaps
- **364 isolated node(s):** `OverviewData`, `SalesData`, `ProductData`, `AuditLogEntry`, `sampleOrders` (+359 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `button.tsx` to `DashboardShell.tsx`, `kpi-card.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `prisma` connect `authorizeRequest` to `login/route.ts`, `[slug]/layout.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `BharatStore — Product & Technical Blueprint` connect `BharatStore — Product & Technical Blueprint` to `7. Screen Architecture`, `13. Security Architecture`, `15. Development Roadmap`, `6. UI/UX Design System`, `8. User Flows`, `9. Technical Architecture`, `10. Multi-Tenant Architecture`, `5. Application Navigation`, `11. Database Entity Model`, `1. Product Vision`, `12. API Architecture`, `2. User Types`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `OverviewData`, `SalesData`, `ProductData` to the rest of the system?**
  _364 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06964443138407288 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `7. Screen Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._