import { getTenantDb } from '@bharatstore/database';

export interface StorefrontNavItem {
  label: string;
  slug: string;
}

interface NavPageRow {
  slug: string;
  title: string;
  navLabel: string | null;
  showInMenu: boolean;
  status: string;
  draftConfig: unknown;
  publishedConfig: unknown;
  order: number;
  createdAt: Date;
}

export const PAGE_SLUG_REGEX = /^[a-z0-9-]+$/;

export const RESERVED_PAGE_SLUGS: ReadonlySet<string> = new Set([
  'products',
  'checkout',
  'orders',
  'order-confirmation',
]);

export function validatePageSlug(slug: string): string | null {
  if (!slug) return 'Slug is required.';
  if (!PAGE_SLUG_REGEX.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers and hyphens.';
  }
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    return `"${slug}" is a reserved route and cannot be used as a page slug.`;
  }
  return null;
}

export function toStorefrontNavItems(
  pages: NavPageRow[],
  isPreview: boolean
): StorefrontNavItem[] {
  return pages
    .filter((p) => p.showInMenu === true)
    .filter((p) => {
      if (isPreview) {
        return (p.status === 'PUBLISHED' || p.status === 'DRAFT') &&
          hasSections(p.draftConfig);
      }
      return p.status === 'PUBLISHED' && hasSections(p.publishedConfig);
    })
    .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
    .map((p) => ({
      label: p.navLabel?.trim() ? p.navLabel.trim() : p.title,
      slug: p.slug,
    }));
}

function hasSections(config: unknown): boolean {
  const sections = (config as { sections?: { length: number } } | null)?.sections;
  return Array.isArray(sections) && sections.length > 0;
}

export async function getStorefrontNavPages(
  tenantId: string,
  isPreview: boolean
): Promise<StorefrontNavItem[]> {
  const tenantDb = getTenantDb(tenantId);
  const pages = await tenantDb.storefrontPage.findMany({
    where: { tenantId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return toStorefrontNavItems(pages as NavPageRow[], isPreview);
}