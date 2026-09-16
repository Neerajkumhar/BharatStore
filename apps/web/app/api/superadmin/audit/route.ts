import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const action = url.searchParams.get('action')?.trim() || '';
    const actor = url.searchParams.get('actor')?.trim() || '';
    const severity = url.searchParams.get('severity')?.trim() || '';
    const from = url.searchParams.get('from')?.trim() || '';
    const to = url.searchParams.get('to')?.trim() || '';

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (severity) where.severity = severity;
    if (actor) {
      where.OR = [{ actorEmail: { contains: actor, mode: 'insensitive' } }, { actorId: actor }];
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.platformAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.platformAuditLog.count({ where }),
    ]);

    const byAction = await prisma.platformAuditLog.groupBy({
      by: ['action'],
      where,
      _count: { _all: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: logs.map((log) => ({ ...log, timestamp: log.createdAt })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), counts: byAction },
    });
  } catch (error: any) {
    console.error('Super admin audit list error:', error);
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
}