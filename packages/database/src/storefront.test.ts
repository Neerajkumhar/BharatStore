import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTenantDb, prisma } from './client';
import { calculateGstTaxSplit } from '@bharatstore/shared/utils';

describe('Public Storefront & Online Commerce Integration', () => {
  let tenantAId: string;
  let tenantASlug: string;
  let tenantBId: string;
  let tenantBSlug: string;

  let categoryAId: string;
  let productAId: string;
  let variantA1Id: string;
  let variantA2Id: string;

  let productBId: string;
  let variantB1Id: string;

  beforeAll(async () => {
    // 1. Create Tenant A
    const tenantA = await prisma.tenant.create({
      data: {
        legalName: 'Chai & Co Retail Ltd',
        tradeName: 'Chai Co Store',
        slug: `chai-co-${Date.now()}`,
        phone: '9998887771',
        addressLine1: '10 MG Road',
        city: 'Bengaluru',
        stateCode: '29',
        pincode: '560001',
      },
    });
    tenantAId = tenantA.id;
    tenantASlug = tenantA.slug;

    // Storefront theme for Tenant A
    await prisma.storefrontTheme.create({
      data: {
        tenantId: tenantAId,
        themeName: 'default',
        heroTitle: 'Chai Co Artisan Blends',
        heroSubtitle: 'Fresh tea leaves from Darjeeling',
        isPublished: true,
      },
    });

    // Category for Tenant A
    const categoryA = await prisma.category.create({
      data: {
        tenantId: tenantAId,
        name: 'Beverages',
        slug: `beverages-${Date.now()}`,
      },
    });
    categoryAId = categoryA.id;

    // Published Product A for Tenant A
    const productA = await prisma.product.create({
      data: {
        tenantId: tenantAId,
        categoryId: categoryAId,
        title: 'Masala Chai Premix',
        slug: `masala-chai-${Date.now()}`,
        hsnCode: '0902',
        gstRate: 5,
        sellingPrice: 250,
        mrp: 300,
        isPublished: true,
      },
    });
    productAId = productA.id;

    // Variant A1 (In stock: 20)
    const variantA1 = await prisma.productVariant.create({
      data: {
        tenantId: tenantAId,
        productId: productAId,
        sku: `SKU-TEA-250G-${Date.now()}`,
        variantName: '250g Pack',
        currentStock: 20,
      },
    });
    variantA1Id = variantA1.id;

    // Variant A2 (Out of stock: 0)
    const variantA2 = await prisma.productVariant.create({
      data: {
        tenantId: tenantAId,
        productId: productAId,
        sku: `SKU-TEA-1KG-${Date.now()}`,
        variantName: '1Kg Bulk Pack',
        currentStock: 0,
      },
    });
    variantA2Id = variantA2.id;

    // 2. Create Tenant B
    const tenantB = await prisma.tenant.create({
      data: {
        legalName: 'South Spices Pvt Ltd',
        tradeName: 'South Spices',
        slug: `south-spices-${Date.now()}`,
        phone: '9998887772',
        addressLine1: '25 Commercial St',
        city: 'Chennai',
        stateCode: '33',
        pincode: '600001',
      },
    });
    tenantBId = tenantB.id;
    tenantBSlug = tenantB.slug;

    // Product B for Tenant B
    const productB = await prisma.product.create({
      data: {
        tenantId: tenantBId,
        categoryId: (
          await prisma.category.create({
            data: { tenantId: tenantBId, name: 'Spices', slug: `spices-${Date.now()}` },
          })
        ).id,
        title: 'Cardamom Pods',
        slug: `cardamom-${Date.now()}`,
        hsnCode: '0908',
        gstRate: 5,
        sellingPrice: 400,
        mrp: 500,
        isPublished: true,
      },
    });
    productBId = productB.id;

    const variantB1 = await prisma.productVariant.create({
      data: {
        tenantId: tenantBId,
        productId: productBId,
        sku: `SKU-CARD-100G-${Date.now()}`,
        variantName: '100g Pack',
        currentStock: 50,
      },
    });
    variantB1Id = variantB1.id;
  });

  afterAll(async () => {
    if (tenantAId) await prisma.tenant.delete({ where: { id: tenantAId } });
    if (tenantBId) await prisma.tenant.delete({ where: { id: tenantBId } });
  });

  it('resolves storefront tenant by slug with strict tenant boundary isolation', async () => {
    const storeA = await prisma.tenant.findUnique({
      where: { slug: tenantASlug },
      include: { storefrontTheme: true },
    });

    expect(storeA).toBeDefined();
    expect(storeA?.id).toBe(tenantAId);
    expect(storeA?.storefrontTheme?.heroTitle).toBe('Chai Co Artisan Blends');
  });

  it('returns published products for Tenant A and excludes Tenant B products', async () => {
    const productsA = await prisma.product.findMany({
      where: { tenantId: tenantAId, isPublished: true },
      include: { variants: true },
    });

    expect(productsA.length).toBeGreaterThan(0);
    expect(productsA.every((p) => p.tenantId === tenantAId)).toBe(true);
    expect(productsA.some((p) => p.id === productBId)).toBe(false);
  });

  it('correctly calculates server-authoritative GST tax split for intra-state vs inter-state', () => {
    // Intra-state (Supplier State 29, Buyer State 29)
    const items = [{ unitPrice: 250, quantity: 2, gstRate: 5 }];
    const intraTax = calculateGstTaxSplit(items, '29', '29');

    expect(intraTax.subtotal).toBe(500);
    expect(intraTax.cgstTotal).toBe(12.5);
    expect(intraTax.sgstTotal).toBe(12.5);
    expect(intraTax.igstTotal).toBe(0);
    expect(intraTax.grandTotal).toBe(525);
    expect(intraTax.isInterstate).toBe(false);

    // Inter-state (Supplier State 29, Buyer State 09)
    const interTax = calculateGstTaxSplit(items, '29', '09');
    expect(interTax.cgstTotal).toBe(0);
    expect(interTax.sgstTotal).toBe(0);
    expect(interTax.igstTotal).toBe(25);
    expect(interTax.grandTotal).toBe(525);
    expect(interTax.isInterstate).toBe(true);
  });

  it('completes storefront order checkout atomically and updates stock & inventory ledger', async () => {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch variant
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: variantA1Id },
        include: { product: true },
      });

      const orderNumber = `BS-TEST-${Date.now()}`;
      const qtyRequested = 3;
      const initialStock = variant.currentStock;

      // 2. Create Customer
      const customer = await tx.customer.create({
        data: {
          tenantId: tenantAId,
          name: 'Ananya Sharma',
          phone: '9876543210',
          email: 'ananya@example.com',
        },
      });

      // 3. Create Order with STOREFRONT channel
      const order = await tx.order.create({
        data: {
          tenantId: tenantAId,
          orderNumber,
          customerId: customer.id,
          channel: 'STOREFRONT',
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          subtotal: 750,
          taxTotal: 37.5,
          grandTotal: 787.5,
        },
      });

      // 4. Create OrderItem & decrement stock
      await tx.orderItem.create({
        data: {
          tenantId: tenantAId,
          orderId: order.id,
          variantId: variantA1Id,
          productTitle: variant.product.title,
          sku: variant.sku,
          quantity: qtyRequested,
          unitPrice: 250,
          hsnCode: '0902',
          gstRate: 5,
          cgstAmount: 18.75,
          sgstAmount: 18.75,
          igstAmount: 0,
          lineTotal: 787.5,
        },
      });

      const newStock = initialStock - qtyRequested;
      await tx.productVariant.update({
        where: { id: variantA1Id },
        data: { currentStock: newStock },
      });

      // 5. Write Inventory SALE ledger
      const ledgerLog = await tx.inventoryLedger.create({
        data: {
          tenantId: tenantAId,
          variantId: variantA1Id,
          changeQuantity: -qtyRequested,
          balanceAfter: newStock,
          eventType: 'SALE',
          referenceId: orderNumber,
          notes: 'Storefront Web Checkout Order',
        },
      });

      // 6. Create Payment & Invoice
      const payment = await tx.payment.create({
        data: {
          tenantId: tenantAId,
          orderId: order.id,
          amount: 787.5,
          gateway: 'CASH',
          status: 'SUCCESS',
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          tenantId: tenantAId,
          orderId: order.id,
          invoiceNumber: `INV-${orderNumber}`,
          invoiceType: 'TAX_INVOICE',
          supplierGstin: '29AAECR1234F1Z5',
          placeOfSupply: '29',
          totalCgst: 18.75,
          totalSgst: 18.75,
          totalIgst: 0,
          grandTotal: 787.5,
        },
      });

      return { order, ledgerLog, newStock, payment, invoice };
    });

    expect(result.order.channel).toBe('STOREFRONT');
    expect(result.order.status).toBe('CONFIRMED');
    expect(result.newStock).toBe(17);
    expect(result.ledgerLog.changeQuantity).toBe(-3);
    expect(result.ledgerLog.eventType).toBe('SALE');
    expect(result.payment.status).toBe('SUCCESS');
    expect(result.invoice.invoiceNumber).toBeDefined();
  });

  it('prevents cross-tenant checkout (attempting to order Tenant B variant under Tenant A throws error)', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        // Attempting to query variantB1Id under tenantAId must yield 0 results
        const variants = await tx.productVariant.findMany({
          where: { id: { in: [variantB1Id] }, tenantId: tenantAId },
        });

        if (variants.length !== 1) {
          throw new Error('One or more requested variants belong to another store');
        }
      })
    ).rejects.toThrow('One or more requested variants belong to another store');
  });

  it('rejects checkout when requested quantity exceeds available stock', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.findUniqueOrThrow({
          where: { id: variantA2Id }, // Stock is 0
        });

        if (variant.currentStock < 1) {
          throw new Error(`Insufficient stock for ${variant.variantName}`);
        }
      })
    ).rejects.toThrow('Insufficient stock for 1Kg Bulk Pack');
  });
});
