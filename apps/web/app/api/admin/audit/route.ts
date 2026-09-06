import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.AUDIT_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const action = searchParams.get('action') || undefined;
    const resourceType = searchParams.get('resourceType') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: any = { tenantId: auth.tenantId };
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (search) {
      where.OR = [
        { actorEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { resourceType: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: { select: { fullName: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        actorName: log.actor?.fullName || 'System',
        actorEmail: log.actorEmail || log.actor?.email || 'system@bharatstore.in',
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress || '127.0.0.1',
        beforeState: log.beforeState,
        afterState: log.afterState,
        timestamp: log.timestamp,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch audit log error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audit log' }, { status: 500 });
  }
}
