/**
 * Single source of truth for resolving section product/category payloads.
 *
 * Both the server storefront renderer (live store) and the client builder
 * canvas previously implemented the same "map real records, fall back to demo
 * data, apply per-item image overrides" logic. Keeping that resolution here
 * avoids the two implementations drifting (layout/preview mismatches).
 */

export interface SectionVariant {
  id: string;
  sku: string;
  variantName: string;
  priceOverride: number | null;
  currentStock: number;
}

export interface SectionProduct {
  id: string;
  title: string;
  slug: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  categoryName: string;
  variants: SectionVariant[];
}

export interface SectionCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count: { products: number };
}

function toVariant(v: any): SectionVariant {
  return {
    id: v?.id ?? '',
    sku: v?.sku || '',
    variantName: v?.variantName || 'Default',
    priceOverride: v?.priceOverride != null ? Number(v.priceOverride) : null,
    currentStock: Number(v?.currentStock) || 0,
  };
}

/**
 * Resolves the product payload for a section: real DB/API products first
 * (limited + image-overridden), otherwise demo products so the layout/preview
 * still renders without a populated catalog.
 */
export function resolveSectionProducts(
  products: any[],
  demoProducts: any[],
  limit: number,
  overrides?: Record<string, string>
): SectionProduct[] {
  if (Array.isArray(products) && products.length > 0) {
    return products.slice(0, limit).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      sellingPrice: Number(p.sellingPrice) || 0,
      mrp: Number(p.mrp) || 0,
      images: overrides?.[p.id] ? [overrides[p.id]] : Array.isArray(p.images) ? p.images : [],
      categoryName: p.categoryName || p.category?.name || '',
      variants: Array.isArray(p.variants) ? p.variants.map(toVariant) : [],
    }));
  }

  return (demoProducts || []).slice(0, limit).map((p, idx) => ({
    id: `demo_prod_${idx}`,
    title: p.title,
    slug: `demo-prod-${idx}`,
    sellingPrice: Number(p.price) || 0,
    mrp: Number(p.mrp) || 0,
    images: [overrides?.[`demo_prod_${idx}`] ?? p.image],
    categoryName: p.category || '',
    variants: [],
  }));
}

/**
 * Resolves the category payload for a section (same fallback + override rules
 * as products).
 */
export function resolveSectionCategories(
  categories: any[],
  demoCategories: any[],
  limit: number,
  overrides?: Record<string, string>
): SectionCategory[] {
  if (Array.isArray(categories) && categories.length > 0) {
    return categories.slice(0, limit).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: overrides?.[c.id] ?? c.image ?? null,
      _count: { products: Number(c.count ?? c._count?.products ?? 0) },
    }));
  }

  return (demoCategories || []).slice(0, limit).map((c, idx) => ({
    id: `demo_cat_${idx}`,
    name: c.name,
    slug: c.slug,
    image: overrides?.[`demo_cat_${idx}`] ?? c.image ?? null,
    _count: { products: Number(c.count) || 0 },
  }));
}