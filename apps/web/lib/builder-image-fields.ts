import type { SectionType } from '@bharatstore/shared/constants';
import {
  SECTION_TYPES,
} from '@bharatstore/shared/constants';

/**
 * Describes where an image change should be written when the user clicks an
 * <img> inside a section in the editable storefront canvas.
 *
 * - `config`: the image is stored directly on the section config under `key`.
 * - `products`: the image belongs to a product resolved from store data. The
 *   change is persisted as a `imageOverrides` entry inside `config` (and, when
 *   the product is a real DB product, also pushed to the product record).
 * - `categories`: the image belongs to a category resolved from store data.
 */
export type EditableImageTarget =
  | { kind: 'config'; key: string; label: string }
  | { kind: 'products'; label: string }
  | { kind: 'categories'; label: string };

/** Sections whose image lives directly on the section config. */
const CONFIG_IMAGE_TYPES: Partial<Record<SectionType, { key: string; label: string }>> = {
  [SECTION_TYPES.HERO]: { key: 'imageUrl', label: 'Hero Image' },
  [SECTION_TYPES.HERO_FULLSCREEN]: { key: 'imageUrl', label: 'Hero Image' },
  [SECTION_TYPES.HERO_SPLIT]: { key: 'imageUrl', label: 'Hero Image' },
  [SECTION_TYPES.HERO_EDITORIAL]: { key: 'imageUrl', label: 'Editorial Image' },
  [SECTION_TYPES.HERO_PRODUCT]: { key: 'imageUrl', label: 'Product Image' },
  [SECTION_TYPES.BANNER]: { key: 'imageUrl', label: 'Banner Image' },
  [SECTION_TYPES.ABOUT]: { key: 'imageUrl', label: 'About Image' },
  [SECTION_TYPES.PRODUCT_SPOTLIGHT]: { key: 'imageUrl', label: 'Spotlight Image' },
  [SECTION_TYPES.EDITORIAL_SPLIT]: { key: 'imageUrl', label: 'Editorial Image' },
  [SECTION_TYPES.EDITORIAL_FULLWIDTH]: { key: 'imageUrl', label: 'Story Image' },
};

/** Sections that render product images resolved from store data. */
const PRODUCT_IMAGE_TYPES = new Set<SectionType>([
  SECTION_TYPES.FEATURED_PRODUCTS,
  SECTION_TYPES.PRODUCT_GRID,
  SECTION_TYPES.PRODUCT_CAROUSEL,
  SECTION_TYPES.PRODUCT_RAIL,
  SECTION_TYPES.PRODUCT_TRENDING,
  SECTION_TYPES.PRODUCT_TABS,
  SECTION_TYPES.FLASH_SALE,
  SECTION_TYPES.PRODUCT_COMPARISON,
]);

/** Sections that render category images resolved from store data. */
const CATEGORY_IMAGE_TYPES = new Set<SectionType>([
  SECTION_TYPES.CATEGORY_CIRCULAR,
  SECTION_TYPES.CATEGORY_MEGA,
]);

/**
 * Resolve the editable target for an `<img>` inside a section. The index is
 * the position of the image within the rendered section DOM (used to keep
 * data-driven lists aligned with the clicked item).
 */
export function getEditableImageTarget(type: string): EditableImageTarget | null {
  const t = type as SectionType;
  const configField = CONFIG_IMAGE_TYPES[t];
  if (configField) return { kind: 'config', ...configField };
  if (PRODUCT_IMAGE_TYPES.has(t)) return { kind: 'products', label: 'Product Image' };
  if (CATEGORY_IMAGE_TYPES.has(t)) return { kind: 'categories', label: 'Category Image' };
  return null;
}

/** Persist an image override into a section config and return the new config. */
export function buildConfigWithImageOverride(
  config: Record<string, unknown>,
  itemId: string,
  url: string
): Record<string, unknown> {
  const existing = (config.imageOverrides as Record<string, string> | undefined) || {};
  return { ...config, imageOverrides: { ...existing, [itemId]: url } };
}