import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTenantDb, prisma } from './client';

describe('Business Analytics & Tenant Isolation Tests', () => {
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    // Tenant A Setup
    const tenantA = await prisma.tenant.create({
      data: {
        legalName: 'Analytics Tenant A Ltd',
        tradeName: 'Store A',
        slug: `analytics-tenant-a-${Date.now()}`,
        phone: '9111111111',
        addressLine1: '101 MG Road',
        city: 'Varanasi',
        stateCode: '09',
        pincode: '221001',
      },
    });
    tenantAId = tenantA.id;

    // Tenant B Setup
    const tenantB = await prisma.tenant.create({
      data: {
        legalName: 'Analytics Tenant B Ltd',
        tradeName: 'Store B',
        slug: `analytics-tenant-b-${Date.now()}`,
        phone: '9222222222',
        addressLine1: '202 Commercial St',
        city: 'Bengaluru',
        stateCode: '29',
        pincode: '560001',
      },
    });
    tenantBId = tenantB.id;

    // Create Order for Tenant A
    await prisma.order.create({
      data: {
        tenantId: tenantAId,
        orderNumber: `BS-A-${Date.now()}`,
        channel: 'POS_COUNTER',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 1000,
        taxTotal: 50,
        grandTotal: 1050,
      },
    });

    // Create Order for Tenant B
    await prisma.order.create({
      data: {
        tenantId: tenantBId,
        orderNumber: `BS-B-${Date.now()}`,
        channel: 'STOREFRONT',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 5000,
        taxTotal: 250,
        grandTotal: 5250,
      },
    });
  });

  afterAll(async () => {
    if (tenantAId) await prisma.tenant.delete({ where: { id: tenantAId } });
    if (tenantBId) await prisma.tenant.delete({ where: { id: tenantBId } });
  });

  it('calculates total revenue scoped strictly to Tenant A', async () => {
    const tenantADb = getTenantDb(tenantAId);
    const ordersA = await tenantADb.order.findMany();

    const revenueA = ordersA.reduce((acc, o) => acc + Number(o.grandTotal), 0);
    expect(ordersA.length).toBe(1);
    expect(revenueA).toBe(1050);
  });

  it('prevents Tenant A client from overriding tenantId to fetch Tenant B data', async () => {
    const tenantADb = getTenantDb(tenantAId);
    // Even if an attacker passes tenantBId in where query, getTenantDb forces tenantAId
    const queriedOrders = await tenantADb.order.findMany({
      where: { tenantId: tenantBId } as any,
    });

    // All returned orders must belong strictly to Tenant A
    expect(queriedOrders.every((o) => o.tenantId === tenantAId)).toBe(true);
    expect(queriedOrders.some((o) => o.tenantId === tenantBId)).toBe(false);
  });

  it('calculates correct average order value (AOV)', async () => {
    const tenantADb = getTenantDb(tenantAId);
    const orders = await tenantADb.order.findMany();

    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
    const aov = orders.length > 0 ? totalRevenue / orders.length : 0;

    expect(aov).toBe(1050);
  });
});
