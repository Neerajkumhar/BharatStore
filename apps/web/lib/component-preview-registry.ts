import {
  COMPONENT_REGISTRY,
  SECTION_TYPES,
  STOREFRONT_DEMO_IMAGE_POOLS,
  CARD_VARIANT_VALUES,
  type CardVariant,
  type ComponentCategory,
  type TemplateCategory,
} from '@bharatstore/shared/constants';
import { getDemoDataset } from './storefront-demo-data';

export const ALL_INDUSTRIES: TemplateCategory[] = [
  'general',
  'fashion',
  'electronics',
  'grocery',
  'beauty',
  'food',
  'home',
];

export type PageType = 'home' | 'about' | 'contact' | 'product' | 'promo' | 'content';

export const PAGE_TYPE_OPTIONS: Array<{ id: PageType | 'all'; label: string }> = [
  { id: 'all', label: 'All Pages' },
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'product', label: 'Product' },
  { id: 'promo', label: 'Promo' },
  { id: 'content', label: 'Content' },
];

const SECTION_PAGE_TYPES: Record<string, PageType[]> = {
  announcement: ['home', 'promo'],
  'sticky-header': ['home', 'content'],
  'mega-menu': ['home', 'content'],
  'mobile-nav': ['home', 'content'],
  'search-overlay': ['home', 'product'],
  hero: ['home', 'promo'],
  'hero-fullscreen': ['home', 'promo'],
  'hero-split': ['home', 'promo'],
  'hero-editorial': ['home', 'promo'],
  'hero-product': ['product', 'home'],
  'hero-minimal': ['home', 'promo'],
  categories: ['home', 'product'],
  'category-circular': ['home', 'product'],
  'category-mega': ['home', 'product'],
  'featured-products': ['product', 'home'],
  'product-grid': ['product', 'home'],
  'product-carousel': ['product', 'home'],
  'product-rail': ['product', 'home'],
  'product-spotlight': ['product', 'home'],
  'product-trending': ['product', 'home'],
  'product-tabs': ['product', 'home'],
  'product-comparison': ['product', 'home'],
  banner: ['promo', 'home'],
  'promo-split': ['promo', 'home'],
  'countdown-sale': ['promo', 'home'],
  'flash-sale': ['promo', 'product'],
  'coupon-strip': ['promo', 'home'],
  'free-shipping-bar': ['promo', 'home'],
  'offer-marquee': ['promo', 'home'],
  about: ['about'],
  'editorial-split': ['about', 'content'],
  'editorial-fullwidth': ['about', 'content'],
  lookbook: ['about', 'content'],
  'asymmetric-gallery': ['about', 'content'],
  'brand-story': ['about'],
  'routine-builder': ['about', 'content'],
  trust: ['home', 'content'],
  testimonials: ['content', 'home'],
  'reviews-summary': ['content', 'home'],
  'brand-logos': ['content', 'home'],
  faq: ['contact', 'content'],
  contact: ['contact'],
  'delivery-info': ['contact'],
  newsletter: ['content', 'contact'],
  footer: ['content', 'home'],
  'size-guide': ['product', 'contact'],
  'shop-by-concern': ['product', 'home'],
  'shop-by-room': ['product', 'home'],
  'ingredient-highlights': ['about', 'content'],
};

export interface ComponentPreviewEntry {
  id: string;
  sectionType: string;
  name: string;
  variant: string | null;
  variantLabel: string | null;
  category: ComponentCategory;
  icon: string;
  industries: TemplateCategory[];
  demoCategory: TemplateCategory;
  config: Record<string, unknown>;
  tags: string[];
  pageTypes: PageType[];
  isNew?: boolean;
}

interface VariantDraft {
  sectionType: string;
  name: string;
  variant?: string | null;
  variantLabel?: string | null;
  industries?: TemplateCategory[];
  demoCategory?: TemplateCategory;
  configOverrides?: Record<string, unknown>;
  tags?: string[];
  isNew?: boolean;
}

const pools = STOREFRONT_DEMO_IMAGE_POOLS;
const helm = (c: TemplateCategory, i = 0) => pools[c].hero[i];
const canim = (c: TemplateCategory, i = 0) => pools[c].categories[i];
const prim = (c: TemplateCategory, i = 0) => pools[c].products[i];
const bnnrim = (c: TemplateCategory, i = 0) => pools[c].banner[i];
const aboutim = (c: TemplateCategory) => pools[c].about[0];

const industriesOf = (industries?: TemplateCategory[]): TemplateCategory[] =>
  industries && industries.length ? industries : [...ALL_INDUSTRIES];

function buildEntry(draft: VariantDraft): ComponentPreviewEntry {
  const def = COMPONENT_REGISTRY[draft.sectionType as keyof typeof COMPONENT_REGISTRY];
  const data = getDemoDataset(draft.demoCategory || 'general');
  const slug = `${draft.sectionType}${draft.variant ? `-${draft.variant}` : ''}`;
  return {
    id: slug,
    sectionType: draft.sectionType,
    name: draft.name,
    variant: draft.variant ?? null,
    variantLabel: draft.variantLabel ?? null,
    category: def.category,
    icon: def.icon,
    industries: industriesOf(draft.industries),
    demoCategory: draft.demoCategory || 'general',
    config: {
      ...def.defaultConfig,
      ...(data.store ? { tradeName: data.store.tradeName } : {}),
      ...draft.configOverrides,
    },
    tags: draft.tags && draft.tags.length ? draft.tags : [],
    pageTypes: SECTION_PAGE_TYPES[draft.sectionType] ?? ['content'],
    isNew: draft.isNew,
  };
}

const ANNOUNCEMENTS = getDemoDataset('general');

const entryFromDraft = (draft: VariantDraft): ComponentPreviewEntry => buildEntry(draft);

