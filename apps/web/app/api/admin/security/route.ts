import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.SECURITY_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response!;
    }

    const [securityEvents, totalStaffCount, recentAuditCount] = await Promise.all([
      prisma.securityEvent.findMany({
        where: {
          OR: [{ tenantId: auth.tenantId }, { tenantId: null }],
        },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
      prisma.userTenant.count({ where: { tenantId: auth.tenantId, status: 'ACTIVE' } }),
      prisma.auditLog.count({ where: { tenantId: auth.tenantId } }),
    ]);

    // Calculate real security health metrics based on actual system state
    const criticalEvents = securityEvents.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
    const healthScore = Math.max(0, 100 - criticalEvents * 10);

    return NextResponse.json({
      success: true,
      data: {
        securityHealth: {
          score: healthScore,
          status: healthScore >= 90 ? 'OPTIMAL' : healthScore >= 70 ? 'ATTENTION' : 'CRITICAL',
          mfaEnforced: false,
          bcryptHashing: true,
          jwtHS256: true,
          tenantIsolation: 'STRICT_DB_INJECTED',
          ownerProtection: true,
        },
        rbacStatus: {
          activeStaffMembers: totalStaffCount,
          ownerProtected: true,
        },
        telemetry: {
          totalAuditEntries: recentAuditCount,
          recentSecurityEventsCount: securityEvents.length,
          criticalEventsCount: criticalEvents,
        },
        securityEvents: securityEvents.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          severity: e.severity,
          ipAddress: e.ipAddress || 'Internal',
          timestamp: e.timestamp,
          details: e.details,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch security telemetry error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch security telemetry' }, { status: 500 });
  }
}
