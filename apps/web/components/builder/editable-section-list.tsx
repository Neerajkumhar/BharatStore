'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  getTemplateById,
  SECTION_TYPES,
  STOREFRONT_DEMO_IMAGE_POOLS,
  STOREFRONT_TEMPLATE_HEROES,
  type TemplateCategory,
} from '@bharatstore/shared/constants';
import { getPreviewLoader } from '../storefront/section-preview-loader';
import { getSectionExtraProps } from '../storefront/section-component-map';
import { CartProvider } from '../storefront/cart-context';
import { getPreviewDemoPayload } from '@/lib/storefront-demo-data';
import { EditableSection } from './editable-section';
import { ImagePickerModal, type PickerImage } from './image-picker-modal';
import {
  getEditableImageTarget,
  buildConfigWithImageOverride,
  type EditableImageTarget,
} from '@/lib/builder-image-fields';
import { ImageOff } from 'lucide-react';

interface SectionItem {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface EditableSectionListProps {
  slug: string;
  sections: SectionItem[];
  theme: Record<string, unknown>;
  storeData: any;
  templateId?: string | null;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDuplicateSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onUpdateSection: (id: string, config: Record<string, unknown>) => void;
}

interface ResolvedProduct {
  id: string;
  title: string;
  slug: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  categoryName: string;
  variants: Array<{
    id: string;
    sku: string;
    variantName: string;
    priceOverride?: number | null;
    currentStock: number;
  }>;
}

interface ResolvedCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  count: number;
}

const CATEGORY_SECTION_TYPES = new Set<string>([
  SECTION_TYPES.CATEGORIES,
  SECTION_TYPES.CATEGORY_CIRCULAR,
  SECTION_TYPES.CATEGORY_MEGA,
  SECTION_TYPES.MEGA_MENU,
]);

const PRODUCT_SECTION_TYPES = new Set<string>([
  SECTION_TYPES.FEATURED_PRODUCTS,
  SECTION_TYPES.PRODUCT_GRID,
  SECTION_TYPES.PRODUCT_CAROUSEL,
  SECTION_TYPES.PRODUCT_RAIL,
  SECTION_TYPES.PRODUCT_SPOTLIGHT,
  SECTION_TYPES.PRODUCT_TRENDING,
  SECTION_TYPES.PRODUCT_TABS,
  SECTION_TYPES.PRODUCT_COMPARISON,
  SECTION_TYPES.HERO_PRODUCT,
  SECTION_TYPES.FLASH_SALE,
  SECTION_TYPES.ROUTINE_BUILDER,
  SECTION_TYPES.LOOKBOOK,
]);

function normalizeProduct(p: any): ResolvedProduct {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    sellingPrice: Number(p.sellingPrice) || 0,
    mrp: Number(p.mrp) || 0,
    images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
    categoryName: p.category?.name || '',
    variants: Array.isArray(p.variants)
      ? p.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku || '',
          variantName: v.variantName || 'Default',
          priceOverride: v.priceOverride != null ? Number(v.priceOverride) : null,
          currentStock: Number(v.currentStock) || 0,
        }))
      : [],
  };
}

function normalizeCategory(c: any): ResolvedCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image || null,
    count: Number(c.productCount ?? c._count?.products ?? 0),
  };
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

interface ResolvedSection {
  data: Record<string, unknown>;
  ids: string[];
}

