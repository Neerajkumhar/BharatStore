import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { verifyJWT, SESSION_COOKIE_NAME, UserSessionPayload } from './auth';

export interface SuperAdminResult {
  authorized: boolean;
  userId?: string;
  userEmail?: string;
  session?: UserSessionPayload;
  response?: NextResponse;
}

export function isSuperAdminSession(session: UserSessionPayload | null): boolean {
  return Boolean(session?.isSuperAdmin);
}

export async function authorizeSuperAdmin(request: Request): Promise<SuperAdminResult> {
  try {
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
    if (!session || !session.userId || !session.isSuperAdmin) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden: Super Admin privileges required' }, { status: 403 }),
      };
    }

    // Belt-and-suspenders: verify against DB that the user is still a super admin
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, fullName: true, isSuperAdmin: true },
    });

    if (!user || !user.isSuperAdmin) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden: Super Admin privileges revoked' }, { status: 403 }),
      };
    }

    return {
      authorized: true,
      userId: user.id,
      userEmail: user.email,
      session: { ...session, email: user.email, name: user.fullName },
    };
  } catch (error: any) {
    console.error('Super Admin authorization error:', error);
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Internal server authorization error' }, { status: 500 }),
    };
  }
}

export function withSuperAdmin<T>(handler: (request: Request, auth: SuperAdminResult, context: { params: Record<string, string> }) => Promise<T>) {
  return async (request: Request, context: { params: Record<string, string> }) => {
    const auth = await authorizeSuperAdmin(request);
    if (!auth.authorized) {
      return auth.response;
    }
    return handler(request, auth, context);
  };
}