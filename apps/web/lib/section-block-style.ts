import { SECTION_TYPES } from '@bharatstore/shared/constants';

export type SectionViewport = 'desktop' | 'tablet' | 'mobile';

export type SectionBlockWidth = 'full' | 'wide' | 'boxed' | 'narrow';
export type SectionBlockHeight = 'none' | 'short' | 'medium' | 'tall';
export type SectionBlockSpacing = 'none' | 'compact' | 'normal' | 'spacious' | 'huge';
export type SectionBlockRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface SectionBlockStyle {
  blockWidth?: SectionBlockWidth;
  minHeight?: SectionBlockHeight;
  paddingY?: SectionBlockSpacing;
  radius?: SectionBlockRadius;
  bgColor?: string;
  textColor?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export const SECTION_BLOCK_STYLE_DEFAULTS: Required<SectionBlockStyle> = {
  blockWidth: 'full',
  minHeight: 'none',
  paddingY: 'none',
  radius: 'none',
  bgColor: '',
  textColor: '',
  hideOnMobile: false,
  hideOnTablet: false,
  hideOnDesktop: false,
};

export const BLOCK_WIDTH_OPTIONS: Array<{ value: SectionBlockWidth; label: string }> = [
  { value: 'full', label: 'Full Width' },
  { value: 'wide', label: 'Wide (max 1280px)' },
  { value: 'boxed', label: 'Boxed (max 1024px)' },
  { value: 'narrow', label: 'Narrow (max 768px)' },
];

export const MIN_HEIGHT_OPTIONS: Array<{ value: SectionBlockHeight; label: string }> = [
  { value: 'none', label: 'Auto (content)' },
  { value: 'short', label: 'Short (200px)' },
  { value: 'medium', label: 'Medium (400px)' },
  { value: 'tall', label: 'Tall (70vh)' },
];

export const SPACING_OPTIONS: Array<{ value: SectionBlockSpacing; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'compact', label: 'Compact (16px)' },
  { value: 'normal', label: 'Normal (40px)' },
  { value: 'spacious', label: 'Spacious (64px)' },
  { value: 'huge', label: 'Huge (112px)' },
];

export const RADIUS_OPTIONS: Array<{ value: SectionBlockRadius; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
  { value: '2xl', label: '2XL' },
  { value: '3xl', label: '3XL' },
];

export function normalizeSectionBlockStyle(raw?: SectionBlockStyle | null): Required<SectionBlockStyle> {
  return { ...SECTION_BLOCK_STYLE_DEFAULTS, ...(raw || {}) };
}

const PADDING_CLASSES: Record<SectionBlockSpacing, string> = {
  none: '',
  compact: 'py-4 sm:py-4',
  normal: 'py-8 sm:py-10',
  spacious: 'py-12 sm:py-16',
  huge: 'py-20 sm:py-28',
};

const MIN_HEIGHT_CLASSES: Record<SectionBlockHeight, string> = {
  none: '',
  short: 'min-h-[200px] flex flex-col justify-center',
  medium: 'min-h-[400px] flex flex-col justify-center',
  tall: 'min-h-[70vh] flex flex-col justify-center',
};

const RADIUS_CLASSES: Record<SectionBlockRadius, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

const MAX_WIDTH_CLASSES: Record<SectionBlockWidth, string> = {
  full: 'w-full',
  wide: 'w-full max-w-7xl mx-auto',
  boxed: 'w-full max-w-5xl mx-auto',
  narrow: 'w-full max-w-3xl mx-auto',
};

/** True for sections that use position:sticky internally — wrap must not set overflow-hidden. */
const STICKY_SECTION_TYPES = new Set<string>([SECTION_TYPES.STICKY_HEADER, SECTION_TYPES.SEARCH_OVERLAY]);

export interface SectionBlockClassResult {
  className: string;
  style: Record<string, string | undefined>;
  isSticky: boolean;
  hasBg: boolean;
  hasText: boolean;
}

export function getSectionBlockClass(
  type: string,
  rawStyle?: SectionBlockStyle | null,
  viewport?: SectionViewport,
  builderMode = false
): SectionBlockClassResult {
  const style = normalizeSectionBlockStyle(rawStyle);
  const isSticky = STICKY_SECTION_TYPES.has(type);
  const radius = isSticky ? 'none' : style.radius;
  const radiusClass = RADIUS_CLASSES[radius] || '';
  const widthClass = MAX_WIDTH_CLASSES[style.blockWidth] || '';
  const heightClass = isSticky ? '' : MIN_HEIGHT_CLASSES[style.minHeight] || '';
  const paddingClass = PADDING_CLASSES[style.paddingY] || '';
  const overflowClass = radius !== 'none' ? 'overflow-hidden' : '';

  let hideClass = '';
  if (builderMode && viewport) {
    if (viewport === 'mobile' && style.hideOnMobile) hideClass = 'hidden';
    else if (viewport === 'tablet' && style.hideOnTablet) hideClass = 'hidden';
    else if (viewport === 'desktop' && style.hideOnDesktop) hideClass = 'hidden';
  } else {
    const hideParts: string[] = [];
    if (style.hideOnMobile) hideParts.push('max-sm:hidden');
    if (style.hideOnTablet) hideParts.push('sm:max-lg:hidden');
    if (style.hideOnDesktop) hideParts.push('lg:hidden');
    hideClass = hideParts.join(' ');
  }

  const className = ['section-block', widthClass, heightClass, paddingClass, radiusClass, overflowClass, hideClass]
    .filter(Boolean)
    .join(' ');

  return {
    className,
    style: {
      backgroundColor: style.bgColor || undefined,
      '--sb-bg': style.bgColor || undefined,
      '--sb-text': style.textColor || undefined,
    },
    isSticky,
    hasBg: !!style.bgColor,
    hasText: !!style.textColor,
  };
}