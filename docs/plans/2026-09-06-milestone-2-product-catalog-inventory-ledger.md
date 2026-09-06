# Milestone 2: Product Catalog, Variants, HSN Tax Mapping & Double-Entry Inventory Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full product catalog management, variant matrix generator, Indian HSN/SAC GST tax rate mapping, and double-entry inventory ledger with atomic stock adjustments.

**Architecture:** Next.js 15 App Router API routes consuming Prisma ORM with tenant isolation (`getTenantDb`). Product variants track `currentStock` synced atomically with `InventoryLedger` event logs (INWARD, SALE, RETURN, DAMAGE, ADJUSTMENT). Web UI built with Tailwind v4 "Vedic Industrial" design tokens and core UI primitives.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma ORM 6, Tailwind CSS v4, Zod, Vitest.

**Spec:** [BHARATSTORE_MASTER_BLUEPRINT.md](../../BHARATSTORE_MASTER_BLUEPRINT.md)

## Global Constraints

- Version Floors: Node.js >= 20.0, Next.js 15.1, React 19.0, Prisma 6.4, TypeScript 5.7
- Naming Rules: CamelCase for variables/functions, PascalCase for components, snake_case for DB columns
- Design Tokens: Primary Slate (`#0f172a`), Saffron Accent (`#f59e0b`), Baseline grid 4px spacing
- Tenant Isolation: Every DB model must be scoped via `tenantId` and accessed through `getTenantDb(tenantId)`

---

### Task 1: Shared Schemas & GST HSN Rate Constants

**Files:**
- Create: `packages/shared/src/constants/gst.ts`
- Create: `packages/shared/src/schemas/product.ts`
- Create: `packages/shared/src/schemas/inventory.ts`
- Modify: `packages/shared/src/constants/index.ts`
- Modify: `packages/shared/src/schemas/index.ts`

**Interfaces:**
- Consumes: Zod validation library
- Produces: Standard HSN tax rate presets (0%, 5%, 12%, 18%, 28%), `createProductSchema`, `updateProductSchema`, `createCategorySchema`, `adjustInventorySchema`

- [ ] **Step 1: Create GST HSN constants**
  Create `packages/shared/src/constants/gst.ts`:
  ```typescript
  export interface HsnPreset {
    code: string;
    description: string;
    gstRate: number; // 0, 5, 12, 18, 28
  }

  export const COMMON_HSN_CODES: HsnPreset[] = [
    { code: '5007', description: 'Woven fabrics of silk or silk waste (Sarees/Suits)', gstRate: 5 },
    { code: '6204', description: 'Womens suits, dresses, skirts & trousers', gstRate: 12 },
    { code: '6109', description: 'T-shirts, singlets and other vests, knitted', gstRate: 5 },
    { code: '1006', description: 'Rice, wheat, and agricultural food grains', gstRate: 0 },
    { code: '2106', description: 'Packaged food preparations, namkeen, sweets', gstRate: 12 },
    { code: '8517', description: 'Smartphones, cellular devices and electronics', gstRate: 18 },
    { code: '3304', description: 'Cosmetics, skincare & beauty products', gstRate: 18 },
    { code: '9983', description: 'Other professional & IT services (SAC)', gstRate: 18 },
  ];

  export const GST_SLABS = [0, 5, 12, 18, 28];
  ```

- [ ] **Step 2: Create Product and Category Zod schemas**
  Create `packages/shared/src/schemas/product.ts`:
  ```typescript
  import { z } from 'zod';

  export const variantInputSchema = z.object({
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional(),
    variantName: z.string().min(1, 'Variant name is required'),
    priceOverride: z.number().optional(),
    weightGrams: z.number().default(0),
    initialStock: z.number().default(0),
    lowStockAlert: z.number().default(5),
  });

  export const createProductSchema = z.object({
    title: z.string().min(2, 'Product title is required'),
    categoryId: z.string().uuid('Valid category is required'),
    description: z.string().optional(),
    hsnCode: z.string().min(4, 'Valid 4-8 digit HSN code is required'),
    gstRate: z.number().min(0).max(28),
    baseCost: z.number().min(0).default(0),
    mrp: z.number().min(0, 'MRP is required'),
    sellingPrice: z.number().min(0, 'Selling price is required'),
    isPublished: z.boolean().default(true),
    images: z.array(z.string()).default([]),
    variants: z.array(variantInputSchema).min(1, 'At least one product variant is required'),
  });

  export const createCategorySchema = z.object({
    name: z.string().min(2, 'Category name is required'),
    parentId: z.string().uuid().optional().nullable(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  });
  ```

