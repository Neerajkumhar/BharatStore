import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';
import { getTenantFeatures } from '@/lib/feature-check';

const tenantUpdateSchema = z.object({
  legalName: z.string().min(2).optional(),
  tradeName: z.string().min(2).optional(),
  gstin: z.string().max(15).optional().nullable(),
  pan: z.string().max(10).optional().nullable(),
  phone: z.string().max(15).optional(),
  email: z.string().email().optional().nullable(),
  addressLine1: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  stateCode: z.string().length(2).optional(),
  pincode: z.string().length(6).optional(),
  isActive: z.boolean().optional(),
  isCompositeScheme: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        memberships: {
          where: { role: { name: 'OWNER' } },
          include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        },
        subscription: { include: { plan: true } },
        featureOverrides: { include: { feature: true } },
        _count: {
          select: { orders: true, products: true, customers: true, variants: true, invoices: true, staffInvitations: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Aggregate financials per tenant
    const orderAgg = await prisma.order.aggregate({
      where: { tenantId: id },
      _sum: { grandTotal: true },
      _count: true,
    });

    // Current period usage
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const usage = await prisma.tenantUsage.findUnique({
      where: { tenantId_period: { tenantId: id, period } },
    });

    const enabledFeatures = await getTenantFeatures(id);

    return NextResponse.json({
      success: true,
      data: {
        ...tenant,
        owner: tenant.memberships[0]?.user ?? null,
        subscription: tenant.subscription
          ? {
              ...tenant.subscription,
              monthlyPrice: Number(tenant.subscription.plan.monthlyPrice),
              planName: tenant.subscription.plan.name,
              planSlug: tenant.subscription.plan.slug,
              planMeta: {
                maxProducts: tenant.subscription.plan.maxProducts,
                maxOrders: tenant.subscription.plan.maxOrders,
                maxStaff: tenant.subscription.plan.maxStaff,
                maxStorageMb: tenant.subscription.plan.maxStorageMb,
              },
            }
          : null,
        featureOverrides: tenant.featureOverrides.map((o) => ({
          id: o.id,
          featureSlug: o.feature.slug,
          featureName: o.feature.name,
          enabled: o.enabled,
          reason: o.reason,
          expiresAt: o.expiresAt,
        })),
        enabledFeatures,
        stats: {
          orders: tenant._count.orders,
          products: tenant._count.products,
          customers: tenant._count.customers,
          variants: tenant._count.variants,
          invoices: tenant._count.invoices,
          grossRevenue: Number(orderAgg._sum.grandTotal ?? 0),
          orderAggCount: orderAgg._count,
        },
        usage: usage
          ? {
              period: usage.period,
              productsCount: usage.productsCount,
              ordersCount: usage.ordersCount,
              staffCount: usage.staffCount,
              storageUsedMb: Number(usage.storageUsedMb),
              apiCalls: usage.apiCalls,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Super admin tenant detail error:', error);
    return NextResponse.json({ error: 'Failed to load tenant' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = tenantUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existing = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, tradeName: true, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const beforeState: Record<string, unknown> = { ...existing };

    const updated = await prisma.tenant.update({
      where: { id },
      data: parsed.data,
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'tenant.update',
      targetType: 'tenant',
      targetId: id,
      targetName: updated.tradeName,
      beforeState,
      afterState: {
        tradeName: updated.tradeName,
        isActive: updated.isActive,
        ...(parsed.data.stateCode ? { stateCode: parsed.data.stateCode } : {}),
        ...(parsed.data.gstin !== undefined ? { gstin: parsed.data.gstin } : {}),
      },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Super admin tenant update error:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, tradeName: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Soft delete: deactivate tenant + suspend all memberships + cancel subscriptions
    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id },
        data: { isActive: false },
      });
      await tx.userTenant.updateMany({
        where: { tenantId: id },
        data: { status: 'SUSPENDED' },
      });
      await tx.tenantSubscription.updateMany({
        where: { tenantId: id },
        data: { status: 'SUSPENDED', cancelledAt: new Date() },
      });
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'tenant.suspend',
      targetType: 'tenant',
      targetId: id,
      targetName: existing.tradeName,
      beforeState: { isActive: true },
      afterState: { isActive: false },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Super admin tenant disable error:', error);
    return NextResponse.json({ error: 'Failed to disable tenant' }, { status: 500 });
  }
}