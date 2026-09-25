import { describe, it, expect } from 'vitest';
import { validatePageSlug, RESERVED_PAGE_SLUGS, toStorefrontNavItems } from './storefront-nav';

function row(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'about-us',
    title: 'About Us',
    navLabel: null,
    showInMenu: true,
    status: 'PUBLISHED',
    draftConfig: { sections: [{ id: 's1' }] },
    publishedConfig: { sections: [{ id: 's1' }] },
    order: 0,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('validatePageSlug', () => {
  it('accepts lowercase kebab-case slugs', () => {
    expect(validatePageSlug('about-us')).toBeNull();
    expect(validatePageSlug('faq2026')).toBeNull();
    expect(validatePageSlug('a')).toBeNull();
  });

  it('rejects empty, spaces, uppercase, underscores, unicode', () => {
    expect(validatePageSlug('')).not.toBeNull();
    expect(validatePageSlug('About Us')).not.toBeNull();
    expect(validatePageSlug('about_us')).not.toBeNull();
    expect(validatePageSlug('about ús')).not.toBeNull();
  });

  it('rejects reserved commerce routes', () => {
    for (const slug of RESERVED_PAGE_SLUGS) {
      expect(validatePageSlug(slug), slug).not.toBeNull();
    }
  });
});

describe('toStorefrontNavItems', () => {
  it('drops non-menu rows', () => {
    const items = toStorefrontNavItems([row({ showInMenu: false })], true);
    expect(items).toEqual([]);
  });

  it('live site: only PUBLISHED rows with non-empty publishedConfig', () => {
    const published = row({});
    const noSections = row({ slug: 'empty', publishedConfig: { sections: [] } });
    const draft = row({ slug: 'draft', status: 'DRAFT' });
    const items = toStorefrontNavItems([draft, noSections, published], false);
    expect(items.map((i) => i.slug)).toEqual(['about-us']);
  });

  it('preview: includes DRAFT rows with non-empty draftConfig', () => {
    const draft = row({ slug: 'draft', status: 'DRAFT' });
    const emptyDraft = row({ slug: 'fresh', status: 'DRAFT', draftConfig: { sections: [] } });
    const items = toStorefrontNavItems([emptyDraft, draft], true);
    expect(items.map((i) => i.slug)).toEqual(['draft']);
  });

  it('labels fall back from navLabel to title', () => {
    const items = toStorefrontNavItems([row({ navLabel: 'Our Story' })], false);
    expect(items[0].label).toBe('Our Story');
    const fallback = toStorefrontNavItems([row({ navLabel: null })], false);
    expect(fallback[0].label).toBe('About Us');
  });

  it('sorts by order asc then createdAt asc', () => {
    const a = row({ slug: 'a', order: 2, createdAt: new Date('2026-01-01') });
    const b = row({ slug: 'b', order: 1, createdAt: new Date('2026-01-02') });
    const c = row({ slug: 'c', order: 1, createdAt: new Date('2026-01-03') });
    const items = toStorefrontNavItems([a, b, c], false);
    expect(items.map((i) => i.slug)).toEqual(['b', 'c', 'a']);
  });
});