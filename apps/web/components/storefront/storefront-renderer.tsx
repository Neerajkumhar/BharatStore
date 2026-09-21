import React from 'react';
import { prisma } from '@bharatstore/database';
import { isValidSectionType, SECTION_TYPES, getTemplateById } from '@bharatstore/shared/constants';
import { getPreviewDemoPayload } from '@/lib/storefront-demo-data';
import { SectionBlock } from './section-block';

import { SECTION_COMPONENT_MAP, getSectionExtraProps } from './section-component-map';

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
  templateId?: string;
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

async function resolveSectionData(section: SectionConfig, tenantId: string, slug: string, templateId?: string) {
  const template = getTemplateById(templateId || '');
  const templateCategory = template?.category || 'general';
  const demoPayload = getPreviewDemoPayload(templateCategory, templateId || 'general');
  const overrides = section.config.imageOverrides as Record<string, string> | undefined;

  switch (section.type) {
    case SECTION_TYPES.CATEGORIES:
    case SECTION_TYPES.CATEGORY_CIRCULAR:
    case SECTION_TYPES.CATEGORY_MEGA:
    case SECTION_TYPES.MEGA_MENU: {
      const limit = (section.config.limit as number) || 8;
      const categories = await prisma.category.findMany({
        where: { tenantId },
        take: limit,
        include: { _count: { select: { products: { where: { isPublished: true } } } } },
      });

      if (categories.length > 0) {
        return {
          categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: overrides?.[c.id] ?? null,
            _count: { products: c._count.products },
          })),
        };
      }

      const demoCats = demoPayload.categories.slice(0, limit).map((c, idx) => ({
        id: `demo_cat_${idx}`,
        name: c.name,
        slug: c.slug,
        image: overrides?.[`demo_cat_${idx}`] ?? c.image,
        _count: { products: c.count },
      }));
      return { categories: demoCats };
    }

    case SECTION_TYPES.FEATURED_PRODUCTS:
    case SECTION_TYPES.PRODUCT_GRID:
    case SECTION_TYPES.PRODUCT_CAROUSEL:
    case SECTION_TYPES.PRODUCT_RAIL:
    case SECTION_TYPES.PRODUCT_SPOTLIGHT:
    case SECTION_TYPES.PRODUCT_TRENDING:
    case SECTION_TYPES.PRODUCT_TABS:
    case SECTION_TYPES.PRODUCT_COMPARISON:
    case SECTION_TYPES.HERO_PRODUCT:
    case SECTION_TYPES.FLASH_SALE:
    case SECTION_TYPES.ROUTINE_BUILDER:
    case SECTION_TYPES.LOOKBOOK: {
      const limit = (section.config.limit as number) || 12;
      const products = await prisma.product.findMany({
        where: { tenantId, isPublished: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            select: {
              id: true,
              sku: true,
              variantName: true,
              priceOverride: true,
              currentStock: true,
            },
          },
        },
      });

      if (products.length > 0) {
        const formatted = products.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          sellingPrice: Number(p.sellingPrice),
          mrp: Number(p.mrp),
          images: overrides?.[p.id] ? [overrides[p.id]] : p.images,
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

      const demoProds = demoPayload.products.slice(0, limit).map((p, idx) => ({
        id: `demo_prod_${idx}`,
        title: p.title,
        slug: `demo-prod-${idx}`,
        sellingPrice: p.price,
        mrp: p.mrp,
        images: [overrides?.[`demo_prod_${idx}`] ?? p.image],
        categoryName: p.category,
        variants: [],
      }));
      return { products: demoProds };
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

interface SectionRenderContext {
  section: SectionConfig;
  slug: string;
  sectionTheme: { primaryColor?: string; accentColor?: string };
  data: Record<string, unknown>;
  storeData: StorefrontRendererProps['storeData'];
}

export async function StorefrontRenderer({ config, slug, tenantId, storeData, isPreview }: StorefrontRendererProps) {
  if (!config || !config.sections || config.sections.length === 0) {
    return null;
  }

  const theme = (config.theme || {}) as Record<string, unknown>;
  const templateId = (config.templateId as string) || (theme.templateId as string);
  const sections = config.sections
    .filter((s) => s.visible && isValidSectionType(s.type))
    .sort((a, b) => a.order - b.order);

  const font = getFontFamily(theme.fontFamily as string);
  const borderRadius = getBorderRadius(theme.borderRadius as string);

  const sectionDataPromises = sections.map((s) => resolveSectionData(s, tenantId, slug, templateId));
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
        const data = sectionDataResults[index] as Record<string, unknown>;
        const sectionTheme = {
          primaryColor: theme.primaryColor as string,
          accentColor: theme.accentColor as string,
        };

        const Component = SECTION_COMPONENT_MAP[section.type];
        if (!Component) return null;

        const extraProps = getSectionExtraProps({
          type: section.type,
          data,
          theme: sectionTheme,
          storeData,
        });

        return (
          <SectionBlock key={section.id} type={section.type} config={section.config}>
            <Component
              config={section.config as never}
              slug={slug}
              {...extraProps}
            />
          </SectionBlock>
        );
      })}
    </div>
  );
}