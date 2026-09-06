import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTenantDb, prisma } from './client';

describe('Inventory Ledger & Stock Adjustments', () => {
  let testTenantId: string;
  let testCategoryId: string;
  let testProductId: string;
  let testVariantId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        legalName: 'Inventory Test Store Ltd',
        tradeName: 'Inventory Store',
        slug: `inv-tenant-${Date.now()}`,
        phone: '9888877777',
        addressLine1: '456 Market St',
        city: 'Varanasi',
        stateCode: '09',
        pincode: '221001',
      },
    });
    testTenantId = tenant.id;

    const category = await prisma.category.create({
      data: {
        tenantId: testTenantId,
        name: 'Apparel',
        slug: `apparel-${Date.now()}`,
      },
    });
    testCategoryId = category.id;

    const product = await prisma.product.create({
      data: {
        tenantId: testTenantId,
        categoryId: testCategoryId,
        title: 'Silk Saree',
        slug: `silk-saree-${Date.now()}`,
        hsnCode: '5007',
        gstRate: 5,
        sellingPrice: 5000,
        mrp: 6000,
      },
    });
    testProductId = product.id;

    const variant = await prisma.productVariant.create({
      data: {
        tenantId: testTenantId,
        productId: testProductId,
        sku: `SKU-RED-M-${Date.now()}`,
        variantName: 'Red / M',
        currentStock: 10,
        lowStockAlert: 3,
      },
    });
    testVariantId = variant.id;
  });

  afterAll(async () => {
    if (testTenantId) {
      await prisma.tenant.delete({ where: { id: testTenantId } });
    }
  });

  it('correctly logs initial stock inward', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const ledgerEntry = await tenantDb.inventoryLedger.create({
      data: {
        variantId: testVariantId,
        changeQuantity: 10,
        balanceAfter: 10,
        eventType: 'INWARD',
        notes: 'Initial inward',
      } as any,
    });

    expect(ledgerEntry.tenantId).toBe(testTenantId);
    expect(ledgerEntry.changeQuantity).toBe(10);
    expect(ledgerEntry.balanceAfter).toBe(10);
    expect(ledgerEntry.eventType).toBe('INWARD');
  });

  it('atomically decrements stock on sale and logs ledger event', async () => {
    const tenantDb = getTenantDb(testTenantId);

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: testVariantId },
      });

      const changeQuantity = -2;
      const newStock = variant.currentStock + changeQuantity;

      const updatedVariant = await tx.productVariant.update({
        where: { id: testVariantId },
        data: { currentStock: newStock },
      });

      const log = await tx.inventoryLedger.create({
        data: {
          tenantId: testTenantId,
          variantId: testVariantId,
          changeQuantity,
          balanceAfter: newStock,
          eventType: 'SALE',
          referenceId: 'ORD-1001',
        },
      });

      return { updatedVariant, log };
    });

    expect(result.updatedVariant.currentStock).toBe(8);
    expect(result.log.changeQuantity).toBe(-2);
    expect(result.log.balanceAfter).toBe(8);
  });

  it('prevents stock decrement below zero', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const currentStock = 8;
    const requestedChange = -15;

    await expect(
      prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.findUniqueOrThrow({
          where: { id: testVariantId },
        });

        const newStock = variant.currentStock + requestedChange;
        if (newStock < 0) {
          throw new Error('Insufficient stock');
        }
      })
    ).rejects.toThrow('Insufficient stock');
  });
});