/** Mirrors apps/web/components/storefront/storefront-renderer.tsx resolveSectionData. */
function resolveSectionData(
  section: SectionItem,
  products: ResolvedProduct[],
  categories: ResolvedCategory[],
  templateCategory: TemplateCategory,
  templateId: string
): ResolvedSection {
  const overrides = section.config.imageOverrides as Record<string, string> | undefined;
  const demoPayload = getPreviewDemoPayload(templateCategory, templateId);

  if (CATEGORY_SECTION_TYPES.has(section.type)) {
    const limit = Number(section.config.limit) || 8;
    let items: ResolvedCategory[];
    if (categories.length > 0) {
      items = categories.slice(0, limit);
    } else {
      items = demoPayload.categories.slice(0, limit).map((c, idx) => ({
        id: `demo_cat_${idx}`,
        name: c.name,
        slug: c.slug,
        image: c.image,
        count: c.count,
      }));
    }
    const ids = items.map((c) => c.id);
    const resolved = items.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: overrides?.[c.id] || c.image,
      _count: { products: c.count },
    }));
    return { data: { categories: resolved }, ids };
  }

  if (PRODUCT_SECTION_TYPES.has(section.type)) {
    const limit = Number(section.config.limit) || 12;
    let items: ResolvedProduct[];
    if (products.length > 0) {
      items = products.slice(0, limit);
    } else {
      items = demoPayload.products.slice(0, limit).map((p, idx) => ({
        id: `demo_prod_${idx}`,
        title: p.title,
        slug: `demo-prod-${idx}`,
        sellingPrice: p.price,
        mrp: p.mrp,
        images: [p.image],
        categoryName: p.category,
        variants: [],
      }));
    }
    const ids = items.map((p) => p.id);
    const resolved = items.map((p) => ({
      ...p,
      images: overrides?.[p.id] ? [overrides[p.id]] : p.images,
    }));
    return { data: { products: resolved }, ids };
  }

  return { data: {}, ids: [] };
}

interface PendingEdit {
  section: SectionItem;
  target: EditableImageTarget;
  itemId: string | null;
  currentUrl: string;
}

