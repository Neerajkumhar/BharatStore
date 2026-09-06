# Milestone 3: Omnichannel Orders, Customer Directory, Khata Ledger & Counter POS Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete omnichannel commerce loop: Counter POS terminal, customer directory & Khata credit ledger, order fulfillment workflow, automated GST tax calculation (Intrastate CGST/SGST vs Interstate IGST), double-entry inventory SALE decrements, and thermal/A4 GST invoice generation.

**Architecture:** Next.js 15 App Router endpoints backed by Prisma ORM transactions. High-speed POS interface with instant product search, cart state management, customer lookup/creation, split payment processing (Cash/UPI/Khata), and automated inventory decrement & invoice generation.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma ORM 6, Tailwind CSS v4, Zod, Vitest.

**Spec:** [BHARATSTORE_MASTER_BLUEPRINT.md](../../BHARATSTORE_MASTER_BLUEPRINT.md)

## Global Constraints

- Version Floors: Node.js >= 20.0, Next.js 15.1, React 19.0, Prisma 6.4, TypeScript 5.7
- Naming Rules: CamelCase for variables/functions, PascalCase for components, snake_case for DB columns
- Design Tokens: Primary Slate (`#0f172a`), Saffron Accent (`#f59e0b`), Baseline grid 4px spacing
- Tenant Isolation: Every DB model must be scoped via `tenantId` and accessed through `getTenantDb(tenantId)`

---

### Task 1: Shared Schemas & GST Tax Calculation Engine

**Files:**
- Create: `packages/shared/src/utils/tax.ts`
- Create: `packages/shared/src/schemas/order.ts`
- Create: `packages/shared/src/schemas/customer.ts`
- Modify: `packages/shared/src/schemas/index.ts`
- Modify: `packages/shared/src/utils/index.ts`

**Interfaces:**
- Consumes: Product variant data, tenant state code, recipient state code
- Produces: `calculateGstTaxSplit()` function, `createOrderSchema`, `createCustomerSchema`, `logKhataSchema`

- [ ] **Step 1: Build Indian GST Tax Split calculation utility**
  Create `packages/shared/src/utils/tax.ts`:
  ```typescript
  export interface TaxSplitResult {
    subtotal: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    taxTotal: number;
    grandTotal: number;
    isInterstate: boolean;
  }

  export function calculateGstTaxSplit(
    items: { unitPrice: number; quantity: number; gstRate: number }[],
    supplierStateCode: string,
    placeOfSupplyStateCode: string
  ): TaxSplitResult {
    const isInterstate = supplierStateCode !== placeOfSupplyStateCode;
    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    items.forEach((item) => {
      const lineSubtotal = item.unitPrice * item.quantity;
      subtotal += lineSubtotal;

      const lineTax = (lineSubtotal * item.gstRate) / 100;
      if (isInterstate) {
        igstTotal += lineTax;
      } else {
        cgstTotal += lineTax / 2;
        sgstTotal += lineTax / 2;
      }
    });

    const taxTotal = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = subtotal + taxTotal;

    return {
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      taxTotal,
      grandTotal,
      isInterstate,
    };
  }
  ```

- [ ] **Step 2: Create Customer & Khata Zod schemas**
  Create `packages/shared/src/schemas/customer.ts`:
  ```typescript
  import { z } from 'zod';

  export const createCustomerSchema = z.object({
    name: z.string().min(2, 'Customer name is required'),
    phone: z.string().min(10, '10-digit phone number is required'),
    email: z.string().email().optional().or(z.literal('')),
    gstin: z.string().optional().or(z.literal('')),
    creditLimit: z.number().min(0).default(0),
    notes: z.string().optional(),
  });

  export const logKhataSchema = z.object({
    customerId: z.string().uuid('Valid customer ID is required'),
    type: z.enum(['DEBIT_CREDIT_GIVEN', 'CREDIT_PAYMENT_RECEIVED']),
    amount: z.number().positive('Amount must be positive'),
    paymentMode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER']).optional(),
    orderId: z.string().uuid().optional(),
    notes: z.string().optional(),
  });
  ```

