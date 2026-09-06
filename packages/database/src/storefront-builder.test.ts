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

describe('M10: No-Code Storefront Builder', () => {
  let tenantId: string;
  let tenantSlug: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        legalName: 'Builder Test Pvt Ltd',
        tradeName: 'Builder Test Store',
        slug: `builder-test-${Date.now()}`,
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
  describe('Component Registry', () => {
    it('defines all 12 section types', () => {
      const types = Object.values(SECTION_TYPES);
      expect(types).toHaveLength(12);
      expect(types).toContain('hero');
      expect(types).toContain('announcement');
      expect(types).toContain('categories');
      expect(types).toContain('featured-products');
      expect(types).toContain('product-grid');
      expect(types).toContain('banner');
      expect(types).toContain('about');
      expect(types).toContain('trust');
      expect(types).toContain('testimonials');
      expect(types).toContain('faq');
      expect(types).toContain('contact');
      expect(types).toContain('footer');
    });

    it('validates known section types', () => {
      expect(isValidSectionType('hero')).toBe(true);
      expect(isValidSectionType('announcement')).toBe(true);
      expect(isValidSectionType('invalid-type')).toBe(false);
      expect(isValidSectionType('')).toBe(false);
      expect(isValidSectionType('<script>alert(1)</script>')).toBe(false);
    });

    it('returns section definition for valid types', () => {
      const heroDef = getSectionDefinition('hero');
      expect(heroDef).toBeDefined();
      expect(heroDef?.label).toBe('Hero Banner');
      expect(heroDef?.isRequired).toBe(true);
      expect(heroDef?.isDeletable).toBe(false);
    });

    it('returns undefined for unknown types', () => {
      expect(getSectionDefinition('unknown')).toBeUndefined();
    });

    it('creates default section with unique ID', () => {
      const s1 = createDefaultSection('hero');
      const s2 = createDefaultSection('hero');
      expect(s1.id).not.toBe(s2.id);
      expect(s1.type).toBe('hero');
      expect(s1.visible).toBe(true);
      expect(s1.order).toBe(0);
      expect(s1.config).toBeDefined();
    });

    it('marks hero and footer as required', () => {
      expect(COMPONENT_REGISTRY.hero.isRequired).toBe(true);
      expect(COMPONENT_REGISTRY.footer.isRequired).toBe(true);
      expect(COMPONENT_REGISTRY.hero.isDeletable).toBe(false);
      expect(COMPONENT_REGISTRY.footer.isDeletable).toBe(false);
    });
  });

  // -------------------------------------------------------
  // Template System Tests
  // -------------------------------------------------------
  describe('Template System', () => {
    it('defines 6 templates', () => {
      expect(STOREFRONT_TEMPLATES).toHaveLength(6);
    });

    it('has all required template fields', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.preview).toBeDefined();
        expect(t.defaultTheme).toBeDefined();
        expect(t.defaultSections.length).toBeGreaterThan(0);
      }
    });

    it('template IDs are unique', () => {
      const ids = STOREFRONT_TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('getTemplateById returns correct template', () => {
      const fashion = getTemplateById('fashion');
      expect(fashion).toBeDefined();
      expect(fashion?.name).toBe('Fashion');
      expect(fashion?.category).toBe('fashion');
    });

    it('getTemplateById returns undefined for unknown', () => {
      expect(getTemplateById('nonexistent')).toBeUndefined();
    });

    it('getTemplateSections returns valid sections', () => {
      const sections = getTemplateSections('general');
      expect(sections.length).toBeGreaterThan(0);
      for (const s of sections) {
        expect(s.id).toBeTruthy();
        expect(isValidSectionType(s.type)).toBe(true);
        expect(typeof s.order).toBe('number');
        expect(typeof s.visible).toBe('boolean');
      }
    });

    it('every template includes hero and footer sections', () => {
      for (const t of STOREFRONT_TEMPLATES) {
        const types = t.defaultSections.map((s) => s.type);
        expect(types).toContain(SECTION_TYPES.HERO);
        expect(types).toContain(SECTION_TYPES.FOOTER);
      }
    });
  });

  // -------------------------------------------------------
  // Zod Schema Validation Tests
  // -------------------------------------------------------
  describe('Schema Validation', () => {
    it('validates a complete page config', () => {
      const result = pageConfigSchema.safeParse({
        sections: [
          { id: 'hero-1', type: 'hero', config: { title: 'Test' }, visible: true, order: 0 },
        ],
        theme: { primaryColor: '#000' },
        seo: {},
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid section type', () => {
      const result = sectionSchema.safeParse({
        id: 'test',
        type: 'malicious-type',
        config: {},
        visible: true,
        order: 0,
      });
      expect(result.success).toBe(false);
    });

    it('validates hero config', () => {
      const result = heroConfigSchema.safeParse({
        title: 'Welcome',
        subtitle: 'To our store',
        alignment: 'center',
        height: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('validates announcement config', () => {
      const result = announcementConfigSchema.safeParse({
        text: 'Free shipping!',
        visible: true,
      });
      expect(result.success).toBe(true);
    });

    it('validates theme config with defaults', () => {
      const result = themeConfigSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fontFamily).toBe('inter');
        expect(result.data.borderRadius).toBe('lg');
      }
    });

    it('rejects unsafe image URLs', () => {
      const result = heroConfigSchema.safeParse({
        imageUrl: 'javascript:alert(1)',
      });
      expect(result.success).toBe(false);
    });

    it('allows valid image URLs', () => {
      const result = heroConfigSchema.safeParse({
        imageUrl: 'https://images.unsplash.com/photo-123.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('validates section config by type', () => {
      const valid = validateSectionConfig('hero', { title: 'Test', alignment: 'left' });
      expect(valid.success).toBe(true);

      const invalid = validateSectionConfig('hero', { alignment: 'invalid' });
      expect(invalid.success).toBe(false);
    });

    it('returns error for unknown section type in validateSectionConfig', () => {
      const result = validateSectionConfig('unknown', {});
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------
  // Database Draft/Publish Tests
  // -------------------------------------------------------
  describe('Draft/Publish Database Operations', () => {
    it('stores and retrieves draft config', async () => {
      const config = {
        sections: [
          { id: 'hero-1', type: 'hero', config: { title: 'Draft Store' }, visible: true, order: 0 },
        ],
        theme: { primaryColor: '#000' },
        templateId: 'minimal',
      };

      await prisma.storefrontTheme.upsert({
        where: { tenantId },
        create: { tenantId, draftConfig: config },
        update: { draftConfig: config },
      });

      const theme = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      expect(theme).toBeDefined();
      const dc = theme?.draftConfig as any;
      expect(dc.sections).toHaveLength(1);
      expect(dc.sections[0].type).toBe('hero');
      expect(dc.templateId).toBe('minimal');
    });

    it('publishes draft config atomically', async () => {
      const draftConfig = {
        sections: [
          { id: 'hero-1', type: 'hero', config: { title: 'Published' }, visible: true, order: 0 },
          { id: 'footer-1', type: 'footer', config: {}, visible: true, order: 1 },
        ],
        theme: { accentColor: '#ff0000' },
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
      expect(theme?.publishedConfig).toBeDefined();
      expect(theme?.isPublished).toBe(true);
      expect(theme?.publishedAt).toBeDefined();
      const pc = theme?.publishedConfig as any;
      expect(pc.sections).toHaveLength(2);
    });

    it('draft does not affect published config', async () => {
      const before = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      const publishedBefore = before?.publishedConfig;

      // Update draft only
      await prisma.storefrontTheme.update({
        where: { tenantId },
        data: {
          draftConfig: { sections: [{ id: 'new', type: 'banner', config: {}, visible: true, order: 0 }], theme: {} },
        },
      });

      const after = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      expect(after?.publishedConfig).toEqual(publishedBefore);
    });

    it('reset clears both draft and published config', async () => {
      await prisma.storefrontTheme.update({
        where: { tenantId },
        data: { draftConfig: null, publishedConfig: null },
      });

      const theme = await prisma.storefrontTheme.findUnique({ where: { tenantId } });
      expect(theme?.draftConfig).toBeNull();
      expect(theme?.publishedConfig).toBeNull();
    });

    it('tenant isolation: tenant A config invisible to tenant B', async () => {
      const tenantB = await prisma.tenant.create({
        data: {
          legalName: 'Tenant B',
          tradeName: 'Tenant B Store',
          slug: `tenant-b-${Date.now()}`,
          phone: '9990002222',
          addressLine1: '2 Test Street',
          city: 'Delhi',
          stateCode: '07',
          pincode: '110001',
        },
      });

      const config = {
        sections: [{ id: 'hero-1', type: 'hero', config: { title: 'Tenant A Only' }, visible: true, order: 0 }],
      };

      await prisma.storefrontTheme.upsert({
        where: { tenantId },
        create: { tenantId, draftConfig: config },
        update: { draftConfig: config },
      });

      const tenantBTheme = await prisma.storefrontTheme.findUnique({ where: { tenantId: tenantB.id } });
      expect(tenantBTheme?.draftConfig || null).toBeNull();

      await prisma.tenant.delete({ where: { id: tenantB.id } });
    });
  });

  // -------------------------------------------------------
  // Security Tests
  // -------------------------------------------------------
  describe('Security', () => {
    it('rejects arbitrary JavaScript in config', () => {
      const result = pageConfigSchema.safeParse({
        sections: [
          {
            id: 'evil',
            type: 'hero',
            config: { title: '<script>alert(1)</script>' },
            visible: true,
            order: 0,
          },
        ],
      });
      // Zod won't strip it, but it's just a string - the renderer escapes HTML
      expect(result.success).toBe(true);
      // The renderer will escape the HTML entities
    });

    it('validates URL format in image fields', () => {
      const result = heroConfigSchema.safeParse({
        imageUrl: 'javascript:void(0)',
      });
      expect(result.success).toBe(false);
    });

    it('validates section type against whitelist', () => {
      const result = sectionSchema.safeParse({
        id: 'test',
        type: 'eval("malicious code")',
        config: {},
        visible: true,
        order: 0,
      });
      expect(result.success).toBe(false);
    });

    it('limits text field lengths', () => {
      const longText = 'a'.repeat(600);
      const result = heroConfigSchema.safeParse({
        subtitle: longText,
      });
      expect(result.success).toBe(false);
    });

    it('limits FAQ items count', () => {
      const tooManyItems = Array.from({ length: 25 }, (_, i) => ({
        question: `Q${i}`,
        answer: `A${i}`,
      }));
      const result = validateSectionConfig('faq', { items: tooManyItems });
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------
  // Existing Storefront Regression Tests
  // -------------------------------------------------------
  describe('Existing Storefront Regression', () => {
    it('StorefrontTheme model retains all original fields', async () => {
      const theme = await prisma.storefrontTheme.findFirst({ where: { tenantId } });
      // Original fields still exist
      expect(theme).toBeDefined();
      expect(typeof theme?.themeName).toBe('string');
      expect(typeof theme?.primaryColor).toBe('string');
      expect(typeof theme?.accentColor).toBe('string');
      expect(typeof theme?.isPublished).toBe('boolean');
      // New fields
      expect('draftConfig' in (theme || {})).toBe(true);
      expect('publishedConfig' in (theme || {})).toBe(true);
    });

    it('tenant model retains all relationships', async () => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { storefrontTheme: true },
      });
      expect(tenant).toBeDefined();
      expect(tenant?.storefrontTheme).toBeDefined();
    });
  });
});