- [ ] **Step 3: Create Inventory adjustment Zod schema**
  Create `packages/shared/src/schemas/inventory.ts`:
  ```typescript
  import { z } from 'zod';

  export const adjustInventorySchema = z.object({
    variantId: z.string().uuid('Valid variant ID is required'),
    changeQuantity: z.number().int().refine((val) => val !== 0, 'Quantity change must not be zero'),
    eventType: z.enum(['INWARD', 'SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT']),
    referenceId: z.string().optional(),
    notes: z.string().optional(),
  });
  ```

- [ ] **Step 4: Export modules from index barrels**
  Update `packages/shared/src/constants/index.ts` and `packages/shared/src/schemas/index.ts`.

- [ ] **Step 5: Commit**
  Run: `git add packages/shared && git commit -m "feat(shared): add Zod schemas and HSN tax constants for products and inventory"`

---

### Task 2: API Endpoints for Categories & Product Catalog Management

**Files:**
- Create: `apps/web/app/api/categories/route.ts`
- Create: `apps/web/app/api/products/route.ts`
- Create: `apps/web/app/api/products/[id]/route.ts`

**Interfaces:**
- Consumes: Scoped Prisma DB `getTenantDb`, Zod validation schemas
- Produces: REST endpoints for listing, creating, updating, and deleting products & categories

- [ ] **Step 1: Create Categories API route**
  Create `apps/web/app/api/categories/route.ts`:
  - `GET`: Returns list of categories for active tenant.
  - `POST`: Validates `createCategorySchema` and creates a new category for tenant.

- [ ] **Step 2: Create Products List & Create API route**
  Create `apps/web/app/api/products/route.ts`:
  - `GET`: Accepts query params `page`, `limit`, `search`, `categoryId`, `stockStatus`. Returns paginated products with variants and total stock.
  - `POST`: Validates `createProductSchema`. In a transaction:
    1. Creates product record.
    2. Creates product variants.
    3. Creates initial `InventoryLedger` (INWARD) logs for variants with `initialStock > 0`.

- [ ] **Step 3: Create Single Product API route**
  Create `apps/web/app/api/products/[id]/route.ts`:
  - `GET`: Returns single product with variants, category details, and inventory log summary.
  - `PUT`: Updates product details and variants.
  - `DELETE`: Unpublishes product or deletes product if no sales order exists.

- [ ] **Step 4: Commit**
  Run: `git add apps/web/app/api && git commit -m "feat(api): add REST endpoints for categories and product catalog"`

---

### Task 3: Double-Entry Inventory Ledger & Stock Adjustment API

**Files:**
- Create: `apps/web/app/api/inventory/adjust/route.ts`
- Create: `apps/web/app/api/inventory/ledger/route.ts`
- Create: `packages/database/src/inventory.test.ts`

**Interfaces:**
- Consumes: `getTenantDb`, `adjustInventorySchema`
- Produces: Atomic stock adjustment endpoint and ledger audit history log

- [ ] **Step 1: Build Inventory Adjust API route**
  Create `apps/web/app/api/inventory/adjust/route.ts`:
  - `POST`: Validates `adjustInventorySchema`. In a transaction:
    1. Reads variant stock.
    2. Computes `newStock = currentStock + changeQuantity`. Throws error if `newStock < 0`.
    3. Updates `ProductVariant.currentStock = newStock`.
    4. Creates `InventoryLedger` entry with `balanceAfter: newStock`.

- [ ] **Step 2: Build Inventory Ledger History API route**
  Create `apps/web/app/api/inventory/ledger/route.ts`:
  - `GET`: Returns paginated ledger history with variant details, product title, event type, change quantity, balance after, and user details.

- [ ] **Step 3: Write test verifying atomic stock updates**
  Create `packages/database/src/inventory.test.ts` testing stock increment, decrement, and zero stock boundary error.

