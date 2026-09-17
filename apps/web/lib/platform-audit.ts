import { prisma } from '@bharatstore/database';

export interface PlatformLogEntry {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logPlatformAction(entry: PlatformLogEntry): Promise<void> {
  try {
    await prisma.platformAuditLog.create({
      data: {
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        targetName: entry.targetName,
        beforeState: entry.beforeState as any,
        afterState: entry.afterState as any,
        details: entry.details as any,
        ipAddress: entry.ipAddress,
      },
    });
  } catch (error) {
    console.warn('Failed to persist platform audit log:', error);
  }
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
}