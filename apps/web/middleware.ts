import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@bharatstore/database';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/products', '/orders', '/customers', '/inventory', '/settings'];
const authRoutes = ['/login', '/register'];
const superAdminRoutes = ['/superadmin'];
const superAdminApiRoutes = ['/api/superadmin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session = null;
  if (sessionToken) {
    try {
      session = await verifyJWT(sessionToken);
    } catch (e) {
      session = null;
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isSuperAdminRoute = superAdminRoutes.some((route) => pathname.startsWith(route));
  const isSuperAdminApiRoute = superAdminApiRoutes.some((route) => pathname.startsWith(route));

  // A signed JWT is only meaningful if the user still has an active tenant
  // membership. After a DB reset or a departed staff member, a previously
  // issued token becomes orphaned: treating it as "authenticated" would
  // lock the user out of /login and make every admin API return 403.
  let hasActiveMembership = true;
  if (session?.tenantId && session.userId) {
    try {
      const membership = await prisma.userTenant.findFirst({
        where: {
          userId: session.userId,
          tenantId: session.tenantId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      hasActiveMembership = Boolean(membership);
    } catch (e) {
      console.error('Middleware membership check failed, falling back to token-only:', e);
    }
  }

  // Redirect unauthenticated user trying to access protected routes
  if (isProtectedRoute && !(session && hasActiveMembership)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from login page to dashboard
  if (isAuthRoute && session && hasActiveMembership) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Super admin route protection
  if ((isSuperAdminRoute || isSuperAdminApiRoute) && !session) {
    const loginUrl = new URL('/superadmin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((isSuperAdminRoute || isSuperAdminApiRoute) && session && !session.isSuperAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Plain /superadmin (no trailing path) with a super admin session -> dashboard landing
  if (pathname === '/superadmin' && session?.isSuperAdmin) {
    return NextResponse.redirect(new URL('/superadmin/overview', request.url));
  }

  // Clone headers to inject ambient tenant context
  const requestHeaders = new Headers(request.headers);
  if (session?.tenantId) {
    requestHeaders.set('x-tenant-id', session.tenantId);
  }
  if (session?.userId) {
    requestHeaders.set('x-user-id', session.userId);
  }
  if (session?.role) {
    requestHeaders.set('x-user-role', session.role);
  }
  if (session?.isSuperAdmin) {
    requestHeaders.set('x-is-superadmin', 'true');
  }
  if (session?.isImpersonation) {
    requestHeaders.set('x-impersonation', 'true');
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, except where needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
