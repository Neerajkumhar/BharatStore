# Milestone 1: Foundations, Auth, Multi-Tenancy Shell & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish local development database & containers, run database migrations and seed data, verify tri-layer tenant isolation, configure Tailwind v4 design system tokens, build authentication handlers, and construct the authenticated App Shell layout.

**Architecture:** Next.js 15 App Router monorepo frontend with Tailwind v4 "Vedic Industrial" design tokens, Prisma ORM with automatic tenant-query extensions and PostgreSQL multi-tenancy, alongside JWT session verification and ambient tenant context middleware.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma ORM 6, PostgreSQL 16, Redis 7, Tailwind CSS v4, Zod, Argon2id / bcrypt.

**Spec:** [BHARATSTORE_MASTER_BLUEPRINT.md](../../BHARATSTORE_MASTER_BLUEPRINT.md)

## Global Constraints

- Version Floors: Node.js >= 20.0, Next.js 15.1, React 19.0, Prisma 6.4, TypeScript 5.7
- Naming Rules: CamelCase for variables/functions, PascalCase for components, snake_case for DB columns
- Design Tokens: Primary Slate (`#0f172a`), Saffron Accent (`#f59e0b`), Baseline grid 4px spacing
- Tenant Isolation: Every DB model must be scoped via `tenantId` and accessed through `getTenantDb(tenantId)`

---

### Task 1: Docker Services & Database Setup

**Files:**
- Create/Modify: `docker/docker-compose.yml`
- Modify: `packages/database/prisma/schema.prisma`
- Modify: `packages/database/src/client.ts`
- Test: `packages/database/src/client.test.ts`

**Interfaces:**
- Consumes: PostgreSQL connection string from `.env`
- Produces: Generated Prisma Client & verified local Postgres 16 / Redis 7 containers

- [ ] **Step 1: Start Docker infrastructure**
  Run: `npm run docker:up`
  Expected: Containers `bharatstore_postgres` and `bharatstore_redis` running cleanly.

- [ ] **Step 2: Generate Prisma client and push schema**
  Run: `npm run db:generate && npm run db:push`
  Expected: Schema synced to PostgreSQL without errors.

- [ ] **Step 3: Write test verifying database client connection and tenant scoping**
  Create `packages/database/src/client.test.ts`:
  ```typescript
  import { getTenantDb } from './client';

  describe('Tenant Database Isolation', () => {
    it('throws error when tenantId is empty', () => {
      expect(() => getTenantDb('')).toThrow('[Security Exception]');
    });
  });
  ```

- [ ] **Step 4: Run database tests**
  Run: `npx vitest run packages/database/src/client.test.ts` or `node` check.
  Expected: PASS

- [ ] **Step 5: Commit**
  Run: `git add . && git commit -m "feat(database): spin up postgres/redis and verify prisma client"`

---

### Task 2: Database Seeding & Multi-Tenant Verification

**Files:**
- Create/Modify: `packages/database/seed/seed.ts`
- Modify: `packages/database/package.json`

**Interfaces:**
- Consumes: Prisma models for User, Tenant, Role, UserTenant, Product, Category
- Produces: 2 distinct seeded tenants (`rajesh-fabrics` and `varanasi-sarees`), sample products, users with Owner/Admin/Manager/Staff roles.

- [ ] **Step 1: Write seed script creating sample tenants and RBAC seed data**
  Edit `packages/database/seed/seed.ts` to insert test tenants, users, roles, categories, and products with bcrypt password hashes (`Password@123`).

- [ ] **Step 2: Execute database seed**
  Run: `npm run db:seed`
  Expected: Success output with seeded summary.

- [ ] **Step 3: Commit**
  Run: `git add packages/database && git commit -m "feat(database): add comprehensive seed script with 2 sample tenants"`

---

### Task 3: Design Tokens & UI Component Primitives

**Files:**
- Modify: `apps/web/app/globals.css`
- Create: `apps/web/components/ui/button.tsx`
- Create: `apps/web/components/ui/input.tsx`
- Create: `apps/web/components/ui/card.tsx`
- Create: `apps/web/components/ui/badge.tsx`

**Interfaces:**
- Consumes: Tailwind v4 theme variables from `globals.css`
- Produces: Reusable UI primitives adhering to the "Vedic Industrial" design tokens.

- [ ] **Step 1: Configure CSS variables in globals.css**
  Define `--brand-50` through `--brand-700`, `--primary-900`, `--bg-canvas`, `--bg-surface`, `--border-subtle`, status colors, and tabular figure font utility.

- [ ] **Step 2: Build Button component**
  Create `apps/web/components/ui/button.tsx` supporting primary, secondary, accent, and destructive variants with loading state integration.

- [ ] **Step 3: Build Input & Card components**
  Create `apps/web/components/ui/input.tsx` (with prefix/suffix slots) and `apps/web/components/ui/card.tsx`.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): implement vedic industrial design tokens and core UI primitives"`

---

### Task 4: Authentication Handlers & Tenant Middleware

**Files:**
- Create: `apps/web/lib/auth.ts`
- Create: `apps/web/app/api/auth/login/route.ts`
- Create: `apps/web/app/api/auth/register/route.ts`
- Create: `apps/web/middleware.ts`

**Interfaces:**
- Consumes: JWT secrets, Prisma User/Tenant models
- Produces: `/api/auth/login`, `/api/auth/register` endpoints, HttpOnly JWT cookies, and middleware injecting `x-tenant-id` header.

- [ ] **Step 1: Build auth utility functions (JWT sign, verify, hash password)**
  In `apps/web/lib/auth.ts`, implement JWT minting with user ID and active tenant ID payload.

- [ ] **Step 2: Create Login and Register API routes**
  Build `/api/auth/login` and `/api/auth/register` route handlers with Zod validation.

- [ ] **Step 3: Build Middleware for session verification & tenant resolution**
  In `apps/web/middleware.ts`, parse hostname or auth cookies to resolve ambient tenant context.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(auth): add JWT auth endpoints and tenant resolution middleware"`

---

### Task 5: App Shell Layout & Dashboard Landing

**Files:**
- Create: `apps/web/components/layout/app-header.tsx`
- Create: `apps/web/components/layout/app-sidebar.tsx`
- Create: `apps/web/components/layout/app-shell.tsx`
- Create: `apps/web/app/(dashboard)/layout.tsx`
- Create: `apps/web/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: User session context, active tenant metadata
- Produces: Responsive App Shell with sticky sidebar, topbar with business switcher, breadcrumb header, and KPI summary dashboard.

- [ ] **Step 1: Create AppSidebar component**
  Collapsible navigation bar with grouped links (Core, Commerce, Finance, Administration) and active state indicator.

- [ ] **Step 2: Create AppHeader component**
  Includes logo, business switcher dropdown, global search shortcut badge (`Cmd+K`), notification trigger, and user profile avatar.

- [ ] **Step 3: Assemble AppShell and Dashboard Layout**
  Combine sidebar and header into `app/(dashboard)/layout.tsx`.

- [ ] **Step 4: Build Executive Dashboard page**
  Create `app/(dashboard)/dashboard/page.tsx` displaying KPI metric cards (GMV, Orders, Low Stock Alerts) and recent orders list using Design System primitives.

- [ ] **Step 5: Verify build**
  Run: `npm run build`
  Expected: Clean Next.js compilation without TypeScript or linting errors.

- [ ] **Step 6: Commit**
  Run: `git add apps/web && git commit -m "feat(dashboard): build authenticated app shell layout and mission control dashboard"`
