import { prisma } from '@bharatstore/database';

/**
 * Normalizes a host so subdomain/custom-domain routing is bug free locally and in prod.
 * - Strips the explicit port (e.g. "rajesh.localhost:3000" -> "rajesh.localhost")
 * - Strips a leading "www." so www aliases never match a store.
 */
export function normalizeStoreHost(host: string | null | undefined): string {
  if (!host) return '';
  return host
    .replace(/:\d+$/, '')
    .replace(/^www\./, '')
    .replace(/\.$/, '')
    .toLowerCase();
}

/**
 * The apex host used for platform subdomains (e.g. "bharatstore.in" or "localhost").
 * Resolves from PLATFORM_DOMAIN first, then the host of NEXT_PUBLIC_APP_URL.
 */
export function getPlatformHost(): string {
  const candidate =
    process.env.PLATFORM_DOMAIN ||
    (process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : 'localhost');
  return normalizeStoreHost(candidate);
}

/**
 * Platform host WITHOUT stripping the port — used for building display URLs
 * (e.g. http://rajesh.localhost:3000 during local development).
 */
export function getPlatformHostWithPort(): string {
  return (
    process.env.PLATFORM_DOMAIN ||
    (process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : 'localhost')
  );
}

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
  include?: T
): Promise<any> {
  const where = resolveStoreLookup(lookup);
  if (!where.slug && !where.subdomain && !where.customDomain) return null;

  return (prisma.tenant.findUnique as any)({
    where,
    ...(include ? { include } : {}),
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

/**
 * Returns the public protocol (https in production, else the app URL scheme).
 */
export function getPublicProtocol(): string {
  if (process.env.NODE_ENV === 'production') return 'https';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl && appUrl.startsWith('https') ? 'https' : 'http';
}

export function getPlatformHostClient(): string {
  return (
    (typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN as string) ||
        window.location.host.replace(/:\d+$/, '')
      : '') ||
    (process.env.NEXT_PUBLIC_APP_DOMAIN as string) ||
    getPlatformHost()
  );
}

/**
 * Builds the canonical public URL for a live store.
 * Precedence: custom domain > platform subdomain > /store/<slug> path.
 */
export function buildLiveUrl(tenant: {
  customDomain?: string | null;
  subdomain?: string | null;
  slug?: string | null;
}): string {
  if (tenant.customDomain) return `https://${normalizeStoreHost(tenant.customDomain)}`;
  if (tenant.subdomain) {
    return `${getPublicProtocol()}://${tenant.subdomain}.${getPlatformHostWithPort()}`;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return tenant.slug ? `${base.replace(/\/$/, '')}/store/${tenant.slug}` : base;
}