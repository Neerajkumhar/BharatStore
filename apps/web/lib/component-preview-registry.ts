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
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[-_.]+/g, ' ');
}

export function searchComponentPreviews(options: PreviewSearchOptions = {}): ComponentPreviewEntry[] {
  const { query = '', category = 'all', industry = 'all' } = options;
  const q = normalize(query.trim());

  return COMPONENT_PREVIEW_REGISTRY.filter((entry) => {
    if (category !== 'all' && entry.category !== category) return false;
    if (industry !== 'all' && !entry.industries.includes(industry)) return false;
    if (!q) return true;

    const haystack = [
      entry.name,
      entry.variantLabel || '',
      entry.sectionType,
      entry.icon,
      ...entry.tags,
    ]
      .join(' ')
      .toLowerCase()
      .replace(/[-_.]+/g, ' ');

    return q.split(/\s+/).every((token) => haystack.includes(token));
  });
}