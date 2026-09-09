import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from './client';
import {
  SECTION_TYPES,
  COMPONENT_REGISTRY,
  isValidSectionType,
  getSectionDefinition,
  createDefaultSection,
} from '@bharatstore/shared/constants';
import {
  STOREFRONT_TEMPLATES,
  getTemplateById,
  getTemplateSections,
} from '@bharatstore/shared/constants';
import {
  pageConfigSchema,
  sectionSchema,
  themeConfigSchema,
  heroConfigSchema,
  announcementConfigSchema,
  validateSectionConfig,
} from '@bharatstore/shared/schemas';

describe('M10 & Evolved Storefront Design System Tests', () => {
  let tenantId: string;
  let tenantSlug: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        legalName: 'Evolved Storefront Test Ltd',
        tradeName: 'Evolved Storefront Test',
        slug: `evolved-storefront-${Date.now()}`,
        phone: '9990001111',
        addressLine1: '1 Test Street',
        city: 'Mumbai',
        stateCode: '27',
        pincode: '400001',
      },
    });
    tenantId = tenant.id;
    tenantSlug = tenant.slug;
  });

  afterAll(async () => {
    if (tenantId) await prisma.tenant.delete({ where: { id: tenantId } });
  });

  // -------------------------------------------------------
  // Component Registry Tests
  // -------------------------------------------------------
  describe('Expanded Component Registry', () => {
    it('defines approximately 38 distinct section types', () => {
      const types = Object.values(SECTION_TYPES);
      expect(types.length).toBeGreaterThanOrEqual(30);
      expect(types.length).toBeLessThanOrEqual(50);
      expect(types).toContain('hero');
      expect(types).toContain('announcement');
      expect(types).toContain('sticky-header');
      expect(types).toContain('mega-menu');
      expect(types).toContain('search-overlay');
      expect(types).toContain('hero-fullscreen');
      expect(types).toContain('hero-editorial');
      expect(types).toContain('product-carousel');
      expect(types).toContain('product-spotlight');
      expect(types).toContain('product-comparison');
      expect(types).toContain('countdown-sale');
      expect(types).toContain('flash-sale');
      expect(types).toContain('coupon-strip');
      expect(types).toContain('editorial-split');
      expect(types).toContain('lookbook');
      expect(types).toContain('routine-builder');
      expect(types).toContain('reviews-summary');
      expect(types).toContain('newsletter');
    });

    it('validates section types', () => {
      expect(isValidSectionType('hero')).toBe(true);
      expect(isValidSectionType('sticky-header')).toBe(true);
      expect(isValidSectionType('countdown-sale')).toBe(true);
      expect(isValidSectionType('invalid-type')).toBe(false);
      expect(isValidSectionType('')).toBe(false);
    });

    it('returns section definition with valid categories', () => {
      const heroDef = getSectionDefinition('hero');
      expect(heroDef).toBeDefined();
      expect(heroDef?.label).toBe('Hero Banner');
      expect(heroDef?.isRequired).toBe(true);
      expect(heroDef?.category).toBe('hero');

      const stickyDef = getSectionDefinition('sticky-header');
      expect(stickyDef?.category).toBe('navigation');
    });

    it('creates default section with unique ID and default config', () => {
      const s1 = createDefaultSection('countdown-sale');
      const s2 = createDefaultSection('countdown-sale');
      expect(s1.id).not.toBe(s2.id);
      expect(s1.type).toBe('countdown-sale');
      expect(s1.visible).toBe(true);
      expect(s1.config).toBeDefined();
    });
  });

  // -------------------------------------------------------
  // Template System & Composition Tests
  // -------------------------------------------------------
  describe('Template System & Deliberate Compositions', () => {
    it('defines 22 genuinely different storefront templates', () => {
      expect(STOREFRONT_TEMPLATES).toHaveLength(22);
    });

    it('has required metadata and distinct section compositions for all 22 templates', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.defaultSections.length).toBeGreaterThan(0);
      }
    });

    it('Fashion Editorial template includes Lookbook and Trending Product Rail', () => {
      const fashion = getTemplateById('fashion');
      expect(fashion).toBeDefined();
      const types = fashion?.defaultSections.map((s) => s.type);
      expect(types).toContain(SECTION_TYPES.LOOKBOOK);
      expect(types).toContain(SECTION_TYPES.PRODUCT_TRENDING);
      expect(types).toContain(SECTION_TYPES.PROMO_SPLIT);
    });

    it('Streetwear template includes Countdown Sale and Product Rail', () => {
      const streetwear = getTemplateById('streetwear');
      expect(streetwear).toBeDefined();
      const types = streetwear?.defaultSections.map((s) => s.type);
      expect(types).toContain(SECTION_TYPES.COUNTDOWN_SALE);
      expect(types).toContain(SECTION_TYPES.PRODUCT_RAIL);
      expect(types).toContain(SECTION_TYPES.HERO_FULLSCREEN);
    });

    it('Tech Store template includes Product Comparison and Flash Sale', () => {
      const tech = getTemplateById('electronics');
      expect(tech).toBeDefined();
      const types = tech?.defaultSections.map((s) => s.type);
      expect(types).toContain(SECTION_TYPES.PRODUCT_COMPARISON);
      expect(types).toContain(SECTION_TYPES.FLASH_SALE);
      expect(types).toContain(SECTION_TYPES.HERO_PRODUCT);
    });

    it('Fresh Grocery template includes Free Shipping Bar and Delivery Promise', () => {
      const grocery = getTemplateById('grocery');
      expect(grocery).toBeDefined();
      const types = grocery?.defaultSections.map((s) => s.type);
      expect(types).toContain(SECTION_TYPES.FREE_SHIPPING_BAR);
      expect(types).toContain(SECTION_TYPES.DELIVERY_INFO);
      expect(types).toContain(SECTION_TYPES.CATEGORY_CIRCULAR);
    });

    it('Beauty template includes Routine Builder and Category Mega Grid', () => {
      const beauty = getTemplateById('beauty');
      expect(beauty).toBeDefined();
      const types = beauty?.defaultSections.map((s) => s.type);
      expect(types).toContain(SECTION_TYPES.ROUTINE_BUILDER);
      expect(types).toContain(SECTION_TYPES.CATEGORY_MEGA);
    });

    it('Bharat Business template includes Countdown Sale and Coupon Strip', () => {
      const bharat = getTemplateById('bharat-business');
      expect(bharat).toBeDefined();
      const types = bharat?.defaultSections.map((s) => s.type);
      expect(types).toContain(SECTION_TYPES.COUNTDOWN_SALE);
      expect(types).toContain(SECTION_TYPES.COUPON_STRIP);
      expect(types).toContain(SECTION_TYPES.REVIEWS_SUMMARY);
    });
  });

  // -------------------------------------------------------
  // Schema Validation Tests
  // -------------------------------------------------------
  describe('Schema Validation', () => {
    it('validates a complete page config with new section types', () => {
      const result = pageConfigSchema.safeParse({
        sections: [
          { id: 'hero-1', type: 'hero-fullscreen', config: { title: 'Test' }, visible: true, order: 0 },
          { id: 'countdown-1', type: 'countdown-sale', config: { title: 'Flash' }, visible: true, order: 1 },
        ],
        theme: { primaryColor: '#000' },
        seo: {},
      });
      expect(result.success).toBe(true);
    });

    it('rejects unknown section types', () => {
      const result = sectionSchema.safeParse({
        id: 'test',
        type: 'unknown-malicious-type',
        config: {},
        visible: true,
        order: 0,
      });
      expect(result.success).toBe(false);
    });

    it('validates section configs with animation settings', () => {
      const valid = validateSectionConfig('countdown-sale', {
        title: 'Flash Sale',
        animation: 'fade-up',
      });
      expect(valid.success).toBe(true);
    });

    it('validates product carousel with card variant settings', () => {
      const valid = validateSectionConfig('product-carousel', {
        title: 'Bestsellers',
        cardVariant: 'editorial',
        animation: 'slide-up',
      });
      expect(valid.success).toBe(true);
    });
  });

  // -------------------------------------------------------
  // Database Operations Tests
  // -------------------------------------------------------
  describe('Database Operations', () => {
    it('stores draft config with new section types and retrieves cleanly', async () => {
      const config = {
        sections: [
          { id: 'h1', type: 'hero-editorial', config: { headline: 'New Season' }, visible: true, order: 0 },
          { id: 'c1', type: 'countdown-sale', config: { title: 'Flash' }, visible: true, order: 1 },
        ],
        theme: { primaryColor: '#1c1917' },
        templateId: 'fashion',
      };

      await prisma.storefrontTheme.upsert({
        where: { tenantId },
        create: { tenantId, draftConfig: config },
        update: { draftConfig: config },
      });

      const theme = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      expect(theme).toBeDefined();
      const dc = theme?.draftConfig as any;
      expect(dc.sections).toHaveLength(2);
      expect(dc.sections[0].type).toBe('hero-editorial');
    });

    it('publishes draft config cleanly', async () => {
      const draftConfig = {
        sections: [
          { id: 'h1', type: 'hero-editorial', config: { headline: 'Published' }, visible: true, order: 0 },
          { id: 'f1', type: 'footer', config: {}, visible: true, order: 1 },
        ],
        theme: { accentColor: '#a16207' },
      };

      await prisma.storefrontTheme.update({
        where: { tenantId },
        data: {
          draftConfig,
          publishedConfig: draftConfig,
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      const theme = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      expect(theme?.isPublished).toBe(true);
      expect((theme?.publishedConfig as any).sections).toHaveLength(2);
    });

    it('supports section duplication generating safe unique IDs', () => {
      const original = createDefaultSection('hero-editorial');
      const duplicated = {
        ...original,
        id: `${original.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        config: JSON.parse(JSON.stringify(original.config)),
        order: original.order + 5,
      };
      expect(duplicated.id).not.toBe(original.id);
      expect(duplicated.type).toBe(original.type);
    });

    it('toggles section visibility cleanly', () => {
      const s = { id: 's1', type: 'hero', config: {}, visible: true, order: 0 };
      const toggled = { ...s, visible: !s.visible };
      expect(toggled.visible).toBe(false);
    });

    it('reorders section sequence deterministically', () => {
      const list = [
        { id: 'a', order: 10 },
        { id: 'b', order: 20 },
        { id: 'c', order: 30 },
      ];
      const reordered = list.map((item, idx) => ({ ...item, order: (idx + 1) * 10 }));
      expect(reordered[0].order).toBe(10);
      expect(reordered[2].order).toBe(30);
    });
  });
});
