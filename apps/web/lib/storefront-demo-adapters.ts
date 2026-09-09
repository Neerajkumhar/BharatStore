import { STOREFRONT_DEMO_IMAGE_POOLS } from '@bharatstore/shared/constants';
import {
  DEMO_DATASETS,
  getDemoDataset,
  type DemoCategory,
  type DemoProduct,
  type DemoStore,
} from './storefront-demo-data';

export interface DemoProductCardShape {
  id: string;
  title: string;
  slug: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  categoryName?: string;
  variants: Array<{
    id: string;
    sku: string;
    variantName: string;
    priceOverride?: number | null;
    currentStock: number;
  }>;
}

export interface DemoCategoryShape {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export type DemoStoreDataShape = {
  tradeName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  gstin?: string;
  businessHours?: string;
  socialLinks?: Record<string, string>;
};

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function toDemoProductCards(products: DemoProduct[]): DemoProductCardShape[] {
  const fallbackImage = STOREFRONT_DEMO_IMAGE_POOLS.general.products[0];
  return products.map((p, i) => {
    const categorySlug = slugify(p.category) || 'category';
    return {
      id: `demo-${slugify(p.title) || `product-${i + 1}`}`,
      title: p.title,
      slug: slugify(p.title) || `product-${i + 1}`,
      sellingPrice: p.price,
      mrp: Math.max(p.mrp, p.price),
      images: [p.image || fallbackImage],
      categoryName: p.category,
      variants: [
        {
          id: `demo-var-${i + 1}`,
          sku: `DM-${String(i + 1).padStart(4, '0')}`,
          variantName: 'Default',
          priceOverride: p.mrp > p.price ? p.price : null,
          currentStock: 20,
        },
      ],
    };
  });
}

export function toDemoCategories(categories: DemoCategory[]): DemoCategoryShape[] {
  return categories.map((c, i) => ({
    id: `demo-cat-${i + 1}`,
    name: c.name,
    slug: c.slug,
    _count: { products: c.count },
  }));
}

export function toDemoStoreData(store: DemoStore, category?: string): DemoStoreDataShape {
  const socialLinks =
    category && DEMO_DATASETS[category]
      ? {
          instagram: 'https://instagram.com',
          facebook: 'https://facebook.com',
        }
      : undefined;
  return {
    tradeName: store.tradeName,
    phone: store.phone,
    email: store.email,
    address: store.address,
    city: 'Delhi',
    pincode: '110001',
    gstin: '07ABCDE1234F1Z5',
    businessHours: 'Mon – Sat, 10:00 AM – 9:00 PM',
    socialLinks,
  };
}

export interface DemoPreviewBundle {
  products: DemoProductCardShape[];
  categories: DemoCategoryShape[];
  storeData: DemoStoreDataShape;
  demoCategory: string;
}

export function getDemoPreviewBundle(category = 'general'): DemoPreviewBundle {
  const ds = getDemoDataset(category);
  return {
    products: toDemoProductCards(ds.products),
    categories: toDemoCategories(ds.categories),
    storeData: toDemoStoreData(ds.store, category),
    demoCategory: category,
  };
}