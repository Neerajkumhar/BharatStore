import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/products', '/orders', '/customers', '/inventory', '/settings'];
const authRoutes = ['/login', '/register'];

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

  // Redirect unauthenticated user trying to access protected routes
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from login page to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
