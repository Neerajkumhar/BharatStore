import { prisma } from '@bharatstore/database';

export function currentUsagePeriod(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

export async function getOrCreateUsage(tenantId: string) {
  const period = currentUsagePeriod();
  const usage = await prisma.tenantUsage.upsert({
    where: { tenantId_period: { tenantId, period } },
    update: {},
    create: { tenantId, period },
  });
  return usage;
}

export async function trackUsage(
  tenantId: string,
  increment: Partial<{ productsCount: number; ordersCount: number; staffCount: number; storageUsedMb: number; apiCalls: number }>
): Promise<void> {
  const period = currentUsagePeriod();
  await prisma.tenantUsage.upsert({
    where: { tenantId_period: { tenantId, period } },
    update: {
      ...(increment.productsCount ? { productsCount: { increment: increment.productsCount } } : {}),
      ...(increment.ordersCount ? { ordersCount: { increment: increment.ordersCount } } : {}),
      ...(increment.staffCount ? { staffCount: { increment: increment.staffCount } } : {}),
      ...(increment.storageUsedMb ? { storageUsedMb: { increment: increment.storageUsedMb } } : {}),
      ...(increment.apiCalls ? { apiCalls: { increment: increment.apiCalls } } : {}),
    },
    create: {
      tenantId,
      period,
      productsCount: increment.productsCount ?? 0,
      ordersCount: increment.ordersCount ?? 0,
      staffCount: increment.staffCount ?? 0,
      storageUsedMb: increment.storageUsedMb ?? 0,
      apiCalls: increment.apiCalls ?? 0,
    },
  });
}