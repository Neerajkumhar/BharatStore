import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTenantDb, prisma } from './client';
import {
  dispatchNotification,
  interpolateTemplate,
} from '../../../apps/web/lib/notification-engine';

describe('Milestone 8: Notifications & Customer Engagement Engine', () => {
  let tenantAId: string;
  let tenantBId: string;
  let customerA1Id: string;
  let customerA1Phone: string;
  let customerA2Id: string;
  let customerA2Phone: string;

  beforeAll(async () => {
    // 1. Create Tenant A
    const tenantA = await prisma.tenant.create({
      data: {
        legalName: 'Varanasi Silks & Sarees',
        tradeName: 'Varanasi Silks',
        slug: `varanasi-silks-${Date.now()}`,
        phone: '9876543299',
        addressLine1: '88 Ghat Road',
        city: 'Varanasi',
        stateCode: '09',
        pincode: '221001',
      },
    });
    tenantAId = tenantA.id;

    // 2. Create Tenant B
    const tenantB = await prisma.tenant.create({
      data: {
        legalName: 'Jaipur Handlooms Pvt Ltd',
        tradeName: 'Jaipur Handlooms',
        slug: `jaipur-handlooms-${Date.now()}`,
        phone: '9876543298',
        addressLine1: '14 Johari Bazar',
        city: 'Jaipur',
        stateCode: '08',
        pincode: '302001',
      },
    });
    tenantBId = tenantB.id;

    const tenantDbA = getTenantDb(tenantAId);

    // 3. Create Customers for Tenant A
    const customerA1 = await tenantDbA.customer.create({
      data: {
        name: 'Priya Sharma',
        phone: '9988776655',
        email: 'priya@example.com',
      },
    });
    customerA1Id = customerA1.id;
    customerA1Phone = customerA1.phone;

    const customerA2 = await tenantDbA.customer.create({
      data: {
        name: 'Rahul Kapoor',
        phone: '9988776656',
        email: 'rahul@example.com',
      },
    });
    customerA2Id = customerA2.id;
    customerA2Phone = customerA2.phone;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.notification.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.notificationPreference.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.notificationTemplate.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.customer.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
  });

  it('1. Dispatches IN_APP notification with DELIVERED status and valid timestamps', async () => {
    const res = await dispatchNotification({
      tenantId: tenantAId,
      customerId: customerA1Id,
      type: 'ORDER_CONFIRMED',
      channel: 'IN_APP',
      title: 'Order Confirmed',
      message: 'Your order has been confirmed successfully.',
    });

    expect(res.blocked).toBe(false);
    expect(res.notification).toBeDefined();
    expect(res.notification?.status).toBe('DELIVERED');
    expect(res.notification?.deliveredAt).toBeDefined();
  });

  it('2. Marks external provider as FAILED with explicit reason when API credentials are missing (No fake delivery)', async () => {
    // Email without EMAIL_API_KEY env
    const emailRes = await dispatchNotification({
      tenantId: tenantAId,
      customerId: customerA1Id,
      type: 'ORDER_DISPATCHED',
      channel: 'EMAIL',
      title: 'Order Dispatched',
      message: 'Your order is on the way.',
    });

    expect(emailRes.blocked).toBe(false);
    expect(emailRes.notification?.status).toBe('FAILED');
    expect(emailRes.notification?.failureReason).toContain('Provider not configured');

    // SMS without SMS_API_KEY env
    const smsRes = await dispatchNotification({
      tenantId: tenantAId,
      customerId: customerA1Id,
      type: 'PAYMENT_RECEIVED',
      channel: 'SMS',
      title: 'Payment Received',
      message: 'Payment of Rs. 1000 received.',
    });

    expect(smsRes.notification?.status).toBe('FAILED');
    expect(smsRes.notification?.failureReason).toContain('SMS Gateway credentials missing');
  });

  it('3. Safely interpolates template variables and prevents template script injection', async () => {
    const interpolated = interpolateTemplate('Hello {{customerName}}, order {{orderNumber}} is ready.', {
      customerName: 'Priya',
      orderNumber: 'BS-1001',
    });
    expect(interpolated).toBe('Hello Priya, order BS-1001 is ready.');

    // Injection attempt with script tag
    const injectionAttempt = interpolateTemplate('Hello {{customerName}}', {
      customerName: '<script>alert("hacked")</script>',
    });
    expect(injectionAttempt).not.toContain('<script>');
    expect(injectionAttempt).toContain('&lt;script&gt;');
  });

  it('4. Enforces customer marketing opt-out preference', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    // Set Customer A2 preference to opt out of marketing
    await tenantDbA.notificationPreference.create({
      data: {
        customerId: customerA2Id,
        marketing: false,
        orderUpdates: true,
      },
    });

    // Attempt to send marketing CAMPAIGN notification -> blocked
    const resMarketing = await dispatchNotification({
      tenantId: tenantAId,
      customerId: customerA2Id,
      type: 'CAMPAIGN',
      channel: 'IN_APP',
      title: 'Festive Sale 50% OFF',
      message: 'Check out our Diwali collection!',
    });

    expect(resMarketing.blocked).toBe(true);
    expect(resMarketing.reason).toContain('opted out of marketing');

    // Order update for Customer A2 should still pass
    const resOrder = await dispatchNotification({
      tenantId: tenantAId,
      customerId: customerA2Id,
      type: 'ORDER_DELIVERED',
      channel: 'IN_APP',
      title: 'Order Delivered',
      message: 'Your order was delivered.',
    });

    expect(resOrder.blocked).toBe(false);
    expect(resOrder.notification?.status).toBe('DELIVERED');
  });

  it('5. Manages notification templates and enforces tenant-scoped unique name constraint', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    const tpl1 = await tenantDbA.notificationTemplate.create({
      data: {
        name: 'Order Confirmation SMS',
        type: 'ORDER_CONFIRMED',
        channel: 'SMS',
        body: 'Dear {{customerName}}, order {{orderNumber}} is confirmed.',
        variables: ['customerName', 'orderNumber'],
      },
    });

    expect(tpl1.id).toBeDefined();

    // Duplicate name in same tenant should fail
    await expect(
      tenantDbA.notificationTemplate.create({
        data: {
          name: 'Order Confirmation SMS',
          type: 'ORDER_CONFIRMED',
          channel: 'SMS',
          body: 'Duplicate body',
        },
      })
    ).rejects.toThrow();

    // Same template name in Tenant B should pass
    const tenantDbB = getTenantDb(tenantBId);
    const tplB = await tenantDbB.notificationTemplate.create({
      data: {
        name: 'Order Confirmation SMS',
        type: 'ORDER_CONFIRMED',
        channel: 'SMS',
        body: 'Tenant B body',
      },
    });
    expect(tplB.tenantId).toBe(tenantBId);
  });

  it('6. Enforces tenant isolation for notification queries', async () => {
    const tenantDbA = getTenantDb(tenantAId);
    const tenantDbB = getTenantDb(tenantBId);

    const notifsA = await tenantDbA.notification.findMany();
    const notifsB = await tenantDbB.notification.findMany();

    expect(notifsA.every((n) => n.tenantId === tenantAId)).toBe(true);
    expect(notifsB.every((n) => n.tenantId === tenantBId)).toBe(true);

    // Cross tenant lookup returns null
    const notifAFirst = notifsA[0];
    const crossCheck = await tenantDbB.notification.findUnique({
      where: { id: notifAFirst.id },
    });
    expect(crossCheck).toBeNull();
  });
});
