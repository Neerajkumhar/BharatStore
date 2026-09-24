import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { normalizeStoreHost, getPlatformHost } from '@/lib/storefront-resolver';

const protectedRoutes = ['/dashboard', '/products', '/orders', '/customers', '/inventory', '/settings'];
const authRoutes = ['/login', '/register'];
const superAdminRoutes = ['/superadmin'];
const superAdminApiRoutes = ['/api/superadmin'];

export function resolveTenantRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const incoming = normalizeStoreHost(request.headers.get('host'));
  const platformHost = getPlatformHost();

  let customDomain: string | null = null;
  let storeKey: string | null = null;
  let rewritePath: string | null = null;

  const isApex = !incoming || incoming === platformHost;
  const isSubdomain = !isApex && hostMapsToSubdomain(incoming, platformHost);

  if (isSubdomain) {
    storeKey = incoming.slice(0, incoming.length - platformHost.length - 1).toLowerCase();
    if (pathname.startsWith('/store/') || pathname.startsWith('/api/store/')) {
      // Internal link or API call on the subdomain — path already carries the key.
      customDomain = null;
    } else if (!pathname.startsWith('/api')) {
      rewritePath = `/store/${storeKey}${pathname === '/' ? '' : pathname}`;
    }
  } else if (!isApex) {
    // Any other host is a connected custom domain.
    customDomain = incoming;
    if (!pathname.startsWith('/store/') && !pathname.startsWith('/api')) {
      rewritePath = `/store/${incoming}${pathname === '/' ? '' : pathname}`;
    }
  }

  return { storeKey, customDomain, rewritePath };
}

function hostMapsToSubdomain(host: string, platformHost: string): boolean {
  if (!platformHost) return false;
  if (host === platformHost) return false;
  return host.length > platformHost.length + 1 && host.endsWith(`.${platformHost}`);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Let the storefront layout serve the draft for ?preview=true / ?draft=true,
  // even when the store is not yet published (maintenance gate must not block it).
  const isPreviewRequest =
    request.nextUrl.searchParams.get('preview') === 'true' ||
    request.nextUrl.searchParams.get('draft') === 'true';

  // Resolve tenant-scoped storefront requests arriving on a subdomain or custom domain.
  const tenantRequest = resolveTenantRequest(request);
  if (tenantRequest.rewritePath) {
    const url = request.nextUrl.clone();
    url.pathname = tenantRequest.rewritePath;
    const requestHeaders = new Headers(request.headers);
    if (tenantRequest.customDomain) requestHeaders.set('x-custom-domain', tenantRequest.customDomain);
    if (tenantRequest.storeKey) requestHeaders.set('x-store-key', tenantRequest.storeKey);
    // The post-rewrite layout only sees these headers; without this the
    // subdomain/custom-domain preview would hit the maintenance gate while the
    // page itself would render the draft (page vs layout config mismatch).
    if (isPreviewRequest) requestHeaders.set('x-store-preview', 'true');
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

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
  if (tenantRequest.storeKey) {
    requestHeaders.set('x-store-key', tenantRequest.storeKey);
  }
  if (tenantRequest.customDomain) {
    requestHeaders.set('x-custom-domain', tenantRequest.customDomain);
  }

  // Let the storefront layout serve the draft for ?preview=true / ?draft=true
  // even when the store is not yet published (maintenance gate must not block it).
  if (isPreviewRequest) {
    requestHeaders.set('x-store-preview', 'true');
  }
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