- [ ] **Step 4: Run database tests**
  Run: `npx vitest run packages/database/src/inventory.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run: `git add apps/web/app/api/inventory packages/database && git commit -m "feat(inventory): add double-entry inventory ledger and atomic adjustment API"`

---

### Task 4: Product Catalog Management UI Pages

**Files:**
- Create: `apps/web/app/(dashboard)/products/page.tsx`
- Create: `apps/web/components/products/category-modal.tsx`

**Interfaces:**
- Consumes: `/api/products`, `/api/categories`, UI primitives (`Card`, `Button`, `Input`, `Badge`)
- Produces: Interactive Product Catalog data table with search, category filters, HSN badges, stock indicators, and Category Manager.

- [ ] **Step 1: Build Category Modal component**
  Create `apps/web/components/products/category-modal.tsx` to add/view product categories.

- [ ] **Step 2: Build Product Catalog List page**
  Create `apps/web/app/(dashboard)/products/page.tsx`:
  - Search bar with instant filtering by title, SKU, or HSN code.
  - Category filter dropdown & stock status filters (All, In Stock, Low Stock, Out of Stock).
  - Data table displaying product thumbnail, title, category, HSN/GST rate, MRP vs Selling Price, Total Stock across variants, status badge, and action menu.

- [ ] **Step 3: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): implement product catalog management list and category drawer"`

---

### Task 5: Add/Edit Product & Variant Matrix Generator UI

**Files:**
- Create: `apps/web/app/(dashboard)/products/new/page.tsx`
- Create: `apps/web/components/products/variant-matrix-generator.tsx`
- Create: `apps/web/app/(dashboard)/products/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `/api/products`, `COMMON_HSN_CODES`, `GST_SLABS`
- Produces: 2-column Product creation/editing wizard with HSN tax selector and variant generator.

- [ ] **Step 1: Build Variant Matrix Generator component**
  Create `apps/web/components/products/variant-matrix-generator.tsx`:
  - Allows specifying attributes (e.g. Color: Red, Blue; Size: S, M, L).
  - Generates combinational variant rows with editable SKU, Barcode, Selling Price, and Initial Stock.

- [ ] **Step 2: Build Add Product page**
  Create `apps/web/app/(dashboard)/products/new/page.tsx`:
  - 2-column layout: Left column for Core Title, Description, HSN Code selector with auto GST slab fill, MRP, Selling Price; Right column for Category, Images, and Variant Matrix.
  - Form submission posts to `/api/products` and redirects to catalog on success.

- [ ] **Step 3: Build Edit Product page**
  Create `apps/web/app/(dashboard)/products/[id]/edit/page.tsx` for updating product details.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): build add/edit product wizard with HSN tax selector and variant matrix generator"`

---

### Task 6: Double-Entry Inventory Ledger Management UI

**Files:**
- Create: `apps/web/app/(dashboard)/inventory/page.tsx`
- Create: `apps/web/components/inventory/stock-adjust-modal.tsx`

**Interfaces:**
- Consumes: `/api/inventory/adjust`, `/api/inventory/ledger`, `/api/products`
- Produces: Stock health overview dashboard, low-stock replenishment alert list, stock adjustment modal (Inward/Damage/Audit), and ledger audit trail.

- [ ] **Step 1: Build Stock Adjustment Modal**
  Create `apps/web/components/inventory/stock-adjust-modal.tsx`:
  - Allows selecting variant, adjustment type (INWARD stock receive, DAMAGE, MANUAL ADJUSTMENT), quantity, and notes.

- [ ] **Step 2: Build Inventory Dashboard page**
  Create `apps/web/app/(dashboard)/inventory/page.tsx`:
  - Stock health KPI cards (Total Stock Units, Total Stock Value at Cost, Low Stock SKUs, Out of Stock SKUs).
  - Low stock warning banner & fast inward receive trigger.
  - Complete double-entry inventory ledger table showing all stock movement logs (timestamp, variant, SKU, change, balance after, event type, reference, user).

- [ ] **Step 3: Verify monorepo build**
  Run: `npm run build`
  Expected: Clean build without compilation or TypeScript errors across all pages.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(inventory): build inventory ledger dashboard and stock adjustment workflow"`
