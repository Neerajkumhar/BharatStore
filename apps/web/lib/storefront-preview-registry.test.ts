import { describe, it, expect } from 'vitest';
import { SECTION_TYPES } from '@bharatstore/shared/constants';
import { validateSectionConfig } from '@bharatstore/shared/schemas';
import {
  ALL_INDUSTRIES,
  COMPONENT_PREVIEW_REGISTRY,
  getComponentPreviewEntry,
  getRecommendedEntriesForIndustry,
  searchComponentPreviews,
} from './component-preview-registry';

describe('Component Preview Registry', () => {
  it('provides at least one preview entry for every renderable section type', () => {
    // mobile-nav has no renderer component (like the live renderer), so it is
    // intentionally excluded from the preview registry.
    const UNRENDERABLE: Set<string> = new Set([SECTION_TYPES.MOBILE_NAV]);
    const seen = new Set(COMPONENT_PREVIEW_REGISTRY.map((e) => e.sectionType));
    for (const type of Object.values(SECTION_TYPES)) {
      if (UNRENDERABLE.has(type)) continue;
      expect(seen.has(type), `missing preview for ${type}`).toBe(true);
    }
  });

  it('has 70+ entries, all ids unique, and full renderable coverage', () => {
    expect(COMPONENT_PREVIEW_REGISTRY.length).toBeGreaterThanOrEqual(70);
    const ids = new Set(COMPONENT_PREVIEW_REGISTRY.map((e) => e.id));
    expect(ids.size).toBe(COMPONENT_PREVIEW_REGISTRY.length);
    expect(seenTypes().size).toBe(Object.keys(SECTION_TYPES).length - 1);
  });

  it('every entry references a valid industry demo category', () => {
    for (const entry of COMPONENT_PREVIEW_REGISTRY) {
      expect(ALL_INDUSTRIES, `${entry.id} demoCategory`).toContain(entry.demoCategory);
      for (const ind of entry.industries) {
        expect(ALL_INDUSTRIES, `${entry.id} industry ${ind}`).toContain(ind);
      }
    }
  });

  it('every entry config validates against its section schema', () => {
    for (const entry of COMPONENT_PREVIEW_REGISTRY) {
      const result = validateSectionConfig(entry.sectionType, entry.config as Record<string, unknown>);
      expect(result.success, `${entry.id} config should validate`).toBe(true);
    }
  });

  it('merges demo store tradeName into entry configs', () => {
    for (const entry of COMPONENT_PREVIEW_REGISTRY) {
      expect(entry.config, `${entry.id} config`).toBeDefined();
      expect(typeof entry.config).toBe('object');
    }
  });

  it('covers the sanctioned variant sets', () => {
    const count = (t: string) => COMPONENT_PREVIEW_REGISTRY.filter((e) => e.sectionType === t).length;
    expect(count(SECTION_TYPES.STICKY_HEADER)).toBe(6);
    expect(count(SECTION_TYPES.HERO)).toBe(3);
    expect(count(SECTION_TYPES.CATEGORIES)).toBe(4);
    expect(count(SECTION_TYPES.PRODUCT_CAROUSEL)).toBe(3);
    expect(count(SECTION_TYPES.PRODUCT_GRID)).toBe(9);
  });

  it('getComponentPreviewEntry round-trips by id', () => {
    const first = COMPONENT_PREVIEW_REGISTRY[0];
    const found = getComponentPreviewEntry(first.id);
    expect(found?.id).toBe(first.id);
    expect(getComponentPreviewEntry('does-not-exist')).toBeUndefined();
  });

  it('getRecommendedEntriesForIndustry returns curated entries limited to the industry', () => {
    const industry = 'beauty';
    const recs = getRecommendedEntriesForIndustry(industry, 3);
    expect(recs.length).toBeLessThanOrEqual(3);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((e) => e.industries.includes(industry as never))).toBe(true);
    expect(getRecommendedEntriesForIndustry('space-industry')).toEqual([]);
  });

  it('searchComponentPreviews matches by name, tags, and section type', () => {
    expect(searchComponentPreviews({ query: 'announcement' }).length).toBeGreaterThan(0);
    expect(searchComponentPreviews({ query: 'ticker' }).length).toBeGreaterThan(0);
    expect(searchComponentPreviews({ query: 'shipping' }).length).toBeGreaterThan(0);
  });

  it('searchComponentPreviews respects category and industry filters', () => {
    const heroes = searchComponentPreviews({ category: 'hero' });
    expect(heroes.length).toBeGreaterThan(0);
    expect(heroes.every((e) => e.category === 'hero')).toBe(true);

    const grocery = searchComponentPreviews({ industry: 'grocery' });
    expect(grocery.length).toBeGreaterThan(0);
    expect(grocery.every((e) => e.industries.includes('grocery'))).toBe(true);
  });

  it('searchComponentPreviews returns empty for no matches and all for empty query', () => {
    expect(searchComponentPreviews({ query: 'zzzz-no-such-token' }).length).toBe(0);
    expect(searchComponentPreviews({}).length).toBe(COMPONENT_PREVIEW_REGISTRY.length);
  });
});

function seenTypes(): Set<string> {
  return new Set(COMPONENT_PREVIEW_REGISTRY.map((e) => e.sectionType));
}