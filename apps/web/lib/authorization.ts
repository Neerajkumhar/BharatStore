import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { verifyJWT, SESSION_COOKIE_NAME } from './auth';
import { ROLE_PERMISSIONS, SYSTEM_ROLES, PermissionCode } from '@bharatstore/shared/constants';

export interface AuthorizationResult {
  authorized: boolean;
  tenantId?: string;
  userId?: string;
  roleName?: string;
  userEmail?: string;
  permissions?: string[];
  response?: NextResponse;
}

async function logSecurityEvent(data: {
  tenantId: string | null;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string | null;
  details: Record<string, unknown>;
}) {
  try {
    await prisma.securityEvent.create({
      data: {
        tenantId: data.tenantId,
        eventType: data.eventType,
        severity: data.severity,
        ipAddress: data.ipAddress,
        details: data.details as any,
      },
    });
  } catch (error) {
    console.warn('Failed to persist security event, continuing authorization:', error);
  }
}

export async function authorizeRequest(
  request: Request,
  requiredPermission?: PermissionCode
): Promise<AuthorizationResult> {
  try {
    // 1. Resolve session token from cookie or Authorization header
    let token: string | undefined;

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.split('; ').find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`));
      if (match) {
        token = match.split('=')[1];
      }
    }

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized: Missing authentication session' }, { status: 401 }),
      };
    }

    const session = await verifyJWT(token);
    if (!session || !session.userId) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 }),
      };
    }

    // 2. Resolve active tenant context
    const headerTenantId = request.headers.get('x-tenant-id');
    let targetTenantId = headerTenantId || session.tenantId;

    if (!targetTenantId) {
      const activeTenant = await prisma.tenant.findFirst({
        where: { memberships: { some: { userId: session.userId, status: 'ACTIVE' } } },
      });

      if (!activeTenant) {
        return {
          authorized: false,
          response: NextResponse.json({ error: 'Forbidden: User is not associated with any active tenant' }, { status: 403 }),
        };
      }

      targetTenantId = activeTenant.id;
    }
    if (!targetTenantId) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden: No valid tenant context found' }, { status: 403 }),
      };
    }

    // 3. Query user membership & role within target tenant
    const membership = await prisma.userTenant.findFirst({
      where: {
        userId: session.userId,
        tenantId: targetTenantId,
        status: 'ACTIVE',
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!membership) {
      // Log security event for cross-tenant or unauthorized attempt. The
      // target tenant may be stale/unknown (e.g. after a DB reset), so the
      // log must never turn this authorization decision into a 500.
      await logSecurityEvent({
        tenantId: targetTenantId,
        eventType: 'UNAUTHORIZED_CROSS_TENANT_ATTEMPT',
        severity: 'HIGH',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        details: {
          userId: session.userId,
          userEmail: session.email,
          attemptedTenantId: targetTenantId,
          path: new URL(request.url).pathname,
        },
      });

      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden: Access to this business tenant is denied' }, { status: 403 }),
      };
    }

    const roleName = membership.role.name;
    const permissions: string[] = roleName === SYSTEM_ROLES.OWNER
      ? Object.values(ROLE_PERMISSIONS.OWNER)
      : ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS] ||
        membership.role.permissions.map((rp) => rp.permission.code);

    // 4. Validate permission requirement
    if (requiredPermission && roleName !== SYSTEM_ROLES.OWNER && !permissions.includes(requiredPermission)) {
      await logSecurityEvent({
        tenantId: targetTenantId,
        eventType: 'PERMISSION_DENIED',
        severity: 'MEDIUM',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        details: {
          userId: session.userId,
          userEmail: session.email,
          roleName,
          requiredPermission,
          path: new URL(request.url).pathname,
        },
      });

      return {
        authorized: false,
        response: NextResponse.json(
          { error: `Forbidden: You do not have permission (${requiredPermission}) to perform this action` },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      tenantId: targetTenantId,
      userId: session.userId,
      roleName,
      userEmail: session.email,
      permissions,
    };
  } catch (error: any) {
    console.error('Authorization engine error:', error);
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Internal server authorization error' }, { status: 500 }),
    };
  }
}