export const COMPONENT_PREVIEW_REGISTRY: ComponentPreviewEntry[] = [
  // ─── Navigation ───────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.ANNOUNCEMENT,
    name: 'Announcement Bar',
    variant: 'promo',
    variantLabel: 'Promo Strip',
    configOverrides: {
      text: ANNOUNCEMENTS.store.tradeName ? 'Free shipping on orders above ₹999!' : 'Free shipping above ₹999!',
      link: '/products',
      bgColor: '#0f172a',
      textColor: '#fbbf24',
      marquee: false,
      dismissible: true,
    },
    tags: ['offers', 'shipping'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.ANNOUNCEMENT,
    name: 'Marquee Ticker',
    variant: 'marquee',
    variantLabel: 'Scrolling Marquee',
    configOverrides: {
      text: 'Big Festival Sale Live — Up to 70% Off • Free Shipping Above ₹999 • COD Available',
      bgColor: '#7c2d12',
      textColor: '#fed7aa',
      marquee: true,
      dismissible: false,
    },
    tags: ['sale', 'ticker'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.STICKY_HEADER,
    name: 'Sticky Header',
    variant: 'classic',
    variantLabel: 'Classic',
    configOverrides: { style: 'classic', showSearch: true, showCart: true, showAccount: true },
    tags: ['nav'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.STICKY_HEADER,
    name: 'Sticky Header',
    variant: 'minimal',
    variantLabel: 'Minimal',
    configOverrides: { style: 'minimal', showSearch: true, showCart: true, showAccount: false },
    tags: ['nav', 'clean'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.STICKY_HEADER,
    name: 'Sticky Header',
    variant: 'centered',
    variantLabel: 'Centered',
    configOverrides: { style: 'centered', showSearch: true, showCart: true, showAccount: true },
    industries: ['fashion', 'beauty'],
    tags: ['nav', 'luxury'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.STICKY_HEADER,
    name: 'Sticky Header',
    variant: 'split',
    variantLabel: 'Split Brand',
    configOverrides: { style: 'split', showSearch: true, showCart: true, showAccount: true },
    tags: ['nav'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.STICKY_HEADER,
    name: 'Sticky Header',
    variant: 'searchbar',
    variantLabel: 'Inline Search',
    configOverrides: { style: 'searchbar', showSearch: true, showCart: true, showAccount: true },
    industries: ['electronics', 'grocery', 'general'],
    tags: ['nav', 'search'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.STICKY_HEADER,
    name: 'Sticky Header',
    variant: 'bordered',
    variantLabel: 'Bordered',
    industries: ['general', 'electronics'],
    configOverrides: { style: 'bordered', showSearch: true, showCart: true, showAccount: true },
    tags: ['nav', 'promo'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.MEGA_MENU,
    name: 'Mega Menu',
    variant: 'classic',
    variantLabel: 'Classic Columns',
    configOverrides: { layout: 'classic' },
    tags: ['nav', 'catalog'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.MEGA_MENU,
    name: 'Mega Menu',
    variant: 'bricks',
    variantLabel: 'Brick Tiles',
    configOverrides: { layout: 'bricks' },
    tags: ['nav'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.MEGA_MENU,
    name: 'Mega Menu',
    variant: 'masonry',
    variantLabel: 'Masonry',
    industries: ['fashion', 'home'],
    configOverrides: { layout: 'masonry' },
    tags: ['nav'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.MEGA_MENU,
    name: 'Mega Menu',
    variant: 'tabs',
    variantLabel: 'Tabbed Groups',
    configOverrides: { layout: 'tabs' },
    tags: ['nav', 'interactive'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.SEARCH_OVERLAY,
    name: 'Search Overlay',
    configOverrides: { placeholder: 'Search products…', popularSearches: ['Dresses', 'Laptops', 'Basmati Rice', 'Vitamin C'] },
    tags: ['search', 'nav'],
  }),

  // ─── Heroes ───────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.HERO,
    name: 'Hero',
    variant: 'collection',
    variantLabel: 'Collection',
    demoCategory: 'general',
    configOverrides: {
      layout: 'collection',
      title: 'New Season, New You',
      subtitle: 'Handpicked every-day essentials at honest local prices.',
      imageUrl: helm('general', 0),
      ctaText: 'Shop Now',
      ctaLink: '/products',
      alignment: 'left',
      height: 'large',
      overlayOpacity: 55,
    },
    industries: ['general', 'fashion', 'home'],
    tags: ['hero'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.HERO,
    name: 'Hero',
    variant: 'campaign',
    variantLabel: 'Campaign Drop',
    demoCategory: 'grocery',
    configOverrides: {
      layout: 'campaign',
      title: 'Festival Sale Is Live',
      subtitle: 'Up to 70% off across the store.',
      imageUrl: helm('grocery', 1),
      ctaText: 'Grab Deals',
      ctaLink: '/products',
      secondaryCtaText: 'View Catalog',
      secondaryCtaLink: '/products',
      overlayOpacity: 70,
    },
    industries: ['grocery', 'food', 'electronics', 'general'],
    tags: ['hero', 'sale'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.HERO,
    name: 'Hero',
    variant: 'layered',
    variantLabel: 'Layered Collage',
    demoCategory: 'beauty',
    configOverrides: {
      layout: 'layered',
      title: 'Clean Beauty, Naturally',
      subtitle: 'Derm-tested skincare & cruelty-free haircare.',
      imageUrl: helm('beauty', 0),
      ctaText: 'Explore the Edit',
      secondaryCtaText: 'Shop by Concern',
      ctaLink: '/products',
      overlayOpacity: 50,
    },
    industries: ['beauty', 'home', 'fashion'],
    tags: ['hero', 'glam'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_FULLSCREEN,
    name: 'Fullscreen Hero',
    demoCategory: 'fashion',
    configOverrides: {
      title: 'Crafted to Inspire.',
      subtitle: 'Explore our latest heritage release',
      imageUrl: helm('fashion', 0),
      ctaText: 'Discover Collection',
      overlayOpacity: 50,
    },
    industries: ['fashion', 'beauty', 'home', 'general'],
    tags: ['hero', 'immersive'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_SPLIT,
    name: 'Split Hero',
    variant: 'left-image',
    variantLabel: 'Image Left',
    demoCategory: 'fashion',
    configOverrides: {
      layout: 'left-image',
      badge: 'The Winters Edit',
      title: 'Modern Design for Daily Life',
      subtitle: 'Thoughtful materials, clean lines and long-lasting durability.',
      imageUrl: helm('fashion', 2),
      ctaText: 'Explore Now',
      overlayOpacity: 40,
    },
    industries: ['fashion', 'home'],
    tags: ['hero', 'split'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_SPLIT,
    name: 'Split Hero',
    variant: 'right-image',
    variantLabel: 'Image Right',
    demoCategory: 'food',
    configOverrides: {
      layout: 'right-image',
      badge: 'Fresh Roasts',
      title: 'Brewed Local, Roasted Daily',
      subtitle: 'Single-origin beans shipped straight from our roastery.',
      imageUrl: helm('food', 0),
      ctaText: 'Shop Coffee',
      overlayOpacity: 40,
    },
    industries: ['food', 'grocery'],
    tags: ['hero', 'split'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_EDITORIAL,
    name: 'Editorial Hero',
    demoCategory: 'fashion',
    configOverrides: {
      seasonTag: 'Autumn / Winter 2026',
      headline: 'The Heritage Edit',
      subheadline: 'Handwoven textiles & modern Indian craftsmanship',
      imageUrl: helm('fashion', 1),
      accentText: '50+ Looks',
      ctaText: 'View Lookbook',
    },
    industries: ['fashion'],
    tags: ['hero', 'editorial'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_PRODUCT,
    name: 'Product Hero',
    demoCategory: 'electronics',
    configOverrides: {
      badge: 'Flagship Launch',
      title: 'Pro Wireless Headphones',
      subtitle: 'Active Noise Cancellation • 40-Hour Battery',
      price: '4999',
      comparePrice: '7999',
      imageUrl: helm('electronics', 1),
      ctaText: 'Buy Now',
    },
    industries: ['electronics'],
    tags: ['hero', 'product'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_MINIMAL,
    name: 'Minimal Hero',
    demoCategory: 'grocery',
    configOverrides: {
      title: 'Clean. Essential. Honest.',
      subtitle: 'Pure organic produce delivered fresh every morning.',
      ctaText: 'Shop Essentials',
    },
    industries: ['grocery', 'food', 'general'],
    tags: ['hero', 'clean'],
  }),

  // ─── Collections ──────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORIES,
    name: 'Categories',
    variant: 'grid',
    variantLabel: 'Grid',
    configOverrides: { layout: 'grid', columns: 6, limit: 6, showProductCount: true },
    tags: ['catalog'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORIES,
    name: 'Categories',
    variant: 'carousel',
    variantLabel: 'Carousel',
    configOverrides: { layout: 'carousel', columns: 6, limit: 8, showProductCount: true },
    tags: ['catalog'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORIES,
    name: 'Categories',
    variant: 'stacked',
    variantLabel: 'Stacked List',
    industries: ['fashion', 'general'],
    configOverrides: { layout: 'stacked', limit: 5, showProductCount: true },
    tags: ['catalog'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORIES,
    name: 'Categories',
    variant: 'bento',
    variantLabel: 'Bento Feature',
    industries: ['home', 'fashion'],
    configOverrides: { layout: 'bento', limit: 6, showProductCount: true },
    tags: ['catalog', 'feature'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORY_CIRCULAR,
    name: 'Circular Categories',
    demoCategory: 'grocery',
    configOverrides: { title: 'Explore Departments', limit: 8, showLabels: true },
    industries: ['grocery', 'food'],
    tags: ['catalog'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORY_MEGA,
    name: 'Mega Categories',
    variant: 'standard',
    variantLabel: 'Standard Cards',
    configOverrides: { cardStyle: 'standard', columns: 3, limit: 6 },
    tags: ['catalog'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.CATEGORY_MEGA,
    name: 'Mega Categories',
    variant: 'editorial',
    variantLabel: 'Editorial Cards',
    industries: ['home', 'beauty', 'fashion'],
    configOverrides: { cardStyle: 'editorial', columns: 3, limit: 6 },
    tags: ['catalog', 'editorial'],
  }),

  // ─── Products ─────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.FEATURED_PRODUCTS,
    name: 'Featured Products',
    variant: 'grid',
    variantLabel: 'Grid',
    configOverrides: { layout: 'grid', columns: 4, limit: 8, cardVariant: 'classic', selectionMode: 'featured' },
    tags: ['products'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.FEATURED_PRODUCTS,
    name: 'Featured Products',
    variant: 'deal',
    variantLabel: 'Deal Cards',
    configOverrides: { layout: 'carousel', columns: 4, limit: 6, cardVariant: 'deal', selectionMode: 'featured' },
    industries: ['grocery', 'electronics', 'food'],
    tags: ['products', 'sale'],
  }),

  ...CARD_VARIANT_VALUES.map((variant: CardVariant) =>
    entryFromDraft({
      sectionType: SECTION_TYPES.PRODUCT_GRID,
      name: `Product Grid — ${variant.charAt(0).toUpperCase()}${variant.slice(1)}`,
      variant,
      variantLabel: variant,
      configOverrides: { columns: 4, showFilters: false, showSort: false, cardVariant: variant },
      tags: ['products', variant],
    })
  ),

  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_CAROUSEL,
    name: 'Product Carousel',
    variant: 'row',
    variantLabel: 'Slide Row',
    configOverrides: { layout: 'row', limit: 8, autoplay: true, showArrows: true, cardVariant: 'classic' },
    tags: ['products'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_CAROUSEL,
    name: 'Product Carousel',
    variant: 'fade',
    variantLabel: 'Crossfade',
    demoCategory: 'beauty',
    configOverrides: { layout: 'fade', limit: 5, autoplay: true, showArrows: true, cardVariant: 'featured' },
    industries: ['beauty', 'fashion', 'home'],
    tags: ['products', 'premium'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_CAROUSEL,
    name: 'Product Carousel',
    variant: 'ticker',
    variantLabel: 'Marquee Ticker',
    configOverrides: { layout: 'ticker', limit: 8, autoplay: true, cardVariant: 'compact' },
    industries: ['grocery', 'food', 'general'],
    tags: ['products', 'ticker'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_RAIL,
    name: 'Product Rail',
    demoCategory: 'fashion',
    configOverrides: { title: 'New Drops', limit: 10, cardVariant: 'compact' },
    tags: ['products', 'compact'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_SPOTLIGHT,
    name: 'Product Spotlight',
    demoCategory: 'grocery',
    configOverrides: {
      title: 'Product of the Month',
      subtitle: 'Pure Cold-Pressed Virgin Coconut Oil',
      price: '349',
      mrp: '449',
      features: ['100% Organic', 'Cold Pressed', 'Zero Preservatives'],
      imageUrl: prim('grocery', 2),
      ctaText: 'Add to Cart',
    },
    industries: ['grocery', 'food', 'beauty'],
    tags: ['products', 'spotlight'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_TRENDING,
    name: 'Trending Now',
    configOverrides: { title: 'Trending Now', subtitle: 'What everyone is buying right now', limit: 6, columns: 3, cardVariant: 'deal' },
    tags: ['products', 'sale'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_TABS,
    name: 'Product Tabs',
    variant: 'classic',
    variantLabel: 'Classic Tabs',
    configOverrides: { title: 'Explore Collections', tabs: ['Bestsellers', 'New In', 'On Sale'], limit: 8, columns: 4, cardVariant: 'classic' },
    tags: ['products'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_TABS,
    name: 'Product Tabs',
    variant: 'editorial',
    variantLabel: 'Editorial Cards',
    demoCategory: 'fashion',
    industries: ['fashion', 'home', 'beauty'],
    configOverrides: { title: 'The Boutique Edit', tabs: ['Sarees', 'Kurtas', 'Accessories'], limit: 8, columns: 4, cardVariant: 'editorial' },
    tags: ['products', 'editorial'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.PRODUCT_COMPARISON,
    name: 'Compare Models',
    demoCategory: 'electronics',
    configOverrides: {
      title: 'Compare Models',
      features: ['Display Size', 'Battery Life', 'Storage', 'Warranty', 'Price'],
    },
    industries: ['electronics'],
    tags: ['products', 'compare'],
  }),

  // ─── Marketing ────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.BANNER,
    name: 'Banner Offer',
    demoCategory: 'electronics',
    configOverrides: {
      heading: 'Flash Sale — 48 Hours',
      description: 'Up to 40% off on audio, captures and smart home gear.',
      imageUrl: bnnrim('electronics', 0),
      ctaText: 'Shop Deals',
      bgColor: '#fef3c7',
      textColor: '#92400e',
    },
    tags: ['promo'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.PROMO_SPLIT,
    name: 'Promo Split',
    demoCategory: 'fashion',
    configOverrides: {},
    industries: ['fashion', 'general'],
    tags: ['promo'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.COUNTDOWN_SALE,
    name: 'Countdown Sale',
    demoCategory: 'general',
    configOverrides: {
      title: 'Festival Flash Sale Ends In:',
      badge: 'Hurry! Limited Time Offer',
      ctaText: 'Grab Deals Now',
      bgColor: '#7c2d12',
      textColor: '#fed7aa',
    },
    tags: ['sale', 'urgent'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.FLASH_SALE,
    name: 'Flash Deals',
    configOverrides: { title: 'Flash Deals — Up to 60% Off', subtitle: 'Selling out fast. Stock updated hourly.', limit: 4, cardVariant: 'deal' },
    tags: ['sale'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.COUPON_STRIP,
    name: 'Coupon Strip',
    configOverrides: {
      title: 'Store Discount Coupons',
      coupons: [
        { code: 'WELCOME10', discount: '10% OFF', detail: 'First order above ₹499' },
        { code: 'FESTIVE20', discount: '20% OFF', detail: 'Festive collection above ₹999' },
        { code: 'FREE1200', discount: '₹100 OFF', detail: 'Orders above ₹1200' },
      ],
    },
    tags: ['promo', 'coupon'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.FREE_SHIPPING_BAR,
    name: 'Free Shipping Bar',
    configOverrides: { threshold: 999, text: 'Add ₹{remaining} more for FREE Pan-India Shipping!', bgColor: '#15803d', textColor: '#ffffff' },
    tags: ['shipping'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.OFFER_MARQUEE,
    name: 'Offer Marquee',
    industries: ['grocery', 'food', 'general'],
    configOverrides: {
      items: ['Free delivery above ₹999', 'Use code BHARAT10', 'Khata credit available', 'Fresh stock daily'],
      speed: 'normal',
      bgColor: '#1e293b',
      textColor: '#f8fafc',
    },
    tags: ['ticker', 'promo'],
  }),

  // ─── Editorial ────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.ABOUT,
    name: 'About Store',
    demoCategory: 'home',
    configOverrides: {
      title: 'About Us',
      description: 'We are a family-owned business dedicated to quality, delivering handpicked products since 2012.',
      imageUrl: aboutim('home'),
    },
    tags: ['story'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.EDITORIAL_SPLIT,
    name: 'Editorial Split',
    demoCategory: 'home',
    industries: ['home', 'beauty', 'fashion'],
    configOverrides: {
      quote: 'Craftsmanship is the bridge between heritage and modern living.',
      author: 'Our Founder',
      story: 'Every thread and ingredient in our store is chosen with reverence.',
      imageUrl: canim('home', 0),
    },
    tags: ['story'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.EDITORIAL_FULLWIDTH,
    name: 'Editorial Full Width',
    demoCategory: 'food',
    industries: ['food', 'grocery'],
    configOverrides: {
      title: 'Purity in Every Batch',
      subtitle: 'From local Bharatiya farms straight to your home kitchen.',
      imageUrl: canim('food', 1),
    },
    tags: ['story'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.LOOKBOOK,
    name: 'Lookbook Gallery',
    demoCategory: 'fashion',
    industries: ['fashion', 'home', 'beauty'],
    configOverrides: { title: 'Season Lookbook', subtitle: 'Get inspired by our styled edits', columns: 3 },
    tags: ['gallery'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.ASYMMETRIC_GALLERY,
    name: 'Asymmetric Gallery',
    demoCategory: 'home',
    industries: ['home', 'fashion'],
    configOverrides: { title: 'Design Gallery', subtitle: 'A glimpse into our artisanal process' },
    tags: ['gallery'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.BRAND_STORY,
    name: 'Brand Story',
    demoCategory: 'general',
    configOverrides: {
      title: 'Our Journey Since 2012',
      story: 'Started as a small local shop, BharatStore has grown into a trusted neighbourhood brand.',
      milestones: [
        { year: '2012', event: 'Opened our first local counter' },
        { year: '2018', event: 'Expanded to 3 neighbourhood stores' },
        { year: '2024', event: 'Launched online checkout' },
      ],
    },
    tags: ['story'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.ROUTINE_BUILDER,
    name: 'Routine Builder',
    demoCategory: 'beauty',
    industries: ['beauty'],
    configOverrides: {
      title: '3-Step Daily Glow Routine',
      steps: [
        { step: '01', title: 'Cleanse', desc: 'Gentle micellar cleanser with ceramides.' },
        { step: '02', title: 'Treat', desc: 'Vitamin C serum for brightening.' },
        { step: '03', title: 'Moisturise', desc: 'Lightweight gel cream for all-day hydration.' },
      ],
    },
    tags: ['beauty', 'routine'],
  }),

  // ─── Trust ────────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.TRUST,
    name: 'Trust Badges',
    configOverrides: {
      badges: [
        { icon: 'ShieldCheck', title: 'Secure Payments', description: '100% secure checkout' },
        { icon: 'FileText', title: 'GST Invoice', description: 'Tax compliance guaranteed' },
        { icon: 'Truck', title: 'Fast Delivery', description: 'Quick dispatch & tracking' },
        { icon: 'Headphones', title: '24/7 Support', description: 'We are here to help' },
      ],
    },
    tags: ['trust'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.TESTIMONIALS,
    name: 'Customer Testimonials',
    configOverrides: {
      title: 'What Our Customers Say',
      autoplay: false,
    },
    tags: ['trust', 'social'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.REVIEWS_SUMMARY,
    name: 'Reviews Summary',
    configOverrides: {
      rating: '4.9',
      reviewCount: '12,450+',
      headline: 'Loved by Thousands Across India',
      stats: [
        { number: '12,450+', label: 'Verified Orders' },
        { number: '4.9★', label: 'Average Rating' },
        { number: '98%', label: 'Would Recommend' },
      ],
    },
    tags: ['trust'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.BRAND_LOGOS,
    name: 'Brand Logos',
    configOverrides: { title: 'Featured In & Trusted By', logos: ['KIRANA PARTNERS', 'PAYMENT CO', 'LOGISTICS', 'BANKING'] },
    tags: ['trust'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.FAQ,
    name: 'FAQ Accordion',
    configOverrides: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'What payment methods do you accept?', answer: 'We accept Cash, UPI, and Khata credit.' },
        { question: 'How fast is delivery?', answer: 'Same-day dispatch, 2–4 day pan-India delivery.' },
        { question: 'Can I return a product?', answer: 'Easy 7-day no-questions-asked returns.' },
      ],
    },
    tags: ['faq', 'support'],
  }),

  // ─── Utility ──────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.CONTACT,
    name: 'Contact Section',
    configOverrides: { showPhone: true, showEmail: true, showAddress: true, showHours: true },
    tags: ['contact'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.DELIVERY_INFO,
    name: 'Delivery Info',
    industries: ['grocery', 'food'],
    configOverrides: {
      title: 'Shipping & Delivery Promise',
      items: [
        { title: 'Same-Day', desc: 'For orders before 2 PM' },
        { title: 'Cold Chain', desc: 'Chilled transit for perishables' },
        { title: 'Tracked', desc: 'Live order updates on WhatsApp' },
      ],
    },
    tags: ['delivery'],
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.NEWSLETTER,
    name: 'Newsletter Signup',
    configOverrides: {
      title: 'Join Our VIP Circle',
      subtitle: 'Subscribe for secret discounts, early drop access and seasonal updates.',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email or phone number...',
    },
    tags: ['retention'],
  }),

  // ─── Footer ───────────────────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.FOOTER,
    name: 'Store Footer',
    configOverrides: {
      showValueProps: true,
      showSocialLinks: true,
      showCopyright: true,
      valueProps: [
        { icon: 'ShieldCheck', title: 'Genuine Products', description: 'Direct store inventory' },
        { icon: 'Truck', title: 'Fast Dispatch', description: 'Quick local fulfillment' },
        { icon: 'CreditCard', title: 'Flexible Payment', description: 'UPI, Cash & Khata' },
        { icon: 'FileText', title: 'GST Invoice', description: 'B2B & B2C compliant' },
      ],
    },
    tags: ['footer'],
  }),

  // ─── Industry Solutions ───────────────────────────────────────────────────
  entryFromDraft({
    sectionType: SECTION_TYPES.SIZE_GUIDE,
    name: 'Size Guide Table',
    industries: ['fashion'],
    configOverrides: {
      title: 'Size Guide',
      subtitle: 'Find your perfect fit before you order',
      columns: ['Size', 'Chest', 'Length'],
      rows: [
        { label: 'S', values: ['38"', '28"'] },
        { label: 'M', values: ['40"', '29"'] },
        { label: 'L', values: ['42"', '30"'] },
        { label: 'XL', values: ['44"', '31"'] },
      ],
    },
    tags: ['fashion', 'sizing'],
    isNew: true,
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.SHOP_BY_CONCERN,
    name: 'Shop by Concern',
    demoCategory: 'beauty',
    industries: ['beauty'],
    configOverrides: {
      title: 'Shop by Concern',
      subtitle: 'Find the fix for what matters to you',
      concerns: ['Acne & Breakouts', 'Dullness', 'Dryness', 'Fine Lines', 'Sun Damage', 'Hairfall'],
    },
    tags: ['beauty', 'solutions'],
    isNew: true,
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.SHOP_BY_ROOM,
    name: 'Shop by Room',
    demoCategory: 'home',
    industries: ['home'],
    configOverrides: {
      title: 'Shop by Room',
      subtitle: 'Curated designs for every corner of your home',
      rooms: [
        { name: 'Living Room', items: ['Sofas', 'Rugs', 'Coffee Tables', 'Lighting'] },
        { name: 'Bedroom', items: ['Beds', 'Bedsheets', 'Wardrobes', 'Nightstands'] },
        { name: 'Kitchen', items: ['Cookware', 'Storage', 'Utensils', 'Countertops'] },
        { name: 'Study', items: ['Desks', 'Chairs', 'Shelves', 'Desk Lamps'] },
      ],
    },
    tags: ['home', 'solutions'],
    isNew: true,
  }),

  entryFromDraft({
    sectionType: SECTION_TYPES.INGREDIENT_HIGHLIGHTS,
    name: 'Ingredient Highlights',
    demoCategory: 'grocery',
    industries: ['grocery', 'food', 'beauty'],
    configOverrides: {
      title: 'Key Ingredients',
      subtitle: 'Purity you can trace, batch after batch',
      ingredients: [
        { name: 'Cold-Pressed Virgin Oils', benefit: 'Extracted without heat for maximum nutrition', tag: '100% Pure' },
        { name: 'Single-Origin Spices', benefit: 'Grown without chemical pesticides', tag: 'Organic' },
        { name: 'Traditional Grains', benefit: 'Naturally polished, never bleached', tag: 'House Special' },
      ],
    },
    tags: ['grocery', 'clean-label'],
    isNew: true,
  }),

  // ─── Extra page-oriented variants (Contact / About / FAQ / Trust / etc.) ──
  entryFromDraft({
    sectionType: SECTION_TYPES.CONTACT,
    name: 'Contact Section',
    variant: 'map',
    variantLabel: 'Store Visit Info',
    configOverrides: {
      title: 'Visit Our Store',
      showPhone: false,
      showEmail: false,
      showAddress: true,
      showHours: true,
    },
    tags: ['location', 'visiting', 'address', 'hours'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.CONTACT,
    name: 'Contact Section',
    variant: 'wall',
    variantLabel: 'Full Contact Wall',
    configOverrides: { title: 'We Are Here to Help' },
    tags: ['support', 'help', 'assistance'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.ABOUT,
    name: 'About Store',
    variant: 'stats',
    variantLabel: 'Story with Highlights',
    configOverrides: {
      title: 'Crafting Trust Since Day One',
      layout: 'center',
      description: 'A family-rooted store that has served the community for generations with authentic products.',
    },
    tags: ['story', 'highlights', 'mission', 'heritage'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.ABOUT,
    name: 'About Store',
    variant: 'collage',
    variantLabel: 'Image-First Story',
    configOverrides: {
      title: 'Behind the Weave',
      layout: 'right',
      description: 'Every piece in our collection carries the craft of skilled artisans and honest materials.',
    },
    tags: ['gallery', 'images', 'artisans'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.FAQ,
    name: 'FAQ Accordion',
    variant: 'help',
    variantLabel: 'Help Guides',
    configOverrides: {
      title: 'Help & Buying Guides',
      items: [
        { question: 'How do I place an order?', answer: 'Add items to the cart, choose delivery, and pay via UPI, card, COD, or Khata credit.' },
        { question: 'How quickly will I receive my order?', answer: 'Orders ship within 24 hours and reach you in 2-4 business days.' },
        { question: 'What is your return policy?', answer: 'You may raise a return within 7 days of delivery for a refund or exchange.' },
        { question: 'Can I get a GST invoice?', answer: 'Yes — every order includes a valid B2B/B2C GST tax invoice.' },
      ],
    },
    tags: ['help', 'guides', 'support', 'orders', 'returns'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.FAQ,
    name: 'FAQ Accordion',
    variant: 'two-col',
    variantLabel: 'Two-Column',
    configOverrides: {
      title: 'Quick Answers',
      items: [
        { question: 'Which payment methods do you accept?', answer: 'COD, UPI, Credit/Debit cards, and Khata credit.' },
        { question: 'Is my data safe?', answer: 'Yes, payments are fully encrypted and PCI-DSS compliant.' },
        { question: 'Do you deliver across India?', answer: 'We ship pan-India with free delivery above ₹999.' },
      ],
    },
    tags: ['questions', 'answers', 'support'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.TESTIMONIALS,
    name: 'Customer Testimonials',
    variant: 'wall',
    variantLabel: 'Customer Wall',
    configOverrides: {
      title: 'Wall of Love',
      autoplay: false,
      testimonials: [
        { name: 'Meera J.', text: 'The quality of fabric is unmatched. My boutique orders keep getting bigger!', rating: 5 },
        { name: 'Arjun V.', text: 'Genuine GST invoice and lightning-fast dispatch. Highly recommended.', rating: 5 },
        { name: 'Sunita R.', text: 'Easy returns and real customer support. Shopping here feels safe.', rating: 5 },
        { name: 'Farhan K.', text: 'Great festive collection — received everything well packed in 2 days.', rating: 4 },
      ],
    },
    tags: ['wall', 'reviews', 'love', 'praise'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.TESTIMONIALS,
    name: 'Customer Testimonials',
    variant: 'press',
    variantLabel: 'Press & Reviews',
    configOverrides: { title: 'In the Press & From Our Customers' },
    tags: ['press', 'media', 'featured'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.TRUST,
    name: 'Trust Badges',
    variant: 'row',
    variantLabel: 'Compact Badges',
    configOverrides: {
      badges: [
        { icon: 'ShieldCheck', title: 'Secure Payments', description: 'Encrypted checkout' },
        { icon: 'FileText', title: 'GST Invoices', description: 'Tax compliant' },
        { icon: 'Truck', title: 'Express Delivery', description: 'Rush dispatch' },
        { icon: 'Headphones', title: 'Real Support', description: 'Humans, not bots' },
      ],
    },
    tags: ['badges', 'compact', 'security'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.TRUST,
    name: 'Trust Badges',
    variant: 'guarantees',
    variantLabel: 'Shipping & Returns Promise',
    configOverrides: {
      badges: [
        { icon: 'PackageCheck', title: 'Genuine Products', description: 'Straight from the store inventory' },
        { icon: 'RotateCcw', title: '7-Day Returns', description: 'Hassle-free exchanges' },
        { icon: 'Truck', title: 'Free Delivery', description: 'On orders above ₹999' },
        { icon: 'BadgeCheck', title: 'COD & Khata', description: 'Flexible payment options' },
      ],
    },
    tags: ['guarantee', 'returns', 'shipping', 'promise'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.BRAND_STORY,
    name: 'Brand Story',
    variant: 'mission',
    variantLabel: 'Mission & Values',
    configOverrides: {
      title: 'Our Mission',
      story: 'To bring honest, high-quality products from local makers to every doorstep, without middlemen.',
      milestones: [
        { year: '2012', event: 'Founded as a single neighbourhood store' },
        { year: '2019', event: 'Direct sourcing from 200+ local artisans' },
        { year: '2026', event: 'Pan-India online storefront' },
      ],
    },
    tags: ['mission', 'values', 'purpose'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.BRAND_STORY,
    name: 'Brand Story',
    variant: 'timeline',
    variantLabel: 'Legacy Timeline',
    configOverrides: {
      title: 'Three Generations of Trust',
      story: 'Passed down through the family, the store has stayed true to its promise of authenticity.',
      milestones: [
        { year: '1985', event: 'Grandfather opens the original stall' },
        { year: '2001', event: 'Second generation expands the catalogue' },
        { year: '2026', event: 'Heritage brand goes digital' },
      ],
    },
    tags: ['legacy', 'timeline', 'generations'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.NEWSLETTER,
    name: 'Newsletter Signup',
    variant: 'center',
    variantLabel: 'Centered Offer',
    configOverrides: {
      title: 'Get 10% Off Your First Order',
      subtitle: 'Join for secret discounts, early drop access and seasonal updates.',
      buttonText: 'Claim My Offer',
    },
    tags: ['offer', 'discount', 'capture', 'subscribe'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.NEWSLETTER,
    name: 'Newsletter Signup',
    variant: 'split',
    variantLabel: 'VIP Early Access',
    configOverrides: {
      title: 'Join the VIP Circle',
      subtitle: 'Be first to know about flash sales and limited-edition drops.',
      buttonText: 'Subscribe Now',
    },
    tags: ['vip', 'early', 'access', 'exclusive'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.SIZE_GUIDE,
    name: 'Size Guide Table',
    variant: 'clothing',
    variantLabel: 'Apparel Fit',
    configOverrides: {
      title: 'Apparel Size Guide',
      subtitle: 'Measure carefully — find your perfect fit',
      columns: ['Size', 'Chest', 'Length', 'Waist'],
      rows: [
        { label: 'S', values: ['38"', '28"', '30"'] },
        { label: 'M', values: ['40"', '29"', '32"'] },
        { label: 'L', values: ['42"', '30"', '34"'] },
        { label: 'XL', values: ['44"', '31"', '36"'] },
        { label: 'XXL', values: ['46"', '32"', '38"'] },
      ],
    },
    tags: ['apparel', 'clothing', 'fit', 'chest'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.SIZE_GUIDE,
    name: 'Size Guide Table',
    variant: 'shoes',
    variantLabel: 'Footwear Sizing',
    configOverrides: {
      title: 'Footwear Size Guide',
      subtitle: 'Find your UK/EU/US match and insole length',
      columns: ['UK', 'EU', 'US', 'Insole'],
      rows: [
        { label: '6', values: ['39', '7', '25 cm'] },
        { label: '7', values: ['40', '8', '26 cm'] },
        { label: '8', values: ['41', '9', '27 cm'] },
        { label: '9', values: ['42', '10', '28 cm'] },
      ],
    },
    tags: ['footwear', 'shoes', 'sneakers'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.BANNER,
    name: 'Banner Offer',
    variant: 'festive',
    variantLabel: 'Festive Sale',
    configOverrides: {
      heading: 'Festival Mega Sale',
      description: 'Up to 60% off across sarees, kurta sets and festive essentials.',
      bgColor: '#7c2d12',
      textColor: '#fed7aa',
      ctaText: 'Shop Festive Deals',
      layout: 'center',
    },
    tags: ['festive', 'sale', 'offer'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.PROMO_SPLIT,
    name: 'Promo Split',
    variant: 'seasonal',
    variantLabel: 'Seasonal Duo',
    configOverrides: {
      leftHeading: 'Summer Edit',
      leftSub: 'Light cottons & linens from ₹499',
      leftCta: 'Shop Summer',
      rightHeading: 'Monsoon Pickups',
      rightSub: 'Water-repellent essentials on sale',
      rightCta: 'Shop Rain Ready',
    },
    tags: ['seasonal', 'summer', 'monsoon'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.BRAND_LOGOS,
    name: 'Brand Logos',
    variant: 'marquee',
    variantLabel: 'Scrolling Logos',
    configOverrides: {
      title: 'Trusted By Leading Labels',
      logos: ['FSSAI Certified', 'ISO 9001', 'Make in India', '100% Organic', 'GST Compliant', 'Store Verified'],
    },
    tags: ['marquee', 'press', 'certifications'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.REVIEWS_SUMMARY,
    name: 'Reviews Summary',
    variant: 'verified',
    variantLabel: 'Verified Reviews',
    configOverrides: {
      rating: '4.8',
      reviewCount: '8,200+',
      headline: 'Rated 4.8 by Verified Buyers',
      stats: [
        { number: '8,200+', label: 'Verified Reviews' },
        { number: '96%', label: 'Would Recommend' },
        { number: '4.8 ★', label: 'Average Rating' },
      ],
    },
    tags: ['verified', 'rating', 'trust'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.LOOKBOOK,
    name: 'Lookbook Gallery',
    variant: 'editorial',
    variantLabel: 'Editorial Looks',
    configOverrides: {
      title: 'The Heritage Edit',
      subtitle: 'Styled looks from our latest collection',
      columns: 3,
      looks: [
        { title: 'Banarasi Nights', image: '', tag: 'Festive' },
        { title: 'Chanderi Days', image: '', tag: 'Office' },
        { title: 'Cotton Sabbath', image: '', tag: 'Casual' },
        { title: 'Muslin Minimal', image: '', tag: 'Everyday' },
        { title: 'Katan Royals', image: '', tag: 'Wedding' },
        { title: 'Linen Stories', image: '', tag: 'Summer' },
      ],
    },
    tags: ['editorial', 'looks', 'outfits', 'styled'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.LOOKBOOK,
    name: 'Lookbook Gallery',
    variant: 'rooms',
    variantLabel: 'Room Inspiration',
    configOverrides: {
      title: 'Room Inspiration',
      subtitle: 'Curated setups for every corner of your home',
      columns: 3,
      looks: [
        { title: 'Cozy Living', image: '', tag: 'Living Room' },
        { title: 'Serene Bedroom', image: '', tag: 'Bedroom' },
        { title: 'Efficient Study', image: '', tag: 'Study' },
        { title: 'Polished Kitchen', image: '', tag: 'Kitchen' },
      ],
    },
    tags: ['rooms', 'interiors', 'home', 'decor'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.DELIVERY_INFO,
    name: 'Delivery Info',
    variant: 'returns',
    variantLabel: 'Returns & Exchange',
    configOverrides: {
      title: 'Returns & Exchange Promise',
      items: [
        { title: '7-Day Returns', desc: 'Initiate a return from your orders page' },
        { title: 'Instant Refunds', desc: 'Refund processed within 48 hours' },
        { title: 'Free Pickup', desc: 'Doorstep pickup for defective items' },
      ],
    },
    tags: ['returns', 'exchange', 'refund', 'policy'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.DELIVERY_INFO,
    name: 'Delivery Info',
    variant: 'payment',
    variantLabel: 'Payments Accepted',
    configOverrides: {
      title: 'Flexible Payments',
      items: [
        { title: 'Cash on Delivery', desc: 'Pay when your order arrives' },
        { title: 'UPI & Cards', desc: 'Instant and secure online payments' },
        { title: 'Khata Credit', desc: 'Settle in-store on your monthly khata' },
      ],
    },
    tags: ['payment', 'cod', 'upi', 'khata', 'credit'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.SHOP_BY_ROOM,
    name: 'Shop by Room',
    variant: 'cozy',
    variantLabel: 'Cozy Homes',
    configOverrides: {
      title: 'Designed for Living',
      subtitle: 'Warm, comfortable setups for everyday Indian homes',
      rooms: [
        { name: 'Living Room', items: ['Sofas', 'Rugs', 'Coffee Tables', 'Lighting'] },
        { name: 'Bedroom', items: ['Beds', 'Bedsheets', 'Wardrobes', 'Nightstands'] },
        { name: 'Dining', items: ['Dining Sets', 'Table Linen', 'Serveware', 'Stools'] },
        { name: 'Balcony', items: ['Seating', 'Planters', 'Outdoor Cushions', 'Lanterns'] },
      ],
    },
    tags: ['cozy', 'home', 'interiors'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.INGREDIENT_HIGHLIGHTS,
    name: 'Ingredient Highlights',
    variant: 'cards',
    variantLabel: 'Ingredient Cards',
    configOverrides: {
      title: 'Clean-Label Promise',
      subtitle: 'Every ingredient earns its place — nothing synthetic',
      ingredients: [
        { name: 'Ayurvedic Herbs', benefit: 'Sourced from certified organic farms', tag: 'Organic' },
        { name: 'Cold-Pressed Oils', benefit: 'Pressure-extracted, never heat-treated', tag: '100% Pure' },
        { name: 'Traditional Grains', benefit: 'Stone-milled and minimally processed', tag: 'House Special' },
      ],
    },
    tags: ['ingredients', 'clean-label', 'organic'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.HERO_MINIMAL,
    name: 'Minimal Hero',
    variant: 'brand',
    variantLabel: 'Brand Statement',
    configOverrides: {
      title: 'Honest Products, Fair Prices',
      subtitle: 'Sourced directly from local makers across India.',
    },
    tags: ['brand', 'statement', 'minimal'],
  }),
  entryFromDraft({
    sectionType: SECTION_TYPES.FEATURED_PRODUCTS,
    name: 'Featured Products',
    variant: 'bestsellers',
    variantLabel: 'Bestsellers Edit',
    configOverrides: { title: 'Our Bestselling Picks' },
    tags: ['bestsellers', 'popular', 'trending'],
  }),
];

const REGISTRY_BY_ID = new Map(COMPONENT_PREVIEW_REGISTRY.map((entry) => [entry.id, entry]));

export function getComponentPreviewEntry(id: string): ComponentPreviewEntry | undefined {
  return REGISTRY_BY_ID.get(id);
}

export function getRecommendedEntriesForIndustry(industry: string, limit = 3): ComponentPreviewEntry[] {
  if (!ALL_INDUSTRIES.includes(industry as TemplateCategory)) return [];
  return COMPONENT_PREVIEW_REGISTRY.filter((entry) => entry.industries.includes(industry as TemplateCategory)).slice(0, limit);
}

export interface PreviewSearchOptions {
  query?: string;
  category?: ComponentCategory | 'all';
  industry?: TemplateCategory | 'all';
  pageType?: PageType | 'all';
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[-_.]+/g, ' ');
}

const SEARCH_STOPWORDS = new Set([
  'us', 'the', 'a', 'an', 'page', 'section', 'info', 'information',
  'for', 'our', 'your', 'and', 'with', 'on', 'of', 'to', 'or',
]);

function significantTokens(value: string): string[] {
  return value.split(/\s+/).filter((t) => t && !SEARCH_STOPWORDS.has(t));
}

function searchHaystack(entry: ComponentPreviewEntry): string {
  return [
    entry.name,
    entry.variantLabel || '',
    entry.sectionType,
    entry.icon,
    ...entry.pageTypes,
    ...entry.tags,
  ]
    .join(' ')
    .toLowerCase()
    .replace(/[-_.]+/g, ' ');
}

export function searchComponentPreviews(options: PreviewSearchOptions = {}): ComponentPreviewEntry[] {
  const { query = '', category = 'all', industry = 'all', pageType = 'all' } = options;
  const q = normalize(query.trim());
  const tokens = significantTokens(q);
  const phrase = q.replace(/\s+/g, ' ');

  const scored: Array<{ entry: ComponentPreviewEntry; score: number }> = [];
  for (const entry of COMPONENT_PREVIEW_REGISTRY) {
    if (category !== 'all' && entry.category !== category) continue;
    if (industry !== 'all' && !entry.industries.includes(industry)) continue;
    if (pageType !== 'all' && !entry.pageTypes.includes(pageType)) continue;
    if (!q) {
      scored.push({ entry, score: 0 });
      continue;
    }

    const haystack = searchHaystack(entry);
    if (!tokens.length) {
      if (haystack.includes(phrase)) scored.push({ entry, score: 1 });
      continue;
    }

    const everyToken = tokens.every((token) => haystack.includes(token));
    const name = normalize(entry.name);
    const nameTokens = significantTokens(name);

    let score = 0;
    if (everyToken) {
      score += 1;
      if (tokens.every((token) => name.includes(token))) score += 4;
      if (nameTokens.length > 0 && nameTokens.every((t) => tokens.includes(t))) score += 2;
    }
    if (name.includes(phrase)) score += 3;
    if (normalize(entry.variantLabel || '').includes(phrase)) score += 1;
    if (score > 0) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.name.localeCompare(b.entry.name);
    })
    .map((s) => s.entry);
}