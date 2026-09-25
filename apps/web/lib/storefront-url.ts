/**
 * Pure, client-safe storefront URL helpers.
 *
 * These functions are intentionally free of Prisma / Node-only imports so they
 * can be used from client components (Go-Live modal, storefront settings) as
 * well as server code, keeping the live-URL logic identical in both places.
 */

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
 *
 * On the client (window available) prefers the NEXT_PUBLIC_* vars so the
 * URL shown in the UI matches what the server returns after publish.
 */
export function getPlatformHostWithPort(): string {
  if (typeof window !== 'undefined') {
    return (
      (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN as string) ||
      (process.env.NEXT_PUBLIC_APP_DOMAIN as string) ||
      window.location.host
    );
  }
  return (
    process.env.PLATFORM_DOMAIN ||
    (process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : 'localhost')
  );
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
 *
 * Safe to call from the browser: NEXT_PUBLIC_* env vars are inlined by Next.
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
