import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from './client';
import {
  STOREFRONT_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  getTemplateSections,
  getGalleryCategories,
  searchTemplates,
  filterTemplates,
  sortTemplates,
  isTemplateCurrent,
  buildTemplatePageConfig,
} from '@bharatstore/shared/constants';
import {
  templateMetadataSchema,
  applyThemeRequestSchema,
  pageConfigSchema,
  themeConfigSchema,
  validateSectionConfig,
} from '@bharatstore/shared/schemas';

describe('M10.x: Theme Gallery', () => {
  let tenantId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        legalName: 'Gallery Test Pvt Ltd',
        tradeName: 'Gallery Test Store',
        slug: `gallery-test-${Date.now()}`,
        phone: '9990003333',
        addressLine1: '1 Gallery Street',
        city: 'Mumbai',
        stateCode: '27',
        pincode: '400001',
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    if (tenantId) await prisma.tenant.delete({ where: { id: tenantId } });
  });

  // -------------------------------------------------------
  // Template Library
  // -------------------------------------------------------
  describe('Template Library', () => {
    it('registers 22 templates', () => {
      expect(STOREFRONT_TEMPLATES).toHaveLength(22);
    });

    it('covers all 7 gallery categories with valid category ids', () => {
      const categories = getGalleryCategories();
      expect(categories).toHaveLength(7);
      const ids = categories.map((c) => c.id);
      for (const t of STOREFRONT_TEMPLATES) {
        expect(ids).toContain(t.category);
      }
    });

    it('has at least 3 templates per category', () => {
      for (const cat of getGalleryCategories()) {
        expect(getTemplatesByCategory(cat.id).length).toBeGreaterThanOrEqual(3);
      }
    });

    it('every template carries full gallery metadata', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        expect(t.style).toBeTruthy();
        expect(t.layout).toBeTruthy();
        expect(Array.isArray(t.tags)).toBe(true);
        expect(t.tags.length).toBeGreaterThan(0);
      }
    });

    it('registers featured, popular and new templates', () => {
      expect(STOREFRONT_TEMPLATES.some((t) => t.featured)).toBe(true);
      expect(STOREFRONT_TEMPLATES.some((t) => t.popular)).toBe(true);
      expect(STOREFRONT_TEMPLATES.some((t) => t.isNew)).toBe(true);
    });

    it('preserves backward-compatible template ids for published storefronts', () => {
      for (const id of ['minimal', 'fashion', 'electronics', 'grocery', 'beauty', 'general']) {
        expect(getTemplateById(id)).toBeDefined();
      }
    });

    it('every template composes hero and footer sections', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const types = getTemplateSections(t.id).map((s) => s.type);
        expect(types).toContain('hero');
        expect(types).toContain('footer');
      }
    });
  });

  // -------------------------------------------------------
  // Template Metadata Validation
  // -------------------------------------------------------
  describe('Metadata Validation', () => {
    it('all registered templates pass templateMetadataSchema', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const result = templateMetadataSchema.safeParse(t);
        expect(result.success).toBe(true);
      }
    });

    it('rejects a template with a missing name', () => {
      const result = templateMetadataSchema.safeParse({
        id: 'x',
        name: '',
        description: 'desc',
        category: 'fashion',
        style: 'modern',
        layout: 'centered',
        tags: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects an unknown category', () => {
      const result = templateMetadataSchema.safeParse({
        id: 'x',
        name: 'X',
        description: 'desc',
        category: 'toys',
        style: 'modern',
        layout: 'centered',
        tags: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects unknown style and layout values', () => {
      expect(
        templateMetadataSchema.safeParse({
          id: 'x', name: 'X', description: 'desc', category: 'home',
          style: 'futuristic', layout: 'centered', tags: [],
        }).success
      ).toBe(false);
      expect(
        templateMetadataSchema.safeParse({
          id: 'x', name: 'X', description: 'desc', category: 'home',
          style: 'minimal', layout: 'weird', tags: [],
        }).success
      ).toBe(false);
    });

    it('rejects a template with too many tags', () => {
      const result = templateMetadataSchema.safeParse({
        id: 'x', name: 'X', description: 'desc', category: 'home',
        style: 'minimal', layout: 'centered',
        tags: Array.from({ length: 13 }, (_, i) => `tag-${i}`),
      });
      expect(result.success).toBe(false);
    });

    it('validates the apply-theme request body', () => {
      expect(applyThemeRequestSchema.safeParse({ templateId: '' }).success).toBe(false);
      expect(applyThemeRequestSchema.safeParse({ templateId: ' ' }).success).toBe(false);
      expect(applyThemeRequestSchema.safeParse({ templateId: 'fashion' }).success).toBe(true);
    });
  });

  // -------------------------------------------------------
  // Search, Filter & Sort
  // -------------------------------------------------------
  describe('Search, Filter & Sort', () => {
    it('finds templates by name keyword case-insensitively', () => {
      const lower = searchTemplates(STOREFRONT_TEMPLATES, 'editorial');
      const upper = searchTemplates(STOREFRONT_TEMPLATES, 'EDITORIAL');
      expect(upper).toHaveLength(lower.length);
      expect(lower.map((t) => t.id)).toContain('fashion');
    });

    it('matches category keywords', () => {
      expect(searchTemplates(STOREFRONT_TEMPLATES, 'electronics').length).toBeGreaterThanOrEqual(3);
    });

    it('matches style tags', () => {
      const results = searchTemplates(STOREFRONT_TEMPLATES, 'festive');
      expect(results.map((t) => t.id)).toContain('bharat-business');
    });

    it('returns all templates for an empty query', () => {
      expect(searchTemplates(STOREFRONT_TEMPLATES, '')).toHaveLength(STOREFRONT_TEMPLATES.length);
    });

    it('returns an empty list for an unmatched query', () => {
      expect(searchTemplates(STOREFRONT_TEMPLATES, 'zzz-no-such-template')).toHaveLength(0);
    });

    it('filters by category', () => {
      const results = filterTemplates(STOREFRONT_TEMPLATES, { category: 'fashion' });
      expect(results).toHaveLength(4);
      expect(results.every((t) => t.category === 'fashion')).toBe(true);
    });

    it('filters by style', () => {
      const results = filterTemplates(STOREFRONT_TEMPLATES, { style: 'minimal' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((t) => t.style === 'minimal')).toBe(true);
    });

    it('combines category and style filters', () => {
      const results = filterTemplates(STOREFRONT_TEMPLATES, { category: 'fashion', style: 'playful' });
      expect(results.map((t) => t.id)).toEqual(['streetwear']);
    });

    it('sorts featured first', () => {
      const sorted = sortTemplates(STOREFRONT_TEMPLATES, 'featured');
      expect(sorted[0].featured).toBe(true);
    });

    it('sorts alphabetically by name', () => {
      const sorted = sortTemplates(STOREFRONT_TEMPLATES, 'az');
      const names = sorted.map((t) => t.name);
      expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    });

    it('sorts popular first', () => {
      const sorted = sortTemplates(STOREFRONT_TEMPLATES, 'popular');
      expect(sorted[0].popular).toBe(true);
    });

    it('sorts newest first', () => {
      const sorted = sortTemplates(STOREFRONT_TEMPLATES, 'newest');
      expect(sorted[0].isNew).toBe(true);
    });
  });

  // -------------------------------------------------------
  // Template Selection & Preview Configuration
  // -------------------------------------------------------
  describe('Template Selection & Preview Configuration', () => {
    it('detects the current template', () => {
      expect(isTemplateCurrent('fashion', 'fashion')).toBe(true);
      expect(isTemplateCurrent(null, 'fashion')).toBe(false);
      expect(isTemplateCurrent(undefined, 'fashion')).toBe(false);
      expect(isTemplateCurrent('fashion', 'general')).toBe(false);
    });

    it('builds a valid, publish-compatible page config for a template', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const config = buildTemplatePageConfig(t.id);
        expect(config.templateId).toBe(t.id);
        const parsed = pageConfigSchema.safeParse(config);
        expect(parsed.success).toBe(true);
        const themeResult = themeConfigSchema.safeParse(config.theme);
        expect(themeResult.success).toBe(true);
      }
    });

    it('builds a preview config where every section validates', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const config = buildTemplatePageConfig(t.id);
        for (const s of config.sections) {
          expect(validateSectionConfig(s.type, s.config).success).toBe(true);
        }
        const orders = config.sections.map((s) => s.order);
        expect(orders).toEqual([...orders].sort((a, b) => a - b));
      }
    });

    it('builds unique section ids for a template config', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const ids = buildTemplatePageConfig(t.id).sections.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('rejects an unknown template id', () => {
      expect(() => buildTemplatePageConfig('does-not-exist')).toThrow();
    });

    it('template configs never carry demo/preview-only data', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const config = buildTemplatePageConfig(t.id);
        const serialized = JSON.stringify(config);
        expect(serialized).not.toContain('demo');
      }
    });
  });

  // -------------------------------------------------------
  // Applying a Theme (Database)
  // -------------------------------------------------------
  describe('Applying a Theme (Database)', () => {
    it('persists the applied theme as draft while preserving published config and catalog', async () => {
      const category = await prisma.category.create({
        data: { tenantId, name: 'Gallery Preserved Category', slug: `gallery-cat-${Date.now()}` },
      });

      const publishedConfig = {
        sections: getTemplateSections('minimal'),
        theme: { accentColor: '#000' },
        templateId: 'minimal',
      };
      await prisma.storefrontTheme.upsert({
        where: { tenantId },
        create: { tenantId, publishedConfig, isPublished: true, publishedAt: new Date() },
        update: { publishedConfig, isPublished: true, publishedAt: new Date() },
      });

      const applied = buildTemplatePageConfig('bharat-business');
      await prisma.storefrontTheme.upsert({
        where: { tenantId },
        create: { tenantId, draftConfig: applied },
        update: { draftConfig: applied },
      });

      const theme = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      const dc = theme?.draftConfig as any;
      expect(dc.templateId).toBe('bharat-business');
      expect((dc.sections || []).length).toBeGreaterThan(0);
      expect(theme?.publishedConfig).toBeDefined();
      expect((theme?.publishedConfig as any).templateId).toBe('minimal');

      const preserved = await prisma.category.findUnique({ where: { id: category.id } });
      expect(preserved).toBeDefined();
      expect(preserved?.name).toBe('Gallery Preserved Category');

      await prisma.category.delete({ where: { id: category.id } });
    });

    it('applying a theme never writes demo data into the draft', async () => {
      const theme = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      expect(JSON.stringify(theme?.draftConfig)).not.toContain('demo');
    });

    it('theme selection is tenant-scoped: tenant B stays isolated', async () => {
      const tenantB = await prisma.tenant.create({
        data: {
          legalName: 'Gallery Tenant B',
          tradeName: 'Gallery Tenant B Store',
          slug: `gallery-tenant-b-${Date.now()}`,
          phone: '9990004444',
          addressLine1: '2 Gallery Street',
          city: 'Delhi',
          stateCode: '07',
          pincode: '110001',
        },
      });

      const before = await prisma.storefrontTheme.findUnique({ where: { tenantId: tenantB.id } });
      expect(before?.draftConfig || null).toBeNull();

      const applied = buildTemplatePageConfig('streetwear');
      await prisma.storefrontTheme.upsert({
        where: { tenantId },
        create: { tenantId, draftConfig: applied },
        update: { draftConfig: applied },
      });

      const after = await prisma.storefrontTheme.findUnique({ where: { tenantId: tenantB.id } });
      expect(after?.draftConfig || null).toBeNull();

      await prisma.tenant.delete({ where: { id: tenantB.id } });
    });
  });
});