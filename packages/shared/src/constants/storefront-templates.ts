import { SECTION_TYPES, type SectionType, createDefaultSection } from './component-registry';

export type TemplateCategory = 'general' | 'fashion' | 'electronics' | 'grocery' | 'beauty' | 'food' | 'home';
export type TemplateStyle = 'minimal' | 'modern' | 'editorial' | 'classic' | 'playful';
export type TemplateLayout = 'centered' | 'left-aligned' | 'full' | 'compact';

export interface StorefrontTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  style: TemplateStyle;
  layout: TemplateLayout;
  tags: string[];
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  preview: {
    bgColor: string;
    accentColor: string;
    sections: SectionType[];
  };
  defaultTheme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
    buttonStyle: string;
    cardStyle: string;
  };
  defaultSections: Array<{
    type: SectionType;
    configOverrides: Record<string, unknown>;
  }>;
}

export const STOREFRONT_GALLERY_CATEGORIES: Array<{ id: TemplateCategory; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'food', label: 'Food' },
  { id: 'home', label: 'Home' },
];

export const STOREFRONT_TEMPLATE_STYLES: Array<{ id: TemplateStyle; label: string }> = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'classic', label: 'Classic' },
  { id: 'playful', label: 'Playful' },
];

function makeSections(defs: Array<{ type: SectionType; configOverrides?: Record<string, unknown> }>) {
  return defs.map((d, i) => {
    const section = createDefaultSection(d.type);
    section.order = i;
    if (d.configOverrides) {
      section.config = { ...section.config, ...d.configOverrides };
    }
    return section;
  });
}

