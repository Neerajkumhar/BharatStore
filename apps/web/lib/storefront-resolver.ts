import { prisma } from '@bharatstore/database';
import { normalizeStoreHost } from '@/lib/storefront-url';

// Pure URL helpers live in storefront-url (client-safe). Re-export them so
// existing server-side imports from this module keep working unchanged.
export {
  normalizeStoreHost,
  getPlatformHost,
  getPlatformHostWithPort,
  getPublicProtocol,
  getPlatformHostClient,
  buildLiveUrl,
} from '@/lib/storefront-url';

export interface StoreLookup {
  slug?: string;
  subdomain?: string;
  customDomain?: string;
}

/**
 * Builds a Prisma lookup for a public storefront request.
 * Priority: custom domain > platform subdomain > path slug.
 * This lets a single `/store/[slug]` route serve path-based URLs,
 * `storename.bharatstore.com` subdomains, and connected custom domains.
 */
export function resolveStoreLookup(lookup: StoreLookup) {
  const customDomain = normalizeStoreHost(lookup.customDomain);
  if (customDomain) return { customDomain };

  const subdomain = (lookup.subdomain || '').toLowerCase();
  if (subdomain) return { subdomain };

  return { slug: lookup.slug as string };
}

export async function findStorefrontTenant<T extends Record<string, unknown>>(
  lookup: StoreLookup,
  options?: T
): Promise<any> {
  const where = resolveStoreLookup(lookup);
  if (!where.slug && !where.subdomain && !where.customDomain) return null;

  return (prisma.tenant.findUnique as any)({
    where,
    ...(options || {}),
  });
}

/**
 * Server-component helper: reads tenant-locating headers injected by middleware
 * (x-custom-domain for connected domains, x-store-key for platform subdomains).
 */
export async function getRequestStoreLookup(slug: string): Promise<StoreLookup> {
  const { headers } = await import('next/headers');
  const h = await headers();
  return {
    slug,
    subdomain: h.get('x-store-key') || undefined,
    customDomain: h.get('x-custom-domain') || undefined,
  };
}

/**
 * Locates a storefront tenant from a request (API route) or the passed slug.
 * API routes read `request.headers` directly on top of the path slug.
 */
export function getRequestStoreLookupFromRequest(request: Request, slug: string): StoreLookup {
  return {
    slug,
    subdomain: request.headers.get('x-store-key') || undefined,
    customDomain: request.headers.get('x-custom-domain') || undefined,
  };
}
