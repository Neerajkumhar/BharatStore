/**
 * Shared validation & normalization for storefront subdomains and custom domains.
 * Used by the Go-Live publish flow and the storefront settings API.
 */

export const RESERVED_SUBDOMAINS = new Set([
  'www', 'store', 'stores', 'api', 'app', 'admin', 'superadmin', 'dashboard', 'auth',
  'login', 'register', 'panel', 'my', 'mail', 'blog', 'help', 'support', 'status',
  'docs', 'dev', 'test', 'staging', 'vpn', 'ftp', 'webmail', 'mx', 'ns1', 'ns2',
  'cdn', 'static', 'assets', 'media', 'billing', 'careers', 'privacy', 'terms',
]);

export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
export const DOMAIN_PATTERN = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

export function normalizeSubdomain(value: string | undefined | null): string {
  if (!value) return '';
  return value.toLowerCase().trim().replace(/[\s_]+/g, '-');
}

export function normalizeCustomDomain(value: string | undefined | null): string {
  if (!value) return '';
  let cleaned = value.toLowerCase().trim();
  cleaned = cleaned.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\/$/, '');
  return cleaned.replace(/^www\./, '');
}

export function validateSubdomain(subdomain: string): string | null {
  if (!subdomain) return null;
  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    return 'Subdomain can only contain lowercase letters, numbers and hyphens (e.g. rajesh-fabrics).';
  }
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return `"${subdomain}" is a reserved platform subdomain. Please choose another one.`;
  }
  return null;
}

export function validateCustomDomain(customDomain: string): string | null {
  if (!customDomain) return null;
  if (!DOMAIN_PATTERN.test(customDomain)) {
    return 'Custom domain looks invalid. Use a bare domain like storename.com (no https:// or www.).';
  }
  return null;
}