export function EditableSectionList({
  slug,
  sections,
  theme,
  storeData,
  templateId,
  viewport,
  selectedSectionId,
  onSelectSection,
  onReorder,
  onDuplicateSection,
  onToggleVisibility,
  onDeleteSection,
  onUpdateSection,
}: EditableSectionListProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ResolvedProduct[]>([]);
  const [categories, setCategories] = useState<ResolvedCategory[]>([]);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  const template = getTemplateById(templateId || '');
  const templateCategory: TemplateCategory = template?.category || 'general';
  const effectiveTemplateId = templateId || 'general';

  // Load published store data so the canvas matches the live store.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/store/${slug}/products?limit=12`),
          fetch(`/api/store/${slug}/categories`),
        ]);
        const [prodJson, catJson] = await Promise.all([prodRes.json(), catRes.json()]);
        if (cancelled) return;
        setProducts((prodJson.success ? prodJson.data : []).map(normalizeProduct));
        setCategories((catJson.success ? catJson.data : []).map(normalizeCategory));
      } catch {
        if (cancelled) return;
        setProducts([]);
        setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visibleSections = useMemo(
    () =>
      [...sections]
        .filter((s) => s.visible)
        .sort((a, b) => a.order - b.order),
    [sections]
  );

  const resolvedMap = useMemo(() => {
    const map: Record<string, ResolvedSection> = {};
    for (const section of visibleSections) {
      map[section.id] = resolveSectionData(
        section,
        products,
        categories,
        templateCategory,
        effectiveTemplateId
      );
    }
    return map;
  }, [visibleSections, products, categories, templateCategory, effectiveTemplateId]);

  const sorted = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );

  const handleEditImage = (sectionId: string, imgIndex: number, imgSrc: string) => {
    const section = sorted.find((s) => s.id === sectionId);
    if (!section) return;
    const target = getEditableImageTarget(section.type);
    if (!target) return;

    if (target.kind === 'config') {
      setPendingEdit({ section, target, itemId: null, currentUrl: imgSrc });
      return;
    }

    const itemId = resolvedMap[section.id]?.ids[imgIndex];
    if (!itemId) return;
    setPendingEdit({ section, target, itemId, currentUrl: imgSrc });
  };

  const gallery = useMemo<PickerImage[]>(() => {
    if (!pendingEdit) return [];
    const pool = STOREFRONT_DEMO_IMAGE_POOLS[templateCategory];
    const t = pendingEdit.target;

    if (t.kind === 'config') {
      const out: PickerImage[] = Object.entries(STOREFRONT_TEMPLATE_HEROES).map(([id, url]) => ({
        url,
        label: `Hero — ${id}`,
      }));
      pool.hero.forEach((url, i) => out.push({ url, label: `Banner ${i + 1}` }));
      pool.products.forEach((url, i) => out.push({ url, label: `Product ${i + 1}` }));
      pool.about.forEach((url, i) => out.push({ url, label: `About ${i + 1}` }));
      return out;
    }

    if (t.kind === 'products') {
      const storeUrls: PickerImage[] = products.flatMap((p) =>
        (p.images || []).map((url) => ({ url, label: p.title }))
      );
      const demoUrls: PickerImage[] = pool.products.map((url, i) => ({
        url,
        label: `Demo Product ${i + 1}`,
      }));
      return [...storeUrls, ...demoUrls];
    }

    const storeUrls: PickerImage[] = categories
      .filter((c) => c.image)
      .map((c) => ({ url: c.image!, label: c.name }));
    const demoUrls: PickerImage[] = pool.categories.map((url, i) => ({
      url,
      label: `Demo Category ${i + 1}`,
    }));
    return [...storeUrls, ...demoUrls];
  }, [pendingEdit, products, categories, templateCategory]);

  const applyImage = (url: string) => {
    if (!pendingEdit) return;
    const fresh = sorted.find((s) => s.id === pendingEdit.section.id);
    if (!fresh) return;
    const { target, itemId } = pendingEdit;

    if (target.kind === 'config') {
      onUpdateSection(fresh.id, { ...fresh.config, [target.key]: url });
      setPendingEdit((prev) => (prev ? { ...prev, currentUrl: url } : prev));
      return;
    }

    if (!itemId) return;
    onUpdateSection(fresh.id, buildConfigWithImageOverride(fresh.config, itemId, url));
    setPendingEdit((prev) => (prev ? { ...prev, currentUrl: url } : prev));

    // Real DB products also get their primary image updated server-side.
    if (target.kind === 'products' && !itemId.startsWith('demo_')) {
      fetch(`/api/products/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [url] }),
      }).catch(() => {
        // Override still persists via config.imageOverrides; ignore sync failure.
      });
    }
  };

  const font = getFontFamily(theme.fontFamily as string);
  const borderRadius = getBorderRadius(theme.borderRadius as string);
  const sectionTheme = {
    primaryColor: theme.primaryColor as string,
    accentColor: theme.accentColor as string,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading storefront preview...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CartProvider slug={slug}>
        <div
          className="space-y-12 pb-12"
          style={{
            backgroundColor: (theme.backgroundColor as string) || '#f8fafc',
            color: (theme.textColor as string) || '#0f172a',
            fontFamily: font,
            borderRadius,
          }}
        >
          {visibleSections.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3 text-slate-400">
              <ImageOff className="h-10 w-10" />
              <p className="text-sm font-semibold">No visible sections yet</p>
              <p className="text-xs">Add a section from the left panel to start building your store.</p>
            </div>
          ) : (
            visibleSections.map((section) => {
              const Component = getPreviewLoader(section.type);
              if (!Component) return null;
              const resolved = resolvedMap[section.id];
              const extraProps = {
                ...getSectionExtraProps({
                  type: section.type,
                  data: resolved.data,
                  theme: sectionTheme,
                  storeData,
                }),
                isMobilePreview: viewport === 'mobile',
              };
              const idx = sorted.findIndex((s) => s.id === section.id);

              return (
                <EditableSection
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  isFirst={idx === 0}
                  isLast={idx === sorted.length - 1}
                  onSelect={onSelectSection}
                  onEditImage={handleEditImage}
                  onMoveUp={() => idx > 0 && onReorder(idx, idx - 1)}
                  onMoveDown={() => idx < sorted.length - 1 && onReorder(idx, idx + 1)}
                  onDuplicate={() => onDuplicateSection(section.id)}
                  onToggleVisibility={() => onToggleVisibility(section.id)}
                  onDelete={() => onDeleteSection(section.id)}
                >
                  <Component config={section.config as never} slug={slug} {...extraProps} />
                </EditableSection>
              );
            })
          )}
        </div>
      </CartProvider>

      {pendingEdit && (
        <ImagePickerModal
          isOpen
          title={pendingEdit.target.label}
          currentImage={pendingEdit.currentUrl}
          gallery={gallery}
          onClose={() => setPendingEdit(null)}
          onSelect={applyImage}
        />
      )}
    </>
  );
}