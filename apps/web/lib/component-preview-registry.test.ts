import { describe, it, expect } from 'vitest';
import {
  COMPONENT_PREVIEW_REGISTRY,
  getComponentPreviewEntry,
  searchComponentPreviews,
} from './component-preview-registry';

describe('searchComponentPreviews', () => {
  it('finds sections for natural-language multi-word queries ("about us")', () => {
    const results = searchComponentPreviews({ query: 'about us' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((e) => e.sectionType === 'about')).toBe(true);
  });

  it('finds sections for "contact us"', () => {
    const results = searchComponentPreviews({ query: 'contact us' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((e) => e.sectionType === 'contact')).toBe(true);
  });

  it('finds sections for "faq page"', () => {
    const results = searchComponentPreviews({ query: 'faq page' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((e) => e.sectionType === 'faq')).toBe(true);
  });

  it('matches a full phrase as substring ("free shipping")', () => {
    const results = searchComponentPreviews({ query: 'free shipping' });
    expect(results.some((e) => e.name.toLowerCase().includes('free shipping'))).toBe(true);
  });

  it('ranks name matches ahead of tag-only matches', () => {
    const results = searchComponentPreviews({ query: 'shipping' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('shipping');
  });
});

describe('page-type grouping', () => {
  it('filters the registry by page type (contact)', () => {
    const results = searchComponentPreviews({ pageType: 'contact' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.pageTypes.includes('contact'))).toBe(true);
    expect(results.map((e) => e.sectionType)).toContain('contact');
    expect(results.map((e) => e.sectionType)).toContain('faq');
  });

  it('assigns about-oriented pages to the about bucket', () => {
    const results = searchComponentPreviews({ pageType: 'about' });
    expect(results.some((e) => e.sectionType === 'about')).toBe(true);
    expect(results.some((e) => e.sectionType === 'brand-story')).toBe(true);
  });

  it('every registered entry has at least one page type', () => {
    for (const entry of COMPONENT_PREVIEW_REGISTRY) {
      expect(entry.pageTypes.length, entry.id).toBeGreaterThan(0);
    }
  });
});

describe('variant coverage', () => {
  it('registers new contact variants', () => {
    for (const id of ['contact-map', 'contact-wall']) {
      const entry = getComponentPreviewEntry(id);
      expect(entry, id).toBeDefined();
      expect(entry!.sectionType).toBe('contact');
    }
  });

  it('registers new about variants', () => {
    for (const id of ['about-stats', 'about-collage']) {
      const entry = getComponentPreviewEntry(id);
      expect(entry, id).toBeDefined();
      expect(entry!.sectionType).toBe('about');
    }
  });

  it('registers new faq, testimonials and newsletter variants', () => {
    for (const id of ['faq-help', 'faq-two-col', 'testimonials-wall', 'newsletter-center', 'newsletter-split']) {
      expect(getComponentPreviewEntry(id), id).toBeDefined();
    }
  });

  it('grows the gallery for the once single-entry types', () => {
    const singleEntryTypes = ['about', 'contact', 'faq', 'testimonials', 'trust', 'brand-story', 'newsletter', 'size-guide', 'banner', 'brand-logos', 'reviews-summary', 'delivery-info', 'shop-by-room', 'ingredient-highlights'];
    for (const type of singleEntryTypes) {
      const count = COMPONENT_PREVIEW_REGISTRY.filter((e) => e.sectionType === type).length;
      expect(count, `${type} should have 2+ gallery entries`).toBeGreaterThanOrEqual(2);
    }
  });
});