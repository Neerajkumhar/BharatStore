import { z } from 'zod';
import { SECTION_TYPES, VALID_SECTION_TYPES } from '../constants/component-registry';
import { CARD_VARIANT_VALUES, DEFAULT_CARD_VARIANT } from '../constants/variant-registry';

const imageUrlSchema = z.string().max(2048).refine(
  (val) => !val || val === '' || val.startsWith('/') || val.startsWith('#') || /^https?:\/\/.+/.test(val) || /^data:image\/.+/.test(val),
  { message: 'Must be a valid URL or path' }
).optional().nullable();

const animationSchema = z.enum(['none', 'fade', 'fade-up', 'slide-up', 'scale']).default('none');
const cardVariantSchema = z.enum(CARD_VARIANT_VALUES).default(DEFAULT_CARD_VARIANT);

// Navigation Schemas
export const announcementConfigSchema = z.object({
  text: z.string().max(200).default('Welcome to our store!'),
  link: imageUrlSchema,
  visible: z.boolean().default(true),
  bgColor: z.string().max(20).default('#0f172a'),
  textColor: z.string().max(20).default('#fbbf24'),
  marquee: z.boolean().default(false),
  dismissible: z.boolean().default(true),
  animation: animationSchema,
});

export const stickyHeaderConfigSchema = z.object({
  transparent: z.boolean().default(false),
  showSearch: z.boolean().default(true),
  showCart: z.boolean().default(true),
  showAccount: z.boolean().default(true),
  navLinks: z.array(z.object({
    label: z.string().max(50),
    url: z.string().max(200),
  })).default([]),
  style: z.enum(['classic', 'minimal', 'centered', 'split', 'searchbar', 'bordered']).default('classic'),
  animation: animationSchema,
});

export const megaMenuConfigSchema = z.object({
  title: z.string().max(100).default('Explore Categories'),
  groups: z.array(z.object({
    title: z.string().max(100),
    items: z.array(z.string().max(100)),
  })).default([]),
  promoTitle: z.string().max(100).optional().nullable(),
  promoSubtitle: z.string().max(200).optional().nullable(),
  promoImage: imageUrlSchema,
  layout: z.enum(['classic', 'bricks', 'masonry', 'tabs']).default('classic'),
  animation: animationSchema,
});

export const mobileNavConfigSchema = z.object({
  showCategories: z.boolean().default(true),
  showSocial: z.boolean().default(true),
  showContact: z.boolean().default(true),
  ctaText: z.string().max(50).default('Shop Catalog'),
  animation: animationSchema,
});

export const searchOverlayConfigSchema = z.object({
  placeholder: z.string().max(100).default('Search products...'),
  popularSearches: z.array(z.string().max(50)).default([]),
  showCategories: z.boolean().default(true),
  animation: animationSchema,
});