export const STOREFRONT_TEMPLATES: StorefrontTemplate[] = [
  // 1. FASHION EDITORIAL
  {
    id: 'fashion',
    name: 'Fashion Editorial',
    description: 'High-impact editorial composition for apparel, couture, and heritage fashion',
    category: 'fashion',
    style: 'editorial',
    layout: 'centered',
    tags: ['clothing', 'sarees', 'apparel', 'couture', 'fashion', 'editorial'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#fefce8',
      accentColor: '#a16207',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_EDITORIAL, SECTION_TYPES.CATEGORIES, SECTION_TYPES.LOOKBOOK, SECTION_TYPES.PRODUCT_TRENDING, SECTION_TYPES.PROMO_SPLIT, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.NEWSLETTER, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#1c1917',
      accentColor: '#a16207',
      backgroundColor: '#fefce8',
      textColor: '#1c1917',
      fontFamily: 'plus-jakarta',
      borderRadius: 'lg',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Free shipping on orders above ₹999!', dismissible: true } },
      { type: SECTION_TYPES.HERO_EDITORIAL, configOverrides: { headline: 'The Heritage Edit', subheadline: 'Ethnic heritage meets contemporary tailoring', ctaText: 'Shop New Arrivals', animation: 'fade-up' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Collection', layout: 'carousel', columns: 4 } },
      { type: SECTION_TYPES.LOOKBOOK, configOverrides: { title: 'Seasonal Style Lookbook', animation: 'fade-up' } },
      { type: SECTION_TYPES.PRODUCT_TRENDING, configOverrides: { title: 'Trending Product Rail', cardVariant: 'editorial', limit: 6 } },
      { type: SECTION_TYPES.PROMO_SPLIT, configOverrides: { leftHeading: 'Women’s Festive Edit', rightHeading: 'Men’s Heritage Collection' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Featured Collection', cardVariant: 'classic', limit: 8 } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Style Inspo from Our Customers', autoplay: true } },
      { type: SECTION_TYPES.NEWSLETTER, configOverrides: { title: 'Join the Couture Circle' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 2. STREETWEAR
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Bold, youth-driven layout built around limited drops and hype releases',
    category: 'fashion',
    style: 'playful',
    layout: 'left-aligned',
    tags: ['street', 'urban', 'youth', 'graphic', 'drop', 'streetwear'],
    isNew: true,
    preview: {
      bgColor: '#fafafa',
      accentColor: '#84cc16',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_FULLSCREEN, SECTION_TYPES.PRODUCT_RAIL, SECTION_TYPES.LOOKBOOK, SECTION_TYPES.COUNTDOWN_SALE, SECTION_TYPES.PRODUCT_TRENDING, SECTION_TYPES.EDITORIAL_FULLWIDTH, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#09090b',
      accentColor: '#84cc16',
      backgroundColor: '#fafafa',
      textColor: '#18181b',
      fontFamily: 'system',
      borderRadius: 'sm',
      buttonStyle: 'pill',
      cardStyle: 'flat',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'NEW DROP — Limited Edits Live Now', marquee: true, bgColor: '#09090b', textColor: '#ecfccb' } },
      { type: SECTION_TYPES.HERO_FULLSCREEN, configOverrides: { title: 'Limited Drop. Grab It First.', subtitle: 'Fresh street styles, sized to sell out.', ctaText: 'Shop the Drop', animation: 'scale' } },
      { type: SECTION_TYPES.PRODUCT_RAIL, configOverrides: { title: 'New Drop Rail', cardVariant: 'compact', limit: 8 } },
      { type: SECTION_TYPES.LOOKBOOK, configOverrides: { title: 'Street Lookbook Grid' } },
      { type: SECTION_TYPES.COUNTDOWN_SALE, configOverrides: { title: 'Drop Timer Ends In:', badge: 'Hurry! Only 50 Pieces Available', bgColor: '#09090b', textColor: '#ecfccb' } },
      { type: SECTION_TYPES.PRODUCT_TRENDING, configOverrides: { title: 'Trending Street Edits', cardVariant: 'overlay' } },
      { type: SECTION_TYPES.EDITORIAL_FULLWIDTH, configOverrides: { title: 'Made for the Streets', subtitle: 'Heavyweight cottons & relaxed silhouettes.' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 3. LUXURY FASHION
  {
    id: 'luxury',
    name: 'Luxury Fashion',
    description: 'Quiet, premium aesthetic with refined typography and generous white space',
    category: 'fashion',
    style: 'editorial',
    layout: 'centered',
    tags: ['luxury', 'premium', 'high-end', 'quiet', 'fashion'],
    featured: true,
    isNew: true,
    preview: {
      bgColor: '#fafaf9',
      accentColor: '#c8a24a',
      sections: [SECTION_TYPES.STICKY_HEADER, SECTION_TYPES.HERO_EDITORIAL, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.ASYMMETRIC_GALLERY, SECTION_TYPES.PRODUCT_SPOTLIGHT, SECTION_TYPES.LOOKBOOK, SECTION_TYPES.BRAND_STORY, SECTION_TYPES.NEWSLETTER, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#0a0a0a',
      accentColor: '#c8a24a',
      backgroundColor: '#fafaf9',
      textColor: '#1c1917',
      fontFamily: 'plus-jakarta',
      borderRadius: 'none',
      buttonStyle: 'square',
      cardStyle: 'flat',
    },
    defaultSections: [
      { type: SECTION_TYPES.STICKY_HEADER, configOverrides: { transparent: true } },
      { type: SECTION_TYPES.HERO_EDITORIAL, configOverrides: { headline: 'Quiet Luxury, Defined.', subheadline: 'Considered pieces crafted to last generations', ctaText: 'Discover Maison' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'The Collection', cardVariant: 'luxury', limit: 6 } },
      { type: SECTION_TYPES.ASYMMETRIC_GALLERY, configOverrides: { title: 'Atelier Portfolio' } },
      { type: SECTION_TYPES.PRODUCT_SPOTLIGHT, configOverrides: { title: 'Flagship Masterpiece', subtitle: 'Handwoven Pashmina Shawl' } },
      { type: SECTION_TYPES.LOOKBOOK, configOverrides: { title: 'Maison Lookbook' } },
      { type: SECTION_TYPES.BRAND_STORY, configOverrides: { title: 'Three Generations of Craftsmanship' } },
      { type: SECTION_TYPES.NEWSLETTER, configOverrides: { title: 'Private Atelier Inquiries' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: { showValueProps: false } },
    ],
  },

  // 4. TECH STORE
  {
    id: 'electronics',
    name: 'Tech Store',
    description: 'High-performance gadget store layout with product comparison & flash deals',
    category: 'electronics',
    style: 'modern',
    layout: 'left-aligned',
    tags: ['electronics', 'mobile', 'accessories', 'tech', 'gadgets'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#f0f9ff',
      accentColor: '#2563eb',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_PRODUCT, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_SPOTLIGHT, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.PRODUCT_COMPARISON, SECTION_TYPES.FLASH_SALE, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#0f172a',
      accentColor: '#2563eb',
      backgroundColor: '#f0f9ff',
      textColor: '#0f172a',
      fontFamily: 'inter',
      borderRadius: 'md',
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Pan-India Express Delivery • Manufacturer Warranty Included' } },
      { type: SECTION_TYPES.HERO_PRODUCT, configOverrides: { title: 'Pro Wireless Headphones', subtitle: 'Active Noise Cancellation • 40-Hour Battery' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Department', columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_SPOTLIGHT, configOverrides: { title: 'Featured Spec Upgrade', subtitle: 'Smart ANC Noise Cancelling Earbuds' } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Bestselling Audio & Gear', cardVariant: 'classic' } },
      { type: SECTION_TYPES.PRODUCT_COMPARISON, configOverrides: { title: 'Compare Specifications' } },
      { type: SECTION_TYPES.FLASH_SALE, configOverrides: { title: '48-Hour Tech Flash Deals', cardVariant: 'deal' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 5. FRESH GROCERY
  {
    id: 'grocery',
    name: 'Fresh Grocery',
    description: 'Aisle-based daily essentials layout with delivery promises and category rails',
    category: 'grocery',
    style: 'modern',
    layout: 'compact',
    tags: ['food', 'grains', 'daily', 'essentials', 'grocery', 'fresh'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#f0fdf4',
      accentColor: '#16a34a',
      sections: [SECTION_TYPES.FREE_SHIPPING_BAR, SECTION_TYPES.HERO_MINIMAL, SECTION_TYPES.CATEGORY_CIRCULAR, SECTION_TYPES.FLASH_SALE, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.DELIVERY_INFO, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#14532d',
      accentColor: '#16a34a',
      backgroundColor: '#f0fdf4',
      textColor: '#1a2e05',
      fontFamily: 'nunito',
      borderRadius: 'lg',
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
    },
    defaultSections: [
      { type: SECTION_TYPES.FREE_SHIPPING_BAR, configOverrides: { threshold: 499, text: 'Free Delivery on grocery orders above ₹{remaining}!' } },
      { type: SECTION_TYPES.HERO_MINIMAL, configOverrides: { title: 'Fresh, Every Single Day.', subtitle: 'Farm-fresh staples and daily essentials delivered to your door.' } },
      { type: SECTION_TYPES.CATEGORY_CIRCULAR, configOverrides: { title: 'Shop by Aisle', limit: 8 } },
      { type: SECTION_TYPES.FLASH_SALE, configOverrides: { title: 'Morning Fresh Deals', cardVariant: 'quick-add' } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Daily Essentials Rail', cardVariant: 'compact' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Seasonal Produce', cardVariant: 'classic' } },
      { type: SECTION_TYPES.DELIVERY_INFO, configOverrides: { title: 'Grocery Delivery Promise' } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Grocery Ordering Help' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 6. BEAUTY & COSMETICS
  {
    id: 'beauty',
    name: 'Beauty & Cosmetics',
    description: 'Clean skincare and cosmetics layout with routine builders and ingredient highlights',
    category: 'beauty',
    style: 'editorial',
    layout: 'centered',
    tags: ['cosmetics', 'makeup', 'skincare', 'beauty', 'glow'],
    featured: true,
    preview: {
      bgColor: '#fdf2f8',
      accentColor: '#db2777',
      sections: [SECTION_TYPES.HERO_FULLSCREEN, SECTION_TYPES.CATEGORY_MEGA, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.ROUTINE_BUILDER, SECTION_TYPES.EDITORIAL_SPLIT, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.BRAND_LOGOS, SECTION_TYPES.NEWSLETTER, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#831843',
      accentColor: '#db2777',
      backgroundColor: '#fdf2f8',
      textColor: '#500724',
      fontFamily: 'poppins',
      borderRadius: 'xl',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.HERO_FULLSCREEN, configOverrides: { title: 'Beauty That Cares Back.', subtitle: 'Clean, dermatologist-approved formulas for every skin type.' } },
      { type: SECTION_TYPES.CATEGORY_MEGA, configOverrides: { title: 'Shop by Concern', columns: 3 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Bestseller Serums & Formulas', cardVariant: 'editorial' } },
      { type: SECTION_TYPES.ROUTINE_BUILDER, configOverrides: { title: '3-Step Daily Glow Routine' } },
      { type: SECTION_TYPES.EDITORIAL_SPLIT, configOverrides: { quote: 'Pure botanical actives without harsh synthetic fillers.' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Real Routines & Glow Reviews' } },
      { type: SECTION_TYPES.BRAND_LOGOS, configOverrides: { title: 'Certifications & Derm Approvals' } },
      { type: SECTION_TYPES.NEWSLETTER, configOverrides: { title: 'Unlock 15% Off Your First Order' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 7. RESTAURANT / FOOD STORE
  {
    id: 'restaurant',
    name: 'Restaurant / Food Store',
    description: 'Appetite-driven layout for food ordering, chef specials, and gourmet items',
    category: 'food',
    style: 'classic',
    layout: 'centered',
    tags: ['restaurant', 'chef', 'foodie', 'specials', 'gourmet'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#fef2f2',
      accentColor: '#b91c1c',
      sections: [SECTION_TYPES.HERO_FULLSCREEN, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_SPOTLIGHT, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.BRAND_STORY, SECTION_TYPES.ASYMMETRIC_GALLERY, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.CONTACT, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#1c1917',
      accentColor: '#b91c1c',
      backgroundColor: '#fef2f2',
      textColor: '#1c1917',
      fontFamily: 'nunito',
      borderRadius: 'lg',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.HERO_FULLSCREEN, configOverrides: { title: 'Taste That Remembers Home.', subtitle: 'Chef-crafted specials delivered hot and fresh.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Explore Menu Categories', columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_SPOTLIGHT, configOverrides: { title: 'Chef Signature Dish', subtitle: 'Authentic Handi Biryani Hamper' } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Bestseller Food Delights', cardVariant: 'classic' } },
      { type: SECTION_TYPES.BRAND_STORY, configOverrides: { title: 'Our Recipe Tradition Since 1998' } },
      { type: SECTION_TYPES.ASYMMETRIC_GALLERY, configOverrides: { title: 'Culinary Gallery' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'What Foodies Say' } },
      { type: SECTION_TYPES.CONTACT, configOverrides: { title: 'Delivery & Catering Reservations' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 8. HOME & LIVING
  {
    id: 'home-living',
    name: 'Home & Living',
    description: 'Curated interior layout featuring shop-by-room grids and room inspiration',
    category: 'home',
    style: 'classic',
    layout: 'centered',
    tags: ['home', 'decor', 'living', 'curated', 'furniture'],
    featured: true,
    preview: {
      bgColor: '#fafaf9',
      accentColor: '#a16207',
      sections: [SECTION_TYPES.HERO_EDITORIAL, SECTION_TYPES.CATEGORY_MEGA, SECTION_TYPES.LOOKBOOK, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.EDITORIAL_SPLIT, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BRAND_STORY, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#292524',
      accentColor: '#a16207',
      backgroundColor: '#fafaf9',
      textColor: '#292524',
      fontFamily: 'plus-jakarta',
      borderRadius: 'md',
      buttonStyle: 'square',
      cardStyle: 'bordered',
    },
    defaultSections: [
      { type: SECTION_TYPES.HERO_EDITORIAL, configOverrides: { headline: 'Home, Made Thoughtful.', subheadline: 'Considered designs that turn a house into home' } },
      { type: SECTION_TYPES.CATEGORY_MEGA, configOverrides: { title: 'Shop by Room', columns: 3 } },
      { type: SECTION_TYPES.LOOKBOOK, configOverrides: { title: 'Room Inspiration & Styling' } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Furniture & Lighting Rail', cardVariant: 'luxury' } },
      { type: SECTION_TYPES.EDITORIAL_SPLIT, configOverrides: { quote: 'Every room should tell the story of the people who live in it.' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Featured Decor', cardVariant: 'classic' } },
      { type: SECTION_TYPES.BRAND_STORY, configOverrides: { title: 'Our Interior Philosophy' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 9. BHARAT BUSINESS
  {
    id: 'bharat-business',
    name: 'Bharat Business',
    description: 'High-energy Indian retail composition with festival sales and Khata credit support',
    category: 'general',
    style: 'modern',
    layout: 'compact',
    tags: ['bharat', 'festive', 'bargain', 'local', 'desi', 'khata'],
    featured: true,
    popular: true,
    isNew: true,
    preview: {
      bgColor: '#fff7ed',
      accentColor: '#ea580c',
      sections: [SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.CATEGORY_CIRCULAR, SECTION_TYPES.PRODUCT_RAIL, SECTION_TYPES.COUNTDOWN_SALE, SECTION_TYPES.COUPON_STRIP, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.TRUST, SECTION_TYPES.REVIEWS_SUMMARY, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#7c2d12',
      accentColor: '#ea580c',
      backgroundColor: '#fff7ed',
      textColor: '#431407',
      fontFamily: 'system',
      borderRadius: 'lg',
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
    },
    defaultSections: [
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { badge: 'Desi Deals', title: 'Dil Se Bharatiya Retail', subtitle: 'Everything your home needs, at honest prices with GST invoice.' } },
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Big Bharat Festival Sale Live — Up to 70% Off Across Store', marquee: true, bgColor: '#7c2d12', textColor: '#fed7aa' } },
      { type: SECTION_TYPES.CATEGORY_CIRCULAR, configOverrides: { title: 'Popular Categories', limit: 8 } },
      { type: SECTION_TYPES.PRODUCT_RAIL, configOverrides: { title: 'Bestseller Fast-Moving Rail', cardVariant: 'quick-add' } },
      { type: SECTION_TYPES.COUNTDOWN_SALE, configOverrides: { title: 'Festival Offer Timer Ends In:', badge: 'Extra 10% Off on UPI & Khata' } },
      { type: SECTION_TYPES.COUPON_STRIP, configOverrides: {} },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'All Retail Products', cardVariant: 'deal' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.REVIEWS_SUMMARY, configOverrides: { headline: 'Trusted by 15,000+ Customers & Local Retailers' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 10. MINIMAL COMMERCE
  {
    id: 'minimal',
    name: 'Minimal Commerce',
    description: 'Clean, simple product-focused layout without heavy decorative distractions',
    category: 'general',
    style: 'minimal',
    layout: 'centered',
    tags: ['clean', 'simple', 'products', 'minimal', 'general'],
    popular: true,
    preview: {
      bgColor: '#f8fafc',
      accentColor: '#0f172a',
      sections: [SECTION_TYPES.HERO_MINIMAL, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#0f172a',
      accentColor: '#0f172a',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      fontFamily: 'inter',
      borderRadius: 'md',
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
    },
    defaultSections: [
      { type: SECTION_TYPES.HERO_MINIMAL, configOverrides: { title: 'Clean. Simple. Just Essentials.', subtitle: 'Thoughtfully chosen products for everyday life.' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Our Catalog', cardVariant: 'classic', limit: 8 } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 11. BOUTIQUE
  {
    id: 'boutique',
    name: 'Boutique',
    description: 'Handcrafted feel for ethnic wear, artisan gifts, and boutique creations',
    category: 'fashion',
    style: 'classic',
    layout: 'centered',
    tags: ['handcrafted', 'ethnic', 'elegant', 'boutique'],
    featured: true,
    preview: {
      bgColor: '#fff7ed',
      accentColor: '#c2410c',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_TABS, SECTION_TYPES.EDITORIAL_SPLIT, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.BRAND_STORY, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#431407',
      accentColor: '#c2410c',
      backgroundColor: '#fff7ed',
      textColor: '#431407',
      fontFamily: 'poppins',
      borderRadius: 'lg',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Handcrafted pieces, made with love in India' } },
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { title: 'Slow-Made Styles for Everyday Grace', subtitle: 'Curated fabrics and thoughtful craft.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Boutique Collections', columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_TABS, configOverrides: { title: 'The Boutique Edit', cardVariant: 'editorial' } },
      { type: SECTION_TYPES.EDITORIAL_SPLIT, configOverrides: { quote: 'Heritage is not lost, it is worn.' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Boutique Client Love' } },
      { type: SECTION_TYPES.BRAND_STORY, configOverrides: { title: 'Our Craft Story' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 12. ELECTRONICS MARKETPLACE
  {
    id: 'electronics-marketplace',
    name: 'Electronics Marketplace',
    description: 'Multi-brand marketplace layout with category tabs and deal marquees',
    category: 'electronics',
    style: 'modern',
    layout: 'full',
    tags: ['marketplace', 'multi-brand', 'deals', 'electronics'],
    featured: true,
    isNew: true,
    preview: {
      bgColor: '#f8fafc',
      accentColor: '#2563eb',
      sections: [SECTION_TYPES.STICKY_HEADER, SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.OFFER_MARQUEE, SECTION_TYPES.PRODUCT_TABS, SECTION_TYPES.PRODUCT_COMPARISON, SECTION_TYPES.FLASH_SALE, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#0f172a',
      accentColor: '#2563eb',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      fontFamily: 'inter',
      borderRadius: 'md',
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.STICKY_HEADER, configOverrides: {} },
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { title: 'Every Tech Brand. One Roof.', subtitle: 'Compare prices across authorized distributors.' } },
      { type: SECTION_TYPES.OFFER_MARQUEE, configOverrides: {} },
      { type: SECTION_TYPES.PRODUCT_TABS, configOverrides: { title: 'Department Deals', cardVariant: 'classic' } },
      { type: SECTION_TYPES.PRODUCT_COMPARISON, configOverrides: { title: 'Marketplace Spec Matrix' } },
      { type: SECTION_TYPES.FLASH_SALE, configOverrides: { title: 'Flash Price Drops', cardVariant: 'deal' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 13. GADGETS
  {
    id: 'gadgets',
    name: 'Gadgets',
    description: 'Fun, high-energy layout for audio gear, smartwatches and gaming accessories',
    category: 'electronics',
    style: 'playful',
    layout: 'centered',
    tags: ['gadgets', 'audio', 'wearables', 'accessories', 'gaming'],
    popular: true,
    isNew: true,
    preview: {
      bgColor: '#f5f3ff',
      accentColor: '#7c3aed',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_PRODUCT, SECTION_TYPES.CATEGORY_CIRCULAR, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#1e1b4b',
      accentColor: '#7c3aed',
      backgroundColor: '#f5f3ff',
      textColor: '#1e1b4b',
      fontFamily: 'poppins',
      borderRadius: 'xl',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: '20% Off Audio Accessories • Code GADGET20' } },
      { type: SECTION_TYPES.HERO_PRODUCT, configOverrides: { title: 'Gear Up. Stand Out.', subtitle: 'The latest in wearables, audio & smart gear.' } },
      { type: SECTION_TYPES.CATEGORY_CIRCULAR, configOverrides: { title: 'Shop Gadget Types' } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Trending Audio Rail', cardVariant: 'overlay' } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Cables & Cases', description: 'Essential accessories for daily carry.' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Gadget Warranty FAQs' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 14. SUPERMARKET
  {
    id: 'supermarket',
    name: 'Supermarket',
    description: 'Dense supermarket layout with quick add buttons and weekly basket offers',
    category: 'grocery',
    style: 'modern',
    layout: 'compact',
    tags: ['supermarket', 'aisles', 'staples', 'household'],
    popular: true,
    preview: {
      bgColor: '#f0fdf4',
      accentColor: '#16a34a',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_MINIMAL, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_RAIL, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.DELIVERY_INFO, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#14532d',
      accentColor: '#16a34a',
      backgroundColor: '#f0fdf4',
      textColor: '#052e16',
      fontFamily: 'nunito',
      borderRadius: 'lg',
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Supermarket Savings Week — Up to 40% Off Staples' } },
      { type: SECTION_TYPES.HERO_MINIMAL, configOverrides: { title: 'Supermarket Staples, Fast.', subtitle: 'Order daily household essentials online.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop Supermarket Aisles', columns: 6 } },
      { type: SECTION_TYPES.PRODUCT_RAIL, configOverrides: { title: 'Quick Add Basket Items', cardVariant: 'quick-add' } },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'All Supermarket Items', cardVariant: 'compact' } },
      { type: SECTION_TYPES.DELIVERY_INFO, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 15. ORGANIC STORE
  {
    id: 'organic',
    name: 'Organic Store',
    description: 'Earthy, natural aesthetic for pesticide-free farm produce & wellness',
    category: 'grocery',
    style: 'classic',
    layout: 'centered',
    tags: ['organic', 'natural', 'farm', 'pesticide-free'],
    featured: true,
    preview: {
      bgColor: '#f7fee7',
      accentColor: '#65a30d',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.EDITORIAL_FULLWIDTH, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#1a2e05',
      accentColor: '#65a30d',
      backgroundColor: '#f7fee7',
      textColor: '#1a2e05',
      fontFamily: 'nunito',
      borderRadius: 'xl',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: '100% Certified Organic • No Chemical Pesticides' } },
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { title: 'Grown Without Chemicals.', subtitle: 'Straight from partner organic farms to your kitchen.' } },
      { type: SECTION_TYPES.EDITORIAL_FULLWIDTH, configOverrides: { title: 'Farm to Home Promise', subtitle: 'Know exact harvest dates & partner farms.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop Organic Harvest', columns: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Harvest Favourites', cardVariant: 'classic' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Community Love' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 16. SKINCARE
  {
    id: 'skincare',
    name: 'Skincare',
    description: 'Calm, dermatologist-tested clean beauty layout with routine cards',
    category: 'beauty',
    style: 'minimal',
    layout: 'centered',
    tags: ['skincare', 'clean-beauty', 'serums', 'glow'],
    isNew: true,
    preview: {
      bgColor: '#f0fdfa',
      accentColor: '#0d9488',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_FULLSCREEN, SECTION_TYPES.ROUTINE_BUILDER, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.EDITORIAL_SPLIT, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#134e4a',
      accentColor: '#0d9488',
      backgroundColor: '#f0fdfa',
      textColor: '#134e4a',
      fontFamily: 'poppins',
      borderRadius: 'xl',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Clean beauty • Cruelty free • Derm-tested' } },
      { type: SECTION_TYPES.HERO_FULLSCREEN, configOverrides: { title: 'Skin, Restored.', subtitle: 'Calm, science-backed routines for every skin type' } },
      { type: SECTION_TYPES.ROUTINE_BUILDER, configOverrides: { title: 'Daily Glowing Routine' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Best for Your Skin', cardVariant: 'editorial' } },
      { type: SECTION_TYPES.EDITORIAL_SPLIT, configOverrides: { quote: 'The glow standard starts with pure active botanicals.' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Real Skin Reviews' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 17. SALON / BEAUTY SHOP
  {
    id: 'salon',
    name: 'Salon / Beauty Shop',
    description: 'Dramatic, pro-grade look for salon equipment, tools, and makeup',
    category: 'beauty',
    style: 'editorial',
    layout: 'centered',
    tags: ['salon', 'pro-beauty', 'tools', 'makeup'],
    featured: true,
    preview: {
      bgColor: '#fff1f2',
      accentColor: '#be185d',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_EDITORIAL, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#18181b',
      accentColor: '#be185d',
      backgroundColor: '#fff1f2',
      textColor: '#1c1917',
      fontFamily: 'poppins',
      borderRadius: 'md',
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Pro-grade tools & makeup • Up to 40% off' } },
      { type: SECTION_TYPES.HERO_EDITORIAL, configOverrides: { headline: 'Salon Results, At Home.', subheadline: 'Professional tools and formulas for a legendary look' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Pro Salon Essentials', columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Stylist Pro Picks', cardVariant: 'overlay' } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Glow Up Set', description: 'Stage-ready kits curated by expert stylists' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 18. BAKERY
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Warm layout for artisanal bakeries, cakes, and morning breads',
    category: 'food',
    style: 'classic',
    layout: 'centered',
    tags: ['bakery', 'fresh', 'bread', 'desserts', 'cakes'],
    isNew: true,
    preview: {
      bgColor: '#fffbeb',
      accentColor: '#d97706',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_MINIMAL, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.BRAND_STORY, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#451a03',
      accentColor: '#d97706',
      backgroundColor: '#fffbeb',
      textColor: '#451a03',
      fontFamily: 'nunito',
      borderRadius: 'xl',
      buttonStyle: 'pill',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Freshly baked every morning at 7 AM' } },
      { type: SECTION_TYPES.HERO_MINIMAL, configOverrides: { title: 'Baked Today, Gone Tomorrow.', subtitle: 'Small-batch breads, cakes and patisserie.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Baked Daily', columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Fresh Batch Rail', cardVariant: 'classic' } },
      { type: SECTION_TYPES.BRAND_STORY, configOverrides: { title: 'Our Ovens, Our Pride' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 19. CAFE
  {
    id: 'cafe',
    name: 'Café',
    description: 'Cozy coffee-house aesthetic for single-origin beans, roasters, and brunch',
    category: 'food',
    style: 'minimal',
    layout: 'left-aligned',
    tags: ['cafe', 'coffee', 'brunch', 'beans', 'roaster'],
    popular: true,
    preview: {
      bgColor: '#fafaf9',
      accentColor: '#b45309',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.BANNER, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#1c1917',
      accentColor: '#b45309',
      backgroundColor: '#fafaf9',
      textColor: '#1c1917',
      fontFamily: 'system',
      borderRadius: 'lg',
      buttonStyle: 'rounded',
      cardStyle: 'flat',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Fresh Roasts Shipped Pan-India' } },
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { title: 'Slow Coffee. Fresh Roast.', subtitle: 'Single-origin South Indian beans roasted in small batches.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'The Roast Menu', columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'Coffee Beans & Brewing Gear', cardVariant: 'classic' } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Subscription Pours', description: 'Fresh beans delivered bi-weekly to your door.' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Coffee Lovers Say' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 20. FURNITURE
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Spacious, minimal layout for solid wood furniture & room setups',
    category: 'home',
    style: 'minimal',
    layout: 'full',
    tags: ['furniture', 'sofa', 'tables', 'minimal', 'timber'],
    featured: true,
    isNew: true,
    preview: {
      bgColor: '#f5f5f4',
      accentColor: '#b45309',
      sections: [SECTION_TYPES.HERO_FULLSCREEN, SECTION_TYPES.CATEGORY_MEGA, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.EDITORIAL_SPLIT, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#292524',
      accentColor: '#b45309',
      backgroundColor: '#f5f5f4',
      textColor: '#1c1917',
      fontFamily: 'inter',
      borderRadius: 'none',
      buttonStyle: 'square',
      cardStyle: 'flat',
    },
    defaultSections: [
      { type: SECTION_TYPES.HERO_FULLSCREEN, configOverrides: { title: 'Rooms Designed to Breathe.', subtitle: 'Solid timber pieces built for the long term.' } },
      { type: SECTION_TYPES.CATEGORY_MEGA, configOverrides: { title: 'Furniture Collections', columns: 3 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Signature Solid Wood Pieces', cardVariant: 'luxury' } },
      { type: SECTION_TYPES.EDITORIAL_SPLIT, configOverrides: { quote: 'Solid timber, honest joinery and finishes designed to age beautifully.' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Assembly & Furniture Delivery FAQs' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 21. LIFESTYLE STORE
  {
    id: 'lifestyle',
    name: 'Lifestyle Store',
    description: 'Trend-led modern layout mixing multi-category grids with new arrival rails',
    category: 'home',
    style: 'modern',
    layout: 'centered',
    tags: ['lifestyle', 'trendy', 'new-arrivals', 'mix'],
    popular: true,
    preview: {
      bgColor: '#f5f3ff',
      accentColor: '#6366f1',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_CAROUSEL, SECTION_TYPES.PROMO_SPLIT, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#1e1b4b',
      accentColor: '#6366f1',
      backgroundColor: '#f5f3ff',
      textColor: '#1e1b4b',
      fontFamily: 'plus-jakarta',
      borderRadius: 'lg',
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'New season • Shop the lookbooks' } },
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { title: 'Live Modern. Live You.', subtitle: 'Everyday lifestyle pieces, beautifully made' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Curate by Category', columns: 6 } },
      { type: SECTION_TYPES.PRODUCT_CAROUSEL, configOverrides: { title: 'Bestseller Rail', cardVariant: 'overlay' } },
      { type: SECTION_TYPES.PROMO_SPLIT, configOverrides: {} },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'New Arrivals', cardVariant: 'classic' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },

  // 22. MODERN GENERAL STORE
  {
    id: 'general',
    name: 'Modern General Store',
    description: 'Versatile multi-category template suitable for any Indian retail store',
    category: 'general',
    style: 'classic',
    layout: 'full',
    tags: ['general', 'multi-category', 'versatile', 'store', 'everything'],
    featured: true,
    preview: {
      bgColor: '#f8fafc',
      accentColor: '#d97706',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO_SPLIT, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FAQ, SECTION_TYPES.CONTACT, SECTION_TYPES.FOOTER],
    },
    defaultTheme: {
      primaryColor: '#0f172a',
      accentColor: '#d97706',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      fontFamily: 'inter',
      borderRadius: 'lg',
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
    },
    defaultSections: [
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Welcome to our online store!' } },
      { type: SECTION_TYPES.HERO_SPLIT, configOverrides: { title: 'Everything Under One Roof.', subtitle: 'Daily essentials, fashion, electronics and home products.' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Category', columns: 6 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Featured Catalog', cardVariant: 'classic' } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Special Store Offers' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: {} },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Common Store FAQs' } },
      { type: SECTION_TYPES.CONTACT, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
];

export function getTemplateById(id: string): StorefrontTemplate | undefined {
  return STOREFRONT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): StorefrontTemplate[] {
  return STOREFRONT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateSections(templateId: string) {
  const template = getTemplateById(templateId);
  if (!template) return [];
  return makeSections(template.defaultSections);
}

export function getGalleryCategories() {
  return STOREFRONT_GALLERY_CATEGORIES;
}

export interface TemplateFilter {
  category?: string;
  style?: string;
  layout?: string;
}

export type TemplateSortKey = 'featured' | 'popular' | 'newest' | 'az';

export function searchTemplates(templates: StorefrontTemplate[], query: string): StorefrontTemplate[] {
  const terms = (query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return templates;
  return templates.filter((t) => {
    const haystack = [t.id, t.name, t.category, t.description, t.style, t.layout, ...(t.tags || [])]
      .join(' ')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function filterTemplates(templates: StorefrontTemplate[], filter: TemplateFilter = {}): StorefrontTemplate[] {
  const { category, style, layout } = filter;
  return templates.filter((t) => {
    if (category && t.category !== category) return false;
    if (style && t.style !== style) return false;
    if (layout && t.layout !== layout) return false;
    return true;
  });
}

export function sortTemplates(templates: StorefrontTemplate[], sort: TemplateSortKey = 'featured'): StorefrontTemplate[] {
  const list = [...templates];
  const byName = (a: StorefrontTemplate, b: StorefrontTemplate) => a.name.localeCompare(b.name);
  switch (sort) {
    case 'az':
      return list.sort(byName);
    case 'popular':
      return list.sort((a, b) => Number(!!b.popular) - Number(!!a.popular) || byName(a, b));
    case 'newest':
      return list.sort(
        (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || Number(!!b.featured) - Number(!!a.featured) || byName(a, b)
      );
    default:
      return list.sort(
        (a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.popular) - Number(!!a.popular) || byName(a, b)
      );
  }
}

export function isTemplateCurrent(currentTemplateId: string | null | undefined, templateId: string): boolean {
  return !!currentTemplateId && currentTemplateId === templateId;
}

export function buildTemplatePageConfig(templateId: string) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }
  const sections = getTemplateSections(templateId);
  return {
    sections,
    theme: { ...template.defaultTheme },
    seo: {},
    templateId: template.id,
    updatedAt: new Date().toISOString(),
  };
}