- [ ] **Step 3: Create Order & Checkout Zod schema**
  Create `packages/shared/src/schemas/order.ts`:
  ```typescript
  import { z } from 'zod';

  export const orderItemInputSchema = z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive(),
  });

  export const createOrderSchema = z.object({
    customerId: z.string().uuid().optional(),
    channel: z.enum(['STOREFRONT', 'POS_COUNTER', 'WHATSAPP']).default('POS_COUNTER'),
    items: z.array(orderItemInputSchema).min(1, 'Order must contain at least 1 item'),
    paymentMethod: z.enum(['CASH', 'UPI_DIRECT', 'RAZORPAY', 'KHATA_CREDIT', 'SPLIT']),
    paymentAmount: z.number().min(0),
    notes: z.string().optional(),
    placeOfSupply: z.string().default('09'),
  });
  ```

- [ ] **Step 4: Export from barrels**
  Update `packages/shared/src/schemas/index.ts` and `packages/shared/src/utils/index.ts`.

- [ ] **Step 5: Commit**
  Run: `git add packages/shared && git commit -m "feat(shared): add GST tax split utility and Order/Customer Zod schemas"`

---

### Task 2: API Endpoints for Omnichannel Checkout, Customers & Khata Ledger

**Files:**
- Create: `apps/web/app/api/customers/route.ts`
- Create: `apps/web/app/api/customers/[id]/route.ts`
- Create: `apps/web/app/api/khata/route.ts`
- Create: `apps/web/app/api/orders/route.ts`
- Create: `apps/web/app/api/orders/[id]/route.ts`

**Interfaces:**
- Consumes: `getTenantDb`, `calculateGstTaxSplit`, Zod schemas
- Produces: Complete checkout transaction API, customer lookup/creation, Khata credit payment API, and order fulfillment status update API.

- [ ] **Step 1: Build Customer API routes**
  Create `apps/web/app/api/customers/route.ts` & `apps/web/app/api/customers/[id]/route.ts`:
  - `GET`: List customers with balance summaries and order count.
  - `POST`: Create customer with phone uniqueness check per tenant.
  - `GET [id]`: Fetch customer details, khata ledger entries, and orders.

- [ ] **Step 2: Build Khata Ledger API route**
  Create `apps/web/app/api/khata/route.ts`:
  - `POST`: Record Khata credit payment or debit entry in transaction:
    1. Updates `Customer.currentBalance`.
    2. Creates `KhataLedger` record with `balanceAfter`.

- [ ] **Step 3: Build Omnichannel Order & POS Checkout API route**
  Create `apps/web/app/api/orders/route.ts`:
  - `POST`: In a single atomic Prisma `$transaction`:
    1. Generate sequential order number (`BS-YYYY-XXXX`).
    2. Fetch variants & calculate line totals + CGST/SGST/IGST tax splits using tenant's state code vs `placeOfSupply`.
    3. Verify stock availability for all items.
    4. Create `Order` & `OrderItem` records.
    5. Create `Payment` record (Status: SUCCESS if paid, UNPAID if Khata credit).
    6. Generate `Invoice` record (Sequential `INV-YYYY-XXXX`).
    7. Atomically decrement variant stock and log `InventoryLedger` (`SALE` event).
    8. If payment method is `KHATA_CREDIT`, create `KhataLedger` entry and increase `Customer.currentBalance`.

- [ ] **Step 4: Build Order Detail & Status API route**
  Create `apps/web/app/api/orders/[id]/route.ts`:
  - `GET`: Fetch order details, items, invoice, customer, and payments.
  - `PUT`: Update order status (`CONFIRMED`, `PACKED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).

- [ ] **Step 5: Commit**
  Run: `git add apps/web/app/api && git commit -m "feat(api): add REST endpoints for orders, checkout, customers, and khata ledger"`

---

### Task 3: Customer Directory & Khata Ledger UI

**Files:**
- Create: `apps/web/app/(dashboard)/customers/page.tsx`
- Create: `apps/web/app/(dashboard)/customers/[id]/page.tsx`
- Create: `apps/web/components/customers/customer-modal.tsx`
- Create: `apps/web/components/customers/khata-payment-modal.tsx`

**Interfaces:**
- Consumes: `/api/customers`, `/api/khata`
- Produces: Customer directory page, customer detail drawer, Khata credit payment collection modal.

- [ ] **Step 1: Build Customer Modal & Khata Payment Modal**
  Create `customer-modal.tsx` (Add customer form) and `khata-payment-modal.tsx` (Record customer payment received).

- [ ] **Step 2: Build Customer Directory Page**
  Create `apps/web/app/(dashboard)/customers/page.tsx`:
  - Search by customer name, phone number, or GSTIN.
  - Customer cards & data table showing current Khata balance, credit limit, total orders, and payment collect trigger button.

- [ ] **Step 3: Build Customer Detail & Khata Audit Ledger Page**
  Create `apps/web/app/(dashboard)/customers/[id]/page.tsx` with full ledger timeline.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(ui): implement customer directory and khata credit ledger interface"`

---

### Task 4: Counter POS Terminal Interface

**Files:**
- Create: `apps/web/app/(dashboard)/pos/page.tsx`
- Create: `apps/web/components/pos/pos-cart.tsx`
- Create: `apps/web/components/pos/receipt-modal.tsx`

**Interfaces:**
- Consumes: `/api/products`, `/api/customers`, `/api/orders`
- Produces: Touch-friendly high-speed POS terminal layout with instant product search, cart sidebar, customer picker, payment mode selector (Cash, UPI QR, Khata), and 1-click receipt print preview.

- [ ] **Step 1: Build POS Cart Sidebar component**
  Create `apps/web/components/pos/pos-cart.tsx`:
  - Selected items list with quantity steppers (`+`/`-`), discount input, tax summary (Subtotal, CGST, SGST, Grand Total).
  - Customer search/quick-add widget.
  - Payment mode selector (Cash, UPI, Khata Credit).

- [ ] **Step 2: Build Thermal/A4 Receipt Print Modal**
  Create `apps/web/components/pos/receipt-modal.tsx`:
  - Render invoice header with store GSTIN, itemized tax table, payment method, and browser print trigger.

- [ ] **Step 3: Build POS Terminal Page**
  Create `apps/web/app/(dashboard)/pos/page.tsx`:
  - Product grid with category pills and instant barcode/SKU search filter.
  - 1-tap item add to cart.
  - Complete checkout flow submitting to `/api/orders` and opening receipt modal.

- [ ] **Step 4: Commit**
  Run: `git add apps/web && git commit -m "feat(pos): build counter POS terminal checkout interface with receipt printing"`

---

### Task 5: Omnichannel Orders & GST Invoice Management UI

**Files:**
- Create: `apps/web/app/(dashboard)/orders/page.tsx`
- Create: `apps/web/app/(dashboard)/orders/[id]/page.tsx`
- Create: `apps/web/app/(dashboard)/invoices/[id]/page.tsx`

**Interfaces:**
- Consumes: `/api/orders`, `/api/orders/[id]`
- Produces: Omnichannel order management list with status filters, order detail view with shipment tracking, and printable GST Tax Invoice page.

- [ ] **Step 1: Build Orders List Page**
  Create `apps/web/app/(dashboard)/orders/page.tsx`:
  - Tabs: All, Pending, Confirmed, Dispatched, Delivered, Cancelled.
  - Channel indicators (POS Counter, Storefront, WhatsApp).
  - Order summary cards and data table.

- [ ] **Step 2: Build Order Detail & Fulfillment Page**
  Create `apps/web/app/(dashboard)/orders/[id]/page.tsx`:
  - Status update workflow buttons (Pack Order, Dispatch, Mark Delivered).
  - Customer contact & delivery address details.
  - Link to view/print GST Invoice.

- [ ] **Step 3: Build Printable GST Invoice Page**
  Create `apps/web/app/(dashboard)/invoices/[id]/page.tsx`:
  - Tax Invoice layout adhering to Indian GST rules (Supplier GSTIN, Recipient GSTIN, HSN summary, CGST/SGST/IGST breakdown, State Code, Authorized Signatory box).

- [ ] **Step 4: Verify monorepo build**
  Run: `npm run build`
  Expected: Clean compilation with 0 errors across all pages.

- [ ] **Step 5: Commit**
  Run: `git add apps/web && git commit -m "feat(orders): build order management dashboard, fulfillment workflow, and GST tax invoice layout"`
