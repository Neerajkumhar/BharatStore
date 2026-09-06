import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { getTenantDb, prisma } from './client';
import { calculateGstTaxSplit } from '@bharatstore/shared/utils';
import { SYSTEM_ROLES, PERMISSIONS } from '@bharatstore/shared/constants';

describe('Pre-Production Hardening & Comprehensive Audit Suite', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  let category1Id: string;
  let product1Id: string;
  let variant1Id: string;
  let customer1Id: string;

  beforeAll(async () => {
    // 1. Create Tenant 1 (Delhi)
    const tenant1 = await prisma.tenant.create({
      data: {
        legalName: 'Audit Tenant 1 Pvt Ltd',
        tradeName: 'Audit Store Delhi',
        slug: `audit-tenant-1-${Date.now()}`,
        phone: '9999888877',
        addressLine1: 'Connaught Place',
        city: 'New Delhi',
        stateCode: '07',
        pincode: '110001',
      },
    });
    tenant1Id = tenant1.id;

    // 2. Create Tenant 2 (Maharashtra)
    const tenant2 = await prisma.tenant.create({
      data: {
        legalName: 'Audit Tenant 2 Pvt Ltd',
        tradeName: 'Audit Store Mumbai',
        slug: `audit-tenant-2-${Date.now()}`,
        phone: '9888777666',
        addressLine1: 'Bandra West',
        city: 'Mumbai',
        stateCode: '27',
        pincode: '400050',
      },
    });
    tenant2Id = tenant2.id;

    // 3. Create Product & Variant for Tenant 1
    const category = await prisma.category.create({
      data: {
        tenantId: tenant1Id,
        name: 'Electronics',
        slug: `elec-${Date.now()}`,
      },
    });
    category1Id = category.id;

    const product = await prisma.product.create({
      data: {
        tenantId: tenant1Id,
        categoryId: category1Id,
        title: 'Smart Band',
        slug: `smart-band-${Date.now()}`,
        hsnCode: '8517',
        gstRate: 18,
        sellingPrice: 1999,
        mrp: 2999,
      },
    });
    product1Id = product.id;

    const variant = await prisma.productVariant.create({
      data: {
        tenantId: tenant1Id,
        productId: product1Id,
        sku: `SKU-BAND-BLK-${Date.now()}`,
        variantName: 'Black',
        currentStock: 5,
        lowStockAlert: 2,
      },
    });
    variant1Id = variant.id;

    // 4. Create Customer for Tenant 1
    const customer = await prisma.customer.create({
      data: {
        tenantId: tenant1Id,
        name: 'Rahul Sharma',
        phone: `91000${Date.now().toString().slice(-5)}`,
        currentBalance: 0,
        creditLimit: 10000,
      },
    });
    customer1Id = customer.id;
  });

  afterAll(async () => {
    if (tenant1Id) await prisma.tenant.delete({ where: { id: tenant1Id } });
    if (tenant2Id) await prisma.tenant.delete({ where: { id: tenant2Id } });
  });

  // ----------------------------------------------------
  // SECTION 1: GST TAX ENGINE & FINANCIAL ACCURACY
  // ----------------------------------------------------
  describe('GST Tax Engine & Money Precision', () => {
    it('accurately computes Intrastate tax split (CGST + SGST) for 0%, 5%, 12%, 18%, 28%', () => {
      const items = [
        { unitPrice: 1000, quantity: 1, gstRate: 0 },
        { unitPrice: 500, quantity: 2, gstRate: 5 },
        { unitPrice: 200, quantity: 5, gstRate: 12 },
        { unitPrice: 1500, quantity: 1, gstRate: 18 },
        { unitPrice: 10000, quantity: 1, gstRate: 28 },
      ];

      // Delhi (07) to Delhi (07) => Intrastate
      const result = calculateGstTaxSplit(items, '07', '07');

      expect(result.isInterstate).toBe(false);
      expect(result.subtotal).toBe(14500); // 1000 + 1000 + 1000 + 1500 + 10000
      expect(result.igstTotal).toBe(0);

      // Tax per item:
      // Item 1 (0%): 0 tax
      // Item 2 (5% of 1000): 50 tax => CGST 25, SGST 25
      // Item 3 (12% of 1000): 120 tax => CGST 60, SGST 60
      // Item 4 (18% of 1500): 270 tax => CGST 135, SGST 135
      // Item 5 (28% of 10000): 2800 tax => CGST 1400, SGST 1400
      // Total CGST = 1620, Total SGST = 1620
      expect(result.cgstTotal).toBe(1620);
      expect(result.sgstTotal).toBe(1620);
      expect(result.taxTotal).toBe(3240);
      expect(result.grandTotal).toBe(17740);

      // Mathematical component sum rule
      expect(result.taxTotal).toBe(result.cgstTotal + result.sgstTotal + result.igstTotal);
      expect(result.grandTotal).toBe(Number((result.subtotal + result.taxTotal).toFixed(2)));
    });

    it('accurately computes Interstate tax split (IGST) when supplier and place of supply differ', () => {
      const items = [{ unitPrice: 1999, quantity: 2, gstRate: 18 }];

      // Delhi (07) to Maharashtra (27) => Interstate
      const result = calculateGstTaxSplit(items, '07', '27');

      expect(result.isInterstate).toBe(true);
      expect(result.subtotal).toBe(3998);
      expect(result.cgstTotal).toBe(0);
      expect(result.sgstTotal).toBe(0);
      expect(result.igstTotal).toBe(719.64);
      expect(result.taxTotal).toBe(719.64);
      expect(result.grandTotal).toBe(4717.64);

      expect(result.taxTotal).toBe(result.cgstTotal + result.sgstTotal + result.igstTotal);
      expect(result.grandTotal).toBe(Number((result.subtotal + result.taxTotal).toFixed(2)));
    });
  });

  // ----------------------------------------------------
  // SECTION 2: CONCURRENCY & ATOMIC INVENTORY GUARD
  // ----------------------------------------------------
  describe('Concurrency & Atomic Stock Decrement', () => {
    it('prevents overselling via atomic updateMany conditional decrement guard', async () => {
      const tenantDb = getTenantDb(tenant1Id);

      // Current stock is 5. Attempting to purchase 6 units atomically must fail
      const updateRes = await tenantDb.productVariant.updateMany({
        where: {
          id: variant1Id,
          tenantId: tenant1Id,
          currentStock: { gte: 6 },
        },
        data: {
          currentStock: { decrement: 6 },
        },
      });

      expect(updateRes.count).toBe(0); // 0 rows updated

      // Stock remains exactly 5
      const v = await tenantDb.productVariant.findUniqueOrThrow({ where: { id: variant1Id } });
      expect(v.currentStock).toBe(5);
    });

    it('successfully executes atomic decrement when sufficient stock is available', async () => {
      const tenantDb = getTenantDb(tenant1Id);

      // Decrement 2 units from 5 -> 3
      const updateRes = await tenantDb.productVariant.updateMany({
        where: {
          id: variant1Id,
          tenantId: tenant1Id,
          currentStock: { gte: 2 },
        },
        data: {
          currentStock: { decrement: 2 },
        },
      });

      expect(updateRes.count).toBe(1);

      const v = await tenantDb.productVariant.findUniqueOrThrow({ where: { id: variant1Id } });
      expect(v.currentStock).toBe(3);
    });
  });

  // ----------------------------------------------------
  // SECTION 3: KHATA BALANCE ATOMIC INTEGRITY
  // ----------------------------------------------------
  describe('Khata Accounting & Customer Balance Integrity', () => {
    it('atomically increments and decrements customer balance during credit & payment collection', async () => {
      const tenantDb = getTenantDb(tenant1Id);

      // 1. Credit Sale of ₹1,500
      const afterCredit = await tenantDb.customer.update({
        where: { id: customer1Id },
        data: { currentBalance: { increment: 1500 } },
      });
      expect(Number(afterCredit.currentBalance)).toBe(1500);

      // Log Khata debit entry
      await tenantDb.khataLedger.create({
        data: {
          customerId: customer1Id,
          type: 'DEBIT_CREDIT_GIVEN',
          amount: 1500,
          balanceAfter: 1500,
          notes: 'Credit purchase',
        } as any,
      });

      // 2. Partial Payment Collection of ₹500
      const afterPayment = await tenantDb.customer.update({
        where: { id: customer1Id },
        data: { currentBalance: { decrement: 500 } },
      });
      expect(Number(afterPayment.currentBalance)).toBe(1000);

      // Log Khata credit entry
      await tenantDb.khataLedger.create({
        data: {
          customerId: customer1Id,
          type: 'CREDIT_PAYMENT_RECEIVED',
          amount: 500,
          balanceAfter: 1000,
          notes: 'Partial payment collection',
        } as any,
      });

      // Verify balance matches latest ledger balanceAfter
      const latestLedger = await tenantDb.khataLedger.findFirst({
        where: { customerId: customer1Id },
        orderBy: { createdAt: 'desc' },
      });
      expect(Number(latestLedger?.balanceAfter)).toBe(Number(afterPayment.currentBalance));
    });
  });

  // ----------------------------------------------------
  // SECTION 4: TENANT ISOLATION & RESOURCE OWNERSHIP
  // ----------------------------------------------------
  describe('Strict Multi-Tenant Database Isolation', () => {
    it('blocks cross-tenant queries when using getTenantDb proxy', async () => {
      const tenant1Db = getTenantDb(tenant1Id);
      const tenant2Db = getTenantDb(tenant2Id);

      // Product belongs to Tenant 1
      const p1InT1 = await tenant1Db.product.findUnique({ where: { id: product1Id } });
      expect(p1InT1).not.toBeNull();

      // Querying Tenant 1 product via Tenant 2 DB returns null
      const p1InT2 = await tenant2Db.product.findFirst({ where: { id: product1Id } });
      expect(p1InT2).toBeNull();
    });

    it('blocks cross-tenant customer access', async () => {
      const tenant2Db = getTenantDb(tenant2Id);

      const crossCustomerAttempt = await tenant2Db.customer.findFirst({ where: { id: customer1Id } });
      expect(crossCustomerAttempt).toBeNull();
    });
  });
});