// Hero Schemas
export const heroConfigSchema = z.object({
  title: z.string().max(200).default('Welcome to Our Store'),
  subtitle: z.string().max(500).default('Quality products delivered to your doorstep'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Shop Now'),
  ctaLink: z.string().max(200).default('/products'),
  secondaryCtaText: z.string().max(50).optional().nullable(),
  secondaryCtaLink: z.string().max(200).optional().nullable(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  height: z.enum(['small', 'medium', 'large']).default('medium'),
  overlayOpacity: z.number().min(0).max(100).default(40),
  layout: z.enum(['collection', 'campaign', 'layered']).default('collection'),
  animation: animationSchema,
});

export const heroFullscreenConfigSchema = z.object({
  title: z.string().max(200).default('Crafted to Inspire.'),
  subtitle: z.string().max(500).default('Explore our latest luxury release'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Discover Collection'),
  ctaLink: z.string().max(200).default('/products'),
  overlayOpacity: z.number().min(0).max(100).default(50),
  animation: animationSchema,
});

export const heroSplitConfigSchema = z.object({
  badge: z.string().max(50).optional().nullable(),
  title: z.string().max(200).default('Modern Design for Daily Life'),
  subtitle: z.string().max(500).default('Thoughtful materials, clean lines and long-lasting durability.'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Explore Now'),
  ctaLink: z.string().max(200).default('/products'),
  layout: z.enum(['left-image', 'right-image']).default('left-image'),
  animation: animationSchema,
});

export const heroEditorialConfigSchema = z.object({
  seasonTag: z.string().max(50).default('Autumn / Winter 2026'),
  headline: z.string().max(200).default('The Heritage Edit'),
  subheadline: z.string().max(500).default('Handwoven textiles & modern Indian craftsmanship'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('View Lookbook'),
  ctaLink: z.string().max(200).default('/products'),
  accentText: z.string().max(100).optional().nullable(),
  animation: animationSchema,
});

export const heroProductConfigSchema = z.object({
  badge: z.string().max(50).default('Flagship Launch'),
  title: z.string().max(200).default('Pro Wireless Headphones'),
  subtitle: z.string().max(500).default('Active Noise Cancellation • 40-Hour Battery'),
  price: z.string().max(20).default('4999'),
  comparePrice: z.string().max(20).optional().nullable(),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Buy Now'),
  ctaLink: z.string().max(200).default('/products'),
  animation: animationSchema,
});

export const heroMinimalConfigSchema = z.object({
  title: z.string().max(200).default('Clean. Essential. Honest.'),
  subtitle: z.string().max(500).default('Pure organic produce delivered fresh every morning.'),
  ctaText: z.string().max(50).default('Shop Essentials'),
  ctaLink: z.string().max(200).default('/products'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  animation: animationSchema,
});

// Category Schemas
export const categoriesConfigSchema = z.object({
  title: z.string().max(200).default('Shop by Category'),
  subtitle: z.string().max(500).default('Browse our curated collections'),
  layout: z.enum(['grid', 'carousel', 'stacked', 'bento']).default('grid'),
  columns: z.number().min(2).max(6).default(6),
  showProductCount: z.boolean().default(true),
  limit: z.number().min(1).max(20).default(6),
  animation: animationSchema,
});

export const categoryCircularConfigSchema = z.object({
  title: z.string().max(200).default('Explore Departments'),
  limit: z.number().min(1).max(12).default(8),
  showLabels: z.boolean().default(true),
  animation: animationSchema,
});

export const categoryMegaConfigSchema = z.object({
  title: z.string().max(200).default('Shop by Room'),
  subtitle: z.string().max(500).default('Curated designs for every corner'),
  columns: z.number().min(2).max(4).default(3),
  limit: z.number().min(1).max(12).default(6),
  cardStyle: z.enum(['standard', 'editorial']).default('editorial'),
  animation: animationSchema,
});

// Product Schemas
export const featuredProductsConfigSchema = z.object({
  title: z.string().max(200).default('Featured Products'),
  subtitle: z.string().max(500).default('Handpicked just for you'),
  selectionMode: z.enum(['newest', 'featured', 'category', 'manual']).default('newest'),
  categoryId: z.string().optional().nullable(),
  productIds: z.array(z.string()).optional().default([]),
  limit: z.number().min(1).max(20).default(8),
  layout: z.enum(['grid', 'carousel']).default('grid'),
  columns: z.number().min(2).max(4).default(4),
  cardVariant: cardVariantSchema,
  animation: animationSchema,
});

export const productGridConfigSchema = z.object({
  title: z.string().max(200).default('All Products'),
  columns: z.number().min(2).max(4).default(3),
  showFilters: z.boolean().default(true),
  showSort: z.boolean().default(true),
  cardVariant: cardVariantSchema,
  animation: animationSchema,
});

export const productCarouselConfigSchema = z.object({
  title: z.string().max(200).default('Bestseller Rail'),
  subtitle: z.string().max(500).default('Customer favorites this week'),
  limit: z.number().min(1).max(20).default(8),
  autoplay: z.boolean().default(true),
  showArrows: z.boolean().default(true),
  cardVariant: cardVariantSchema,
  layout: z.enum(['row', 'fade', 'ticker']).default('row'),
  animation: animationSchema,
});

export const productRailConfigSchema = z.object({
  title: z.string().max(200).default('New Drops'),
  limit: z.number().min(1).max(20).default(10),
  cardVariant: cardVariantSchema,
  animation: animationSchema,
});

export const productSpotlightConfigSchema = z.object({
  title: z.string().max(200).default('Product of the Month'),
  subtitle: z.string().max(500).default('Pure Cold-Pressed Virgin Coconut Oil'),
  price: z.string().max(20).default('349'),
  mrp: z.string().max(20).optional().nullable(),
  features: z.array(z.string().max(100)).default([]),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Add to Cart'),
  animation: animationSchema,
});

export const productTrendingConfigSchema = z.object({
  title: z.string().max(200).default('Trending Now'),
  subtitle: z.string().max(500).default('What everyone is buying right now'),
  limit: z.number().min(1).max(12).default(6),
  columns: z.number().min(2).max(4).default(3),
  cardVariant: cardVariantSchema,
  animation: animationSchema,
});

export const productTabsConfigSchema = z.object({
  title: z.string().max(200).default('Explore Collections'),
  tabs: z.array(z.string().max(50)).default(['Bestsellers', 'New In', 'On Sale']),
  limit: z.number().min(1).max(16).default(8),
  columns: z.number().min(2).max(4).default(4),
  cardVariant: cardVariantSchema,
  animation: animationSchema,
});

export const productComparisonConfigSchema = z.object({
  title: z.string().max(200).default('Compare Models'),
  features: z.array(z.string().max(100)).default(['Display Size', 'Battery Life', 'Storage', 'Warranty', 'Price']),
  animation: animationSchema,
});

// Marketing Schemas
export const bannerConfigSchema = z.object({
  heading: z.string().max(200).default('Special Offer'),
  description: z.string().max(1000).default('Check out our latest deals'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Shop Now'),
  ctaLink: z.string().max(200).default('/products'),
  bgColor: z.string().max(20).default('#fef3c7'),
  textColor: z.string().max(20).default('#92400e'),
  layout: z.enum(['left', 'center', 'right']).default('left'),
  animation: animationSchema,
});

export const promoSplitConfigSchema = z.object({
  leftHeading: z.string().max(100).default('Women’s Festive Edit'),
  leftSub: z.string().max(200).default('Flat 30% Off Sarees'),
  leftCta: z.string().max(50).default('Shop Women'),
  rightHeading: z.string().max(100).default('Men’s Heritage Kurtas'),
  rightSub: z.string().max(200).default('Starting at ₹799'),
  rightCta: z.string().max(50).default('Shop Men'),
  animation: animationSchema,
});

export const countdownSaleConfigSchema = z.object({
  title: z.string().max(200).default('Festival Flash Sale Ends In:'),
  targetDate: z.string().max(100).default(new Date(Date.now() + 86400000 * 3).toISOString()),
  badge: z.string().max(50).default('Hurry! Limited Time Offer'),
  ctaText: z.string().max(50).default('Grab Deals Now'),
  ctaLink: z.string().max(200).default('/products'),
  bgColor: z.string().max(20).default('#7c2d12'),
  textColor: z.string().max(20).default('#fed7aa'),
  animation: animationSchema,
});

export const flashSaleConfigSchema = z.object({
  title: z.string().max(200).default('Flash Deals — Up to 60% Off'),
  subtitle: z.string().max(500).default('Selling out fast. Stock updated hourly.'),
  limit: z.number().min(1).max(8).default(4),
  cardVariant: cardVariantSchema,
  animation: animationSchema,
});

export const couponStripConfigSchema = z.object({
  title: z.string().max(200).default('Store Discount Coupons'),
  coupons: z.array(z.object({
    code: z.string().max(30),
    discount: z.string().max(50),
    detail: z.string().max(100),
  })).default([]),
  animation: animationSchema,
});

export const freeShippingBarConfigSchema = z.object({
  threshold: z.number().min(0).default(999),
  text: z.string().max(200).default('Add ₹{remaining} more for FREE Pan-India Shipping!'),
  bgColor: z.string().max(20).default('#15803d'),
  textColor: z.string().max(20).default('#ffffff'),
  animation: animationSchema,
});

export const offerMarqueeConfigSchema = z.object({
  items: z.array(z.string().max(200)).default([]),
  speed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  bgColor: z.string().max(20).default('#1e293b'),
  textColor: z.string().max(20).default('#f8fafc'),
  animation: animationSchema,
});

// Editorial Schemas
export const aboutConfigSchema = z.object({
  title: z.string().max(200).default('About Us'),
  description: z.string().max(2000).default('We are a family-owned business dedicated to quality.'),
  imageUrl: imageUrlSchema,
  layout: z.enum(['left', 'right', 'center']).default('left'),
  animation: animationSchema,
});

export const editorialSplitConfigSchema = z.object({
  quote: z.string().max(500).default('Craftsmanship is the bridge between heritage and modern living.'),
  author: z.string().max(100).default('Our Founder'),
  story: z.string().max(1000).default('Every thread and ingredient in our store is chosen with reverence.'),
  imageUrl: imageUrlSchema,
  animation: animationSchema,
});

export const editorialFullwidthConfigSchema = z.object({
  title: z.string().max(200).default('Purity in Every Batch'),
  subtitle: z.string().max(500).default('From local Bharatiya farms straight to your home kitchen.'),
  imageUrl: imageUrlSchema,
  animation: animationSchema,
});

export const lookbookConfigSchema = z.object({
  title: z.string().max(200).default('Season Lookbook'),
  subtitle: z.string().max(500).default('Get inspired by our styled edits'),
  columns: z.number().min(2).max(4).default(3),
  animation: animationSchema,
});

export const asymmetricGalleryConfigSchema = z.object({
  title: z.string().max(200).default('Design Gallery'),
  subtitle: z.string().max(500).default('A glimpse into our artisanal process'),
  animation: animationSchema,
});

export const brandStoryConfigSchema = z.object({
  title: z.string().max(200).default('Our Journey Since 2012'),
  story: z.string().max(2000).default('Started as a small local shop, BharatStore has grown.'),
  milestones: z.array(z.object({
    year: z.string().max(20),
    event: z.string().max(200),
  })).default([]),
  animation: animationSchema,
});

export const routineBuilderConfigSchema = z.object({
  title: z.string().max(200).default('3-Step Daily Glow Routine'),
  steps: z.array(z.object({
    step: z.string().max(10),
    title: z.string().max(100),
    desc: z.string().max(200),
  })).default([]),
  animation: animationSchema,
});

// Industry Solution Schemas
export const sizeGuideConfigSchema = z.object({
  title: z.string().max(200).default('Size Guide'),
  subtitle: z.string().max(500).optional().nullable(),
  columns: z.array(z.string().max(50)).default(['Size', 'Chest', 'Length']),
  rows: z.array(z.object({
    label: z.string().max(50),
    values: z.array(z.string().max(50)),
  })).default([]),
  animation: animationSchema,
});

export const shopByConcernConfigSchema = z.object({
  title: z.string().max(200).default('Shop by Concern'),
  subtitle: z.string().max(500).optional().nullable(),
  concerns: z.array(z.string().max(100)).default([]),
  animation: animationSchema,
});

export const shopByRoomConfigSchema = z.object({
  title: z.string().max(200).default('Shop by Room'),
  subtitle: z.string().max(500).optional().nullable(),
  rooms: z.array(z.object({
    name: z.string().max(100),
    items: z.array(z.string().max(100)),
  })).default([]),
  animation: animationSchema,
});

export const ingredientHighlightsConfigSchema = z.object({
  title: z.string().max(200).default('Key Ingredients'),
  subtitle: z.string().max(500).optional().nullable(),
  ingredients: z.array(z.object({
    name: z.string().max(100),
    benefit: z.string().max(300),
    tag: z.string().max(50).optional().nullable(),
  })).default([]),
  animation: animationSchema,
});

// Trust & Social Proof Schemas
const trustBadgeSchema = z.object({
  icon: z.string().max(50),
  title: z.string().max(100),
  description: z.string().max(200),
});

export const trustConfigSchema = z.object({
  badges: z.array(trustBadgeSchema).min(1).max(6).default([
    { icon: 'ShieldCheck', title: 'Secure Payments', description: '100% secure checkout' },
    { icon: 'FileText', title: 'GST Invoice', description: 'Tax compliance guaranteed' },
    { icon: 'Truck', title: 'Fast Delivery', description: 'Quick dispatch & tracking' },
    { icon: 'Headphones', title: '24/7 Support', description: 'We are here to help' },
  ]),
  animation: animationSchema,
});

const testimonialSchema = z.object({
  name: z.string().max(100),
  text: z.string().max(1000),
  rating: z.number().min(1).max(5),
});

export const testimonialsConfigSchema = z.object({
  title: z.string().max(200).default('What Our Customers Say'),
  testimonials: z.array(testimonialSchema).min(1).max(10).default([
    { name: 'Priya S.', text: 'Amazing quality products!', rating: 5 },
  ]),
  autoplay: z.boolean().default(true),
  animation: animationSchema,
});

export const reviewsSummaryConfigSchema = z.object({
  rating: z.string().max(10).default('4.9'),
  reviewCount: z.string().max(20).default('12,450+'),
  headline: z.string().max(200).default('Loved by Thousands Across India'),
  stats: z.array(z.object({
    number: z.string().max(30),
    label: z.string().max(100),
  })).default([]),
  animation: animationSchema,
});

export const brandLogosConfigSchema = z.object({
  title: z.string().max(200).default('Featured In & Trusted By'),
  logos: z.array(z.string().max(100)).default([]),
  animation: animationSchema,
});

const faqItemSchema = z.object({
  question: z.string().max(300),
  answer: z.string().max(1000),
});

export const faqConfigSchema = z.object({
  title: z.string().max(200).default('Frequently Asked Questions'),
  items: z.array(faqItemSchema).min(1).max(20).default([
    { question: 'What payment methods do you accept?', answer: 'We accept Cash, UPI, and Khata credit.' },
  ]),
  animation: animationSchema,
});

// Utility & Footer Schemas
export const contactConfigSchema = z.object({
  title: z.string().max(200).default('Get in Touch'),
  showPhone: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showAddress: z.boolean().default(true),
  showHours: z.boolean().default(true),
  animation: animationSchema,
});

export const deliveryInfoConfigSchema = z.object({
  title: z.string().max(200).default('Shipping & Delivery Promise'),
  items: z.array(z.object({
    title: z.string().max(100),
    desc: z.string().max(200),
  })).default([]),
  animation: animationSchema,
});

export const newsletterConfigSchema = z.object({
  title: z.string().max(200).default('Join Our VIP Circle'),
  subtitle: z.string().max(500).default('Subscribe for secret discounts and updates.'),
  buttonText: z.string().max(50).default('Subscribe'),
  placeholder: z.string().max(100).default('Enter your email or phone number...'),
  animation: animationSchema,
});

const valuePropSchema = z.object({
  icon: z.string().max(50),
  title: z.string().max(100),
  description: z.string().max(200),
});

export const footerConfigSchema = z.object({
  showValueProps: z.boolean().default(true),
  showSocialLinks: z.boolean().default(true),
  showCopyright: z.boolean().default(true),
  valueProps: z.array(valuePropSchema).max(6).default([]),
  animation: animationSchema,
});

// Section schema
export const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(VALID_SECTION_TYPES as [string, ...string[]]),
  config: z.record(z.unknown()),
  visible: z.boolean().default(true),
  order: z.number().int().min(0),
});

// Theme configuration
export const themeConfigSchema = z.object({
  primaryColor: z.string().max(20).default('#0f172a'),
  accentColor: z.string().max(20).default('#d97706'),
  backgroundColor: z.string().max(20).default('#f8fafc'),
  textColor: z.string().max(20).default('#0f172a'),
  fontFamily: z.enum(['inter', 'plus-jakarta', 'poppins', 'nunito', 'system']).default('inter'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
  buttonStyle: z.enum(['rounded', 'pill', 'square']).default('rounded'),
  cardStyle: z.enum(['flat', 'shadow', 'bordered']).default('bordered'),
});

// SEO configuration
export const seoConfigSchema = z.object({
  pageTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  ogImage: imageUrlSchema,
});

// Full page configuration
export const pageConfigSchema = z.object({
  sections: z.array(sectionSchema).default([]),
  theme: themeConfigSchema.default({}),
  seo: seoConfigSchema.default({}),
  templateId: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

// Builder update schema
export const builderUpdateSchema = z.object({
  config: pageConfigSchema,
  templateId: z.string().optional().nullable(),
});

// Template selection schema
export const templateSelectSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  confirmReplace: z.boolean().default(false),
});

// Theme Gallery template metadata
export const templateCategorySchema = z.enum(['general', 'fashion', 'electronics', 'grocery', 'beauty', 'food', 'home']);
export const templateStyleSchema = z.enum(['minimal', 'modern', 'editorial', 'classic', 'playful']);
export const templateLayoutSchema = z.enum(['centered', 'left-aligned', 'full', 'compact']);

export const templateMetadataSchema = z.object({
  id: z.string().min(1).max(60),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  category: templateCategorySchema,
  style: templateStyleSchema,
  layout: templateLayoutSchema,
  tags: z.array(z.string().min(1).max(30)).max(12).default([]),
  featured: z.boolean().optional().nullable(),
  popular: z.boolean().optional().nullable(),
  isNew: z.boolean().optional().nullable(),
});

// Apply-theme request
export const applyThemeRequestSchema = z.object({
  templateId: z.string().trim().min(1, 'Template ID is required'),
});

// Section config validator by type
export function validateSectionConfig(type: string, config: Record<string, unknown>) {
  const schemas: Record<string, z.ZodType> = {
    [SECTION_TYPES.ANNOUNCEMENT]: announcementConfigSchema,
    [SECTION_TYPES.STICKY_HEADER]: stickyHeaderConfigSchema,
    [SECTION_TYPES.MEGA_MENU]: megaMenuConfigSchema,
    [SECTION_TYPES.MOBILE_NAV]: mobileNavConfigSchema,
    [SECTION_TYPES.SEARCH_OVERLAY]: searchOverlayConfigSchema,

    [SECTION_TYPES.HERO]: heroConfigSchema,
    [SECTION_TYPES.HERO_FULLSCREEN]: heroFullscreenConfigSchema,
    [SECTION_TYPES.HERO_SPLIT]: heroSplitConfigSchema,
    [SECTION_TYPES.HERO_EDITORIAL]: heroEditorialConfigSchema,
    [SECTION_TYPES.HERO_PRODUCT]: heroProductConfigSchema,
    [SECTION_TYPES.HERO_MINIMAL]: heroMinimalConfigSchema,

    [SECTION_TYPES.CATEGORIES]: categoriesConfigSchema,
    [SECTION_TYPES.CATEGORY_CIRCULAR]: categoryCircularConfigSchema,
    [SECTION_TYPES.CATEGORY_MEGA]: categoryMegaConfigSchema,

    [SECTION_TYPES.FEATURED_PRODUCTS]: featuredProductsConfigSchema,
    [SECTION_TYPES.PRODUCT_GRID]: productGridConfigSchema,
    [SECTION_TYPES.PRODUCT_CAROUSEL]: productCarouselConfigSchema,
    [SECTION_TYPES.PRODUCT_RAIL]: productRailConfigSchema,
    [SECTION_TYPES.PRODUCT_SPOTLIGHT]: productSpotlightConfigSchema,
    [SECTION_TYPES.PRODUCT_TRENDING]: productTrendingConfigSchema,
    [SECTION_TYPES.PRODUCT_TABS]: productTabsConfigSchema,
    [SECTION_TYPES.PRODUCT_COMPARISON]: productComparisonConfigSchema,

    [SECTION_TYPES.BANNER]: bannerConfigSchema,
    [SECTION_TYPES.PROMO_SPLIT]: promoSplitConfigSchema,
    [SECTION_TYPES.COUNTDOWN_SALE]: countdownSaleConfigSchema,
    [SECTION_TYPES.FLASH_SALE]: flashSaleConfigSchema,
    [SECTION_TYPES.COUPON_STRIP]: couponStripConfigSchema,
    [SECTION_TYPES.FREE_SHIPPING_BAR]: freeShippingBarConfigSchema,
    [SECTION_TYPES.OFFER_MARQUEE]: offerMarqueeConfigSchema,

    [SECTION_TYPES.ABOUT]: aboutConfigSchema,
    [SECTION_TYPES.EDITORIAL_SPLIT]: editorialSplitConfigSchema,
    [SECTION_TYPES.EDITORIAL_FULLWIDTH]: editorialFullwidthConfigSchema,
    [SECTION_TYPES.LOOKBOOK]: lookbookConfigSchema,
    [SECTION_TYPES.ASYMMETRIC_GALLERY]: asymmetricGalleryConfigSchema,
    [SECTION_TYPES.BRAND_STORY]: brandStoryConfigSchema,
    [SECTION_TYPES.ROUTINE_BUILDER]: routineBuilderConfigSchema,

    [SECTION_TYPES.SIZE_GUIDE]: sizeGuideConfigSchema,
    [SECTION_TYPES.SHOP_BY_CONCERN]: shopByConcernConfigSchema,
    [SECTION_TYPES.SHOP_BY_ROOM]: shopByRoomConfigSchema,
    [SECTION_TYPES.INGREDIENT_HIGHLIGHTS]: ingredientHighlightsConfigSchema,

    [SECTION_TYPES.TRUST]: trustConfigSchema,
    [SECTION_TYPES.TESTIMONIALS]: testimonialsConfigSchema,
    [SECTION_TYPES.REVIEWS_SUMMARY]: reviewsSummaryConfigSchema,
    [SECTION_TYPES.BRAND_LOGOS]: brandLogosConfigSchema,
    [SECTION_TYPES.FAQ]: faqConfigSchema,

    [SECTION_TYPES.CONTACT]: contactConfigSchema,
    [SECTION_TYPES.DELIVERY_INFO]: deliveryInfoConfigSchema,
    [SECTION_TYPES.NEWSLETTER]: newsletterConfigSchema,
    [SECTION_TYPES.FOOTER]: footerConfigSchema,
  };
  const schema = schemas[type];
  if (!schema) {
    // Return safe default parse if type is valid section but not specifically mapped
    return z.record(z.unknown()).safeParse(config);
  }
  return schema.safeParse(config);
}
