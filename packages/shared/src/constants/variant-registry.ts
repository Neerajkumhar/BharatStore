import { SECTION_TYPES, type SectionType } from './component-registry';

export const CARD_VARIANT_VALUES = [
  'classic',
  'editorial',
  'overlay',
  'compact',
  'luxury',
  'deal',
  'quick-add',
  'minimal',
  'featured',
] as const;

export type CardVariant = (typeof CARD_VARIANT_VALUES)[number];

export const CARD_VARIANT_LABELS: Record<CardVariant, string> = {
  classic: 'Classic Border Card',
  editorial: 'Editorial Minimalist',
  overlay: 'Full Image Overlay',
  compact: 'Compact Quick-Commerce',
  luxury: 'Luxury Serif Accent',
  deal: 'Deal Savings Highlight',
  'quick-add': 'Quick-Add Counter',
  minimal: 'Minimal Clean List',
  featured: 'Featured Showcase',
};

export const CARD_VARIANT_OPTIONS = CARD_VARIANT_VALUES.map((value) => ({
  value,
  label: CARD_VARIANT_LABELS[value],
}));

export const DEFAULT_CARD_VARIANT: CardVariant = 'classic';

export interface SectionCardVariantDefinition {
  label: string;
  default: CardVariant;
  options: readonly CardVariant[];
}

export const SECTION_VARIANT_REGISTRY: Partial<Record<SectionType, SectionCardVariantDefinition>> = {
  [SECTION_TYPES.FEATURED_PRODUCTS]: {
    label: 'Product Card Visual Style',
    default: 'classic',
    options: CARD_VARIANT_VALUES,
  },
  [SECTION_TYPES.PRODUCT_GRID]: {
    label: 'Product Card Visual Style',
    default: 'classic',
    options: CARD_VARIANT_VALUES,
  },
  [SECTION_TYPES.PRODUCT_CAROUSEL]: {
    label: 'Product Card Visual Style',
    default: 'classic',
    options: CARD_VARIANT_VALUES,
  },
  [SECTION_TYPES.PRODUCT_RAIL]: {
    label: 'Product Card Visual Style',
    default: 'compact',
    options: CARD_VARIANT_VALUES,
  },
  [SECTION_TYPES.PRODUCT_TRENDING]: {
    label: 'Product Card Visual Style',
    default: 'deal',
    options: CARD_VARIANT_VALUES,
  },
  [SECTION_TYPES.PRODUCT_TABS]: {
    label: 'Product Card Visual Style',
    default: 'classic',
    options: CARD_VARIANT_VALUES,
  },
  [SECTION_TYPES.FLASH_SALE]: {
    label: 'Product Card Visual Style',
    default: 'deal',
    options: CARD_VARIANT_VALUES,
  },
};

export function getSectionCardVariantDefinition(sectionType: SectionType): SectionCardVariantDefinition | undefined {
  return SECTION_VARIANT_REGISTRY[sectionType];
}

export function getDefaultCardVariant(sectionType?: SectionType): CardVariant {
  if (sectionType) {
    const definition = SECTION_VARIANT_REGISTRY[sectionType];
    if (definition) return definition.default;
  }
  return DEFAULT_CARD_VARIANT;
}

export function getCardVariantOptions(sectionType?: SectionType): readonly { value: string; label: string }[] {
  if (sectionType) {
    const definition = SECTION_VARIANT_REGISTRY[sectionType];
    if (definition) return CARD_VARIANT_OPTIONS;
  }
  return CARD_VARIANT_OPTIONS;
}