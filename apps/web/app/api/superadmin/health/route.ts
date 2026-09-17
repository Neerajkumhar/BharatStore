import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

export const dynamic = 'force-dynamic';

async function measure(name: string, fn: () => Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    return { name, ok: true, latencyMs: Number((performance.now() - start).toFixed(1)) };
  } catch (error: any) {
    return { name, ok: false, latencyMs: Number((performance.now() - start).toFixed(1)), error: error.message };
  }
}

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  const checks = await Promise.all([
    measure('Database connection', async () => {
      await prisma.$queryRaw`SELECT 1`;
    }),
    measure('Tenants table', async () => {
      await prisma.tenant.count();
    }),
    measure('Users table', async () => {
      await prisma.user.count();
    }),
    measure('Products table', async () => {
      await prisma.product.count();
    }),
    measure('Orders table', async () => {
      await prisma.order.count();
    }),
    measure('Plans table', async () => {
      await prisma.subscriptionPlan.count();
    }),
    measure('Feature flags table', async () => {
      await prisma.featureFlag.count();
    }),
  ]);

  const allOk = checks.every((c) => c.ok);

  const [tenantCount, userCount, productCount, orderCount, planCount, featureCount, trialCount] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.subscriptionPlan.count(),
    prisma.featureFlag.count(),
    prisma.tenantSubscription.count({ where: { status: 'TRIAL' } }),
  ]);

  const migrations = await prisma.$queryRaw<
    Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null; logs: string | null }>
  >`SELECT migration_name, finished_at, rolled_back_at, logs FROM "_prisma_migrations" ORDER BY finished_at DESC NULLS LAST LIMIT 5`;

  const lastHealthCheck = await prisma.platformAuditLog.findFirst({
    where: { action: 'monitor.health_check' },
    orderBy: { createdAt: 'desc' },
  });

  await logPlatformAction({
    actorId: auth.userId!,
    actorEmail: auth.userEmail!,
    action: 'monitor.health_check',
    targetType: 'system',
    targetName: 'platform',
    afterState: { ok: allOk, checks: `${checks.filter((c) => c.ok).length}/${checks.length} passed`, at: new Date().toISOString() },
    ipAddress: clientIp(request),
  });

  const formattedMigrations = migrations.map((m) => ({
    name: m.migration_name,
    finishedAt: m.finished_at,
    rolledBackAt: m.rolled_back_at,
    logs: m.logs,
  }));

  return NextResponse.json({
    success: true,
    data: {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSec: process.uptime(),
      checks,
      counts: {
        tenants: tenantCount,
        users: userCount,
        products: productCount,
        orders: orderCount,
        plans: planCount,
        features: featureCount,
        trialing: trialCount,
      },
      migrations: formattedMigrations,
      lastHealthCheck,
      env: {
        NODE_ENV: process.env.NODE_ENV ?? 'unknown',
        DATABASE_URL_REACHABLE: process.env.DATABASE_URL ? 'configured' : 'MISSING',
      },
    },
  });
}