import React from 'react';
import { prisma } from '@bharatstore/database';
import { isValidSectionType } from '@bharatstore/shared/constants';
import { AnnouncementSection } from './sections/announcement-section';
import { HeroSection } from './sections/hero-section';
import { CategoriesSection } from './sections/categories-section';
import { FeaturedProductsSection } from './sections/featured-products-section';
import { ProductGridSection } from './sections/product-grid-section';
import { BannerSection } from './sections/banner-section';
import { AboutSection } from './sections/about-section';
import { TrustSection } from './sections/trust-section';
import { TestimonialsSection } from './sections/testimonials-section';
import { FaqSection } from './sections/faq-section';
import { ContactSection } from './sections/contact-section';
import { FooterSection } from './sections/footer-section';

interface SectionConfig {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface PageConfig {
  sections: SectionConfig[];
  theme?: Record<string, unknown>;
  seo?: Record<string, unknown>;
}

interface StorefrontRendererProps {
  config: PageConfig | null;
  slug: string;
  tenantId: string;
  storeData: {
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
  isPreview?: boolean;
}

async function resolveSectionData(section: SectionConfig, tenantId: string, slug: string) {
  switch (section.type) {
    case 'categories': {
      const limit = (section.config.limit as number) || 6;
      const categories = await prisma.category.findMany({
        where: { tenantId },
        take: limit,
        include: { _count: { select: { products: { where: { isPublished: true } } } } },
      });
      return { categories };
    }
    case 'featured-products':
    case 'product-grid': {
      const limit = (section.config.limit as number) || 8;
      const products = await prisma.product.findMany({
        where: { tenantId, isPublished: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            select: {
              id: true, sku: true, variantName: true, priceOverride: true, currentStock: true,
            },
          },
        },
      });
      const formatted = products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        sellingPrice: Number(p.sellingPrice),
        mrp: Number(p.mrp),
        images: p.images,
        categoryName: p.category.name,
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          variantName: v.variantName,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          currentStock: v.currentStock,
        })),
      }));
      return { products: formatted };
    }
    default:
      return {};
  }
}

function getFontFamily(font?: string): string {
  const map: Record<string, string> = {
    inter: 'Inter, sans-serif',
    'plus-jakarta': '"Plus Jakarta Sans", sans-serif',
    poppins: 'Poppins, sans-serif',
    nunito: 'Nunito, sans-serif',
    system: 'system-ui, sans-serif',
  };
  return map[font || 'inter'] || map.inter;
}

function getBorderRadius(style?: string): string {
  const map: Record<string, string> = { none: '0', sm: '4px', md: '8px', lg: '12px', xl: '16px' };
  return map[style || 'lg'] || map.lg;
}

export async function StorefrontRenderer({ config, slug, tenantId, storeData, isPreview }: StorefrontRendererProps) {
  if (!config || !config.sections || config.sections.length === 0) {
    return null;
  }

  const theme = (config.theme || {}) as Record<string, unknown>;
  const sections = config.sections
    .filter((s) => s.visible && isValidSectionType(s.type))
    .sort((a, b) => a.order - b.order);

  const font = getFontFamily(theme.fontFamily as string);
  const borderRadius = getBorderRadius(theme.borderRadius as string);

  const sectionDataPromises = sections.map((s) => resolveSectionData(s, tenantId, slug));
  const sectionDataResults = await Promise.all(sectionDataPromises);

  return (
    <div
      className="space-y-12 pb-12"
      style={{
        backgroundColor: (theme.backgroundColor as string) || '#f8fafc',
        color: (theme.textColor as string) || '#0f172a',
        fontFamily: font,
        borderRadius,
      }}
      data-bharatstore-sections={sections.length}
      data-bharatstore-preview={isPreview ? 'true' : undefined}
    >
      {sections.map((section, index) => {
        const data = sectionDataResults[index];
        const sectionTheme = {
          primaryColor: theme.primaryColor as string,
          accentColor: theme.accentColor as string,
        };

        switch (section.type) {
          case 'announcement':
            return <AnnouncementSection key={section.id} config={section.config as any} slug={slug} />;
          case 'hero':
            return <HeroSection key={section.id} config={section.config as any} slug={slug} theme={sectionTheme} />;
          case 'categories':
            return <CategoriesSection key={section.id} config={section.config as any} slug={slug} categories={(data as any)?.categories} theme={sectionTheme} />;
          case 'featured-products':
            return <FeaturedProductsSection key={section.id} config={section.config as any} slug={slug} products={(data as any)?.products} theme={sectionTheme} />;
          case 'product-grid':
            return <ProductGridSection key={section.id} config={section.config as any} slug={slug} products={(data as any)?.products} theme={sectionTheme} />;
          case 'banner':
            return <BannerSection key={section.id} config={section.config as any} slug={slug} />;
          case 'about':
            return <AboutSection key={section.id} config={section.config as any} theme={sectionTheme} />;
          case 'trust':
            return <TrustSection key={section.id} config={section.config as any} theme={sectionTheme} />;
          case 'testimonials':
            return <TestimonialsSection key={section.id} config={section.config as any} theme={sectionTheme} />;
          case 'faq':
            return <FaqSection key={section.id} config={section.config as any} theme={sectionTheme} />;
          case 'contact':
            return <ContactSection key={section.id} config={section.config as any} storeData={storeData} theme={sectionTheme} />;
          case 'footer':
            return <FooterSection key={section.id} config={section.config as any} slug={slug} storeData={storeData} theme={sectionTheme} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
