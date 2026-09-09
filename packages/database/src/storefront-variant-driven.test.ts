import { describe, it, expect } from 'vitest';
import {
  SECTION_TYPES,
  COMPONENT_REGISTRY,
  createDefaultSection,
  CARD_VARIANT_VALUES,
  CARD_VARIANT_LABELS,
  STOREFRONT_DEMO_IMAGE_POOLS,
  type CardVariant,
} from '@bharatstore/shared/constants';
import {
  validateSectionConfig,
  stickyHeaderConfigSchema,
  megaMenuConfigSchema,
  heroConfigSchema,
  categoriesConfigSchema,
  productCarouselConfigSchema,
  sizeGuideConfigSchema,
  shopByConcernConfigSchema,
  shopByRoomConfigSchema,
  ingredientHighlightsConfigSchema,
} from '@bharatstore/shared/schemas';

describe('Variant-Driven Storefront System', () => {
  describe('New industry section types', () => {
    it('adds the 4 new section types to SECTION_TYPES', () => {
      expect(SECTION_TYPES.SIZE_GUIDE).toBe('size-guide');
      expect(SECTION_TYPES.SHOP_BY_CONCERN).toBe('shop-by-concern');
      expect(SECTION_TYPES.SHOP_BY_ROOM).toBe('shop-by-room');
      expect(SECTION_TYPES.INGREDIENT_HIGHLIGHTS).toBe('ingredient-highlights');
    });

    it.each([
      'size-guide',
      'shop-by-concern',
      'shop-by-room',
      'ingredient-highlights',
    ])('registers %s in COMPONENT_REGISTRY', (type) => {
      const def = COMPONENT_REGISTRY[type as keyof typeof COMPONENT_REGISTRY];
      expect(def).toBeDefined();
      expect(def.defaultConfig).toBeDefined();
      expect(typeof def.icon).toBe('string');
    });

    it('creates default sections and validates them for all new types', () => {
      const newTypes = [
        SECTION_TYPES.SIZE_GUIDE,
        SECTION_TYPES.SHOP_BY_CONCERN,
        SECTION_TYPES.SHOP_BY_ROOM,
        SECTION_TYPES.INGREDIENT_HIGHLIGHTS,
      ];
      for (const type of newTypes) {
        const { config } = createDefaultSection(type);
        const result = validateSectionConfig(type, config);
        expect(result.success, `config for ${type} should validate`).toBe(true);
      }
    });
  });

  describe('Config enum extensions', () => {
    it('validates all 6 sticky-header style values and rejects unknown ones', () => {
      const styles = ['classic', 'minimal', 'centered', 'split', 'searchbar', 'bordered'] as const;
      for (const style of styles) {
        expect(stickyHeaderConfigSchema.safeParse({ style, navLinks: [] }).success).toBe(true);
      }
      expect(stickyHeaderConfigSchema.safeParse({ style: 'unknown' }).success).toBe(false);
    });

    it('validates all 4 mega-menu layout values', () => {
      const layouts = ['classic', 'bricks', 'masonry', 'tabs'] as const;
      for (const layout of layouts) {
        expect(megaMenuConfigSchema.safeParse({ layout, groups: [] }).success).toBe(true);
      }
      expect(megaMenuConfigSchema.safeParse({ layout: 'unknown' }).success).toBe(false);
    });

    it('validates all 4 categories layout values', () => {
      const layouts = ['grid', 'carousel', 'stacked', 'bento'] as const;
      for (const layout of layouts) {
        expect(categoriesConfigSchema.safeParse({ layout, items: [] }).success).toBe(true);
      }
      expect(categoriesConfigSchema.safeParse({ layout: 'unknown' }).success).toBe(false);
    });

    it('validates all 3 product-carousel layout values', () => {
      const layouts = ['row', 'fade', 'ticker'] as const;
      for (const layout of layouts) {
        expect(productCarouselConfigSchema.safeParse({ layout, products: [] }).success).toBe(true);
      }
      expect(productCarouselConfigSchema.safeParse({ layout: 'unknown' }).success).toBe(false);
    });

    it('validates all 3 hero layout values', () => {
      const layouts = ['collection', 'campaign', 'layered'] as const;
      for (const layout of layouts) {
        expect(heroConfigSchema.safeParse({ layout, imageUrl: '/x.jpg' }).success).toBe(true);
      }
      expect(heroConfigSchema.safeParse({ layout: 'unknown' }).success).toBe(false);
    });
  });

  describe('Product card variants', () => {
    it('includes minimal and featured in CARD_VARIANT_VALUES', () => {
      expect(CARD_VARIANT_VALUES).toContain('minimal');
      expect(CARD_VARIANT_VALUES).toContain('featured');
      expect(CARD_VARIANT_VALUES).toHaveLength(9);
      expect(Object.keys(CARD_VARIANT_LABELS)).toHaveLength(CARD_VARIANT_VALUES.length);
      expect(CARD_VARIANT_LABELS.minimal).toBeDefined();
      expect(CARD_VARIANT_LABELS.featured).toBeDefined();
    });

    it('keeps previously supported card variants intact', () => {
      const required: CardVariant[] = ['classic', 'editorial', 'overlay', 'compact', 'quick-add'];
      for (const variant of required) {
        expect(CARD_VARIANT_VALUES).toContain(variant);
      }
    });
  });

  describe('Demo image pools', () => {
    it('provides hero/categories/products/banner/about pools for every industry', () => {
      const categories = ['general', 'fashion', 'electronics', 'grocery', 'beauty', 'food', 'home'];
      for (const cat of categories) {
        const pool = STOREFRONT_DEMO_IMAGE_POOLS[cat as keyof typeof STOREFRONT_DEMO_IMAGE_POOLS];
        expect(pool, `pool for ${cat}`).toBeDefined();
        expect(pool.hero.length).toBeGreaterThan(0);
        expect(pool.categories.length).toBeGreaterThan(0);
        expect(pool.products.length).toBeGreaterThan(0);
        expect(pool.banner.length).toBeGreaterThan(0);
        expect(pool.about.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Component registry coverage', () => {
    it('registers schema validation for every new section type', () => {
      const schemas = [
        sizeGuideConfigSchema,
        shopByConcernConfigSchema,
        shopByRoomConfigSchema,
        ingredientHighlightsConfigSchema,
      ];
      for (const schema of schemas) {
        expect(schema).toBeDefined();
      }
    });
  });
});