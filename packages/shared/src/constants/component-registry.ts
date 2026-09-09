export const SECTION_TYPES = {
  // A. Navigation
  ANNOUNCEMENT: 'announcement',
  STICKY_HEADER: 'sticky-header',
  MEGA_MENU: 'mega-menu',
  MOBILE_NAV: 'mobile-nav',
  SEARCH_OVERLAY: 'search-overlay',

  // B. Hero / Brand
  HERO: 'hero',
  HERO_FULLSCREEN: 'hero-fullscreen',
  HERO_SPLIT: 'hero-split',
  HERO_EDITORIAL: 'hero-editorial',
  HERO_PRODUCT: 'hero-product',
  HERO_MINIMAL: 'hero-minimal',

  // C. Collections / Categories
  CATEGORIES: 'categories',
  CATEGORY_CIRCULAR: 'category-circular',
  CATEGORY_MEGA: 'category-mega',

  // D. Products & Commerce
  FEATURED_PRODUCTS: 'featured-products',
  PRODUCT_GRID: 'product-grid',
  PRODUCT_CAROUSEL: 'product-carousel',
  PRODUCT_RAIL: 'product-rail',
  PRODUCT_SPOTLIGHT: 'product-spotlight',
  PRODUCT_TRENDING: 'product-trending',
  PRODUCT_TABS: 'product-tabs',
  PRODUCT_COMPARISON: 'product-comparison',

  // E. Marketing / Promotional
  BANNER: 'banner',
  PROMO_SPLIT: 'promo-split',
  COUNTDOWN_SALE: 'countdown-sale',
  FLASH_SALE: 'flash-sale',
  COUPON_STRIP: 'coupon-strip',
  FREE_SHIPPING_BAR: 'free-shipping-bar',
  OFFER_MARQUEE: 'offer-marquee',

  // F. Editorial / Story
  ABOUT: 'about',
  EDITORIAL_SPLIT: 'editorial-split',
  EDITORIAL_FULLWIDTH: 'editorial-fullwidth',
  LOOKBOOK: 'lookbook',
  ASYMMETRIC_GALLERY: 'asymmetric-gallery',
  BRAND_STORY: 'brand-story',
  ROUTINE_BUILDER: 'routine-builder',

  // G. Trust & Social Proof
  TRUST: 'trust',
  TESTIMONIALS: 'testimonials',
  REVIEWS_SUMMARY: 'reviews-summary',
  BRAND_LOGOS: 'brand-logos',
  FAQ: 'faq',

  // H. Utility / Communication
  CONTACT: 'contact',
  DELIVERY_INFO: 'delivery-info',
  NEWSLETTER: 'newsletter',
  FOOTER: 'footer',

  // I. Industry Solutions
  SIZE_GUIDE: 'size-guide',
  SHOP_BY_CONCERN: 'shop-by-concern',
  SHOP_BY_ROOM: 'shop-by-room',
  INGREDIENT_HIGHLIGHTS: 'ingredient-highlights',
} as const;

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

export const VALID_SECTION_TYPES: readonly string[] = Object.values(SECTION_TYPES);

export type ComponentCategory =
  | 'navigation'
  | 'hero'
  | 'products'
  | 'collections'
  | 'marketing'
  | 'editorial'
  | 'trust'
  | 'utility'
  | 'footer';

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  category: ComponentCategory;
  isRequired: boolean;
  isDeletable: boolean;
  icon: string;
  defaultConfig: Record<string, unknown>;
}

export const COMPONENT_CATEGORIES: Array<{ id: ComponentCategory; label: string }> = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'hero', label: 'Hero & Brand' },
  { id: 'products', label: 'Product Discovery' },
  { id: 'collections', label: 'Collections & Categories' },
  { id: 'marketing', label: 'Marketing & Sales' },
  { id: 'editorial', label: 'Editorial & Story' },
  { id: 'trust', label: 'Trust & Social Proof' },
  { id: 'utility', label: 'Utility & Contact' },
  { id: 'footer', label: 'Footer' },
];

export const COMPONENT_REGISTRY: Record<SectionType, SectionDefinition> = {
  // A. NAVIGATION
  [SECTION_TYPES.ANNOUNCEMENT]: {
    type: SECTION_TYPES.ANNOUNCEMENT,
    label: 'Announcement Bar',
    description: 'Top banner for promotions, shipping notices & marquee text',
    category: 'navigation',
    isRequired: false,
    isDeletable: true,
    icon: 'Megaphone',
    defaultConfig: {
      text: 'Welcome to our store! Free delivery on orders above ₹499.',
      link: '/products',
      visible: true,
      bgColor: '#0f172a',
      textColor: '#fbbf24',
      marquee: false,
      dismissible: true,
      animation: 'none',
    },
  },
  [SECTION_TYPES.STICKY_HEADER]: {
    type: SECTION_TYPES.STICKY_HEADER,
    label: 'Sticky Header',
    description: 'Navigation bar with logo, category links, search & cart',
    category: 'navigation',
    isRequired: false,
    isDeletable: true,
    icon: 'PanelTop',
    defaultConfig: {
      transparent: false,
      showSearch: true,
      showCart: true,
      showAccount: true,
      navLinks: [
        { label: 'Home', url: '/' },
        { label: 'Shop', url: '/products' },
        { label: 'Categories', url: '/categories' },
        { label: 'Deals', url: '/sale' },
      ],
      animation: 'none',
    },
  },
  [SECTION_TYPES.MEGA_MENU]: {
    type: SECTION_TYPES.MEGA_MENU,
    label: 'Mega Menu Bar',
    description: 'Multi-column navigation with featured categories & promo spotlight',
    category: 'navigation',
    isRequired: false,
    isDeletable: true,
    icon: 'Menu',
    defaultConfig: {
      title: 'Explore Categories',
      groups: [
        { title: 'New Arrivals', items: ['Apparel', 'Footwear', 'Accessories'] },
        { title: 'Featured', items: ['Bestsellers', 'Trending', 'Seasonal'] },
      ],
      promoTitle: 'Season Sale',
      promoSubtitle: 'Up to 50% Off Select Lines',
      promoImage: '',
      animation: 'none',
    },
  },
  [SECTION_TYPES.MOBILE_NAV]: {
    type: SECTION_TYPES.MOBILE_NAV,
    label: 'Mobile Navigation Drawer',
    description: 'Touch-optimized slide-in drawer for smartphone shoppers',
    category: 'navigation',
    isRequired: false,
    isDeletable: true,
    icon: 'Smartphone',
    defaultConfig: {
      showCategories: true,
      showSocial: true,
      showContact: true,
      ctaText: 'Shop Catalog',
      animation: 'none',
    },
  },
  [SECTION_TYPES.SEARCH_OVERLAY]: {
    type: SECTION_TYPES.SEARCH_OVERLAY,
    label: 'Search Overlay Bar',
    description: 'Instant product search bar with quick category filters',
    category: 'navigation',
    isRequired: false,
    isDeletable: true,
    icon: 'Search',
    defaultConfig: {
      placeholder: 'Search products, categories, SKU...',
      popularSearches: ['Sarees', 'Headphones', 'Spices', 'Organic Oil'],
      showCategories: true,
      animation: 'none',
    },
  },

  // B. HERO / BRAND
  [SECTION_TYPES.HERO]: {
    type: SECTION_TYPES.HERO,
    label: 'Hero Banner',
    description: 'Classic hero section with heading, subtitle, image and CTA',
    category: 'hero',
    isRequired: true,
    isDeletable: false,
    icon: 'Image',
    defaultConfig: {
      title: 'Welcome to Our Store',
      subtitle: 'Quality products delivered to your doorstep',
      imageUrl: '',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      secondaryCtaText: '',
      secondaryCtaLink: '',
      alignment: 'center',
      height: 'medium',
      overlayOpacity: 40,
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.HERO_FULLSCREEN]: {
    type: SECTION_TYPES.HERO_FULLSCREEN,
    label: 'Full-Screen Hero',
    description: 'Immersive full-screen visual hero with dark mode contrast',
    category: 'hero',
    isRequired: false,
    isDeletable: true,
    icon: 'Maximize',
    defaultConfig: {
      title: 'Crafted to Inspire.',
      subtitle: 'Explore our latest luxury release',
      imageUrl: '',
      ctaText: 'Discover Collection',
      ctaLink: '/products',
      overlayOpacity: 50,
      animation: 'fade',
    },
  },
  [SECTION_TYPES.HERO_SPLIT]: {
    type: SECTION_TYPES.HERO_SPLIT,
    label: 'Split Hero',
    description: 'Two-column layout balancing text story and imagery side-by-side',
    category: 'hero',
    isRequired: false,
    isDeletable: true,
    icon: 'Columns',
    defaultConfig: {
      badge: 'New Arrival',
      title: 'Modern Design for Daily Life',
      subtitle: 'Thoughtful materials, clean lines and long-lasting durability.',
      imageUrl: '',
      ctaText: 'Explore Now',
      ctaLink: '/products',
      layout: 'left-image',
      animation: 'slide-up',
    },
  },
  [SECTION_TYPES.HERO_EDITORIAL]: {
    type: SECTION_TYPES.HERO_EDITORIAL,
    label: 'Fashion Editorial Hero',
    description: 'High-fashion typography hero with large whitespace & elegant taglines',
    category: 'hero',
    isRequired: false,
    isDeletable: true,
    icon: 'Sparkles',
    defaultConfig: {
      seasonTag: 'Autumn / Winter 2026',
      headline: 'The Heritage Edit',
      subheadline: 'Handwoven textiles & modern Indian craftsmanship',
      imageUrl: '',
      ctaText: 'View Lookbook',
      ctaLink: '/products',
      accentText: 'Limited Couture',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.HERO_PRODUCT]: {
    type: SECTION_TYPES.HERO_PRODUCT,
    label: 'Product Showcase Hero',
    description: 'Hero focusing directly on a single flagship item with instant buy CTA',
    category: 'hero',
    isRequired: false,
    isDeletable: true,
    icon: 'PackageCheck',
    defaultConfig: {
      badge: 'Flagship Launch',
      title: 'Pro Wireless Headphones',
      subtitle: 'Active Noise Cancellation • 40-Hour Battery • Spatial Audio',
      price: '4999',
      comparePrice: '6999',
      imageUrl: '',
      ctaText: 'Buy Now',
      ctaLink: '/products',
      animation: 'scale',
    },
  },
  [SECTION_TYPES.HERO_MINIMAL]: {
    type: SECTION_TYPES.HERO_MINIMAL,
    label: 'Minimal Typography Hero',
    description: 'Clean, text-first headline layout without heavy image backgrounds',
    category: 'hero',
    isRequired: false,
    isDeletable: true,
    icon: 'Type',
    defaultConfig: {
      title: 'Clean. Essential. Honest.',
      subtitle: 'Pure organic produce delivered fresh every morning.',
      ctaText: 'Shop Essentials',
      ctaLink: '/products',
      alignment: 'center',
      animation: 'fade',
    },
  },

  // C. COLLECTIONS / CATEGORIES
  [SECTION_TYPES.CATEGORIES]: {
    type: SECTION_TYPES.CATEGORIES,
    label: 'Category Showcase',
    description: 'Displays product categories in grid or carousel layout',
    category: 'collections',
    isRequired: false,
    isDeletable: true,
    icon: 'Layers',
    defaultConfig: {
      title: 'Shop by Category',
      subtitle: 'Browse our curated collections',
      layout: 'grid',
      columns: 6,
      showProductCount: true,
      limit: 6,
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.CATEGORY_CIRCULAR]: {
    type: SECTION_TYPES.CATEGORY_CIRCULAR,
    label: 'Circular Category Rail',
    description: 'Quick-scroll circular category bubbles popular in mobile commerce',
    category: 'collections',
    isRequired: false,
    isDeletable: true,
    icon: 'CircleDot',
    defaultConfig: {
      title: 'Explore Departments',
      limit: 8,
      showLabels: true,
      animation: 'slide-up',
    },
  },
  [SECTION_TYPES.CATEGORY_MEGA]: {
    type: SECTION_TYPES.CATEGORY_MEGA,
    label: 'Category Mega Grid (Shop by Room/Aisle)',
    description: 'Rich image tiles for Shop by Room, Concern, Aisle, or Style',
    category: 'collections',
    isRequired: false,
    isDeletable: true,
    icon: 'LayoutGrid',
    defaultConfig: {
      title: 'Shop by Room',
      subtitle: 'Curated designs for every corner of your home',
      columns: 3,
      limit: 6,
      cardStyle: 'editorial',
      animation: 'fade-up',
    },
  },

  // D. PRODUCTS & COMMERCE
  [SECTION_TYPES.FEATURED_PRODUCTS]: {
    type: SECTION_TYPES.FEATURED_PRODUCTS,
    label: 'Featured Products',
    description: 'Showcase handpicked or newest products from your catalog',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'Star',
    defaultConfig: {
      title: 'Featured Products',
      subtitle: 'Handpicked just for you',
      selectionMode: 'newest',
      limit: 8,
      layout: 'grid',
      columns: 4,
      cardVariant: 'classic',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.PRODUCT_GRID]: {
    type: SECTION_TYPES.PRODUCT_GRID,
    label: 'Full Product Grid',
    description: 'Complete store catalog grid with sort and filter controls',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'Grid3x3',
    defaultConfig: {
      title: 'All Products',
      columns: 3,
      showFilters: true,
      showSort: true,
      cardVariant: 'classic',
      animation: 'none',
    },
  },
  [SECTION_TYPES.PRODUCT_CAROUSEL]: {
    type: SECTION_TYPES.PRODUCT_CAROUSEL,
    label: 'Product Carousel',
    description: 'Interactive sliding product rail with prev/next arrows & swipe',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'Sliders',
    defaultConfig: {
      title: 'Bestseller Rail',
      subtitle: 'Customer favorites this week',
      limit: 8,
      autoplay: true,
      showArrows: true,
      cardVariant: 'classic',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.PRODUCT_RAIL]: {
    type: SECTION_TYPES.PRODUCT_RAIL,
    label: 'Horizontal Product Rail',
    description: 'Dense horizontal scrolling product strip ideal for fast shopping',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'ArrowRightCircle',
    defaultConfig: {
      title: 'New Drops',
      limit: 10,
      cardVariant: 'compact',
      animation: 'slide-up',
    },
  },
  [SECTION_TYPES.PRODUCT_SPOTLIGHT]: {
    type: SECTION_TYPES.PRODUCT_SPOTLIGHT,
    label: 'Product Spotlight',
    description: 'In-depth focus on 1 key product with variant pickers & quick buy',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'Focus',
    defaultConfig: {
      title: 'Product of the Month',
      subtitle: 'Pure Cold-Pressed Virgin Coconut Oil 500ml',
      price: '349',
      mrp: '499',
      features: ['100% Unrefined', 'Zero Chemicals', 'FSSAI Certified'],
      imageUrl: '',
      ctaText: 'Add to Cart',
      animation: 'scale',
    },
  },
  [SECTION_TYPES.PRODUCT_TRENDING]: {
    type: SECTION_TYPES.PRODUCT_TRENDING,
    label: 'Trending Products Grid',
    description: 'High-converting grid highlighting popular & fast-moving inventory',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'TrendingUp',
    defaultConfig: {
      title: 'Trending Now',
      subtitle: 'What everyone is buying right now',
      limit: 6,
      columns: 3,
      cardVariant: 'deal',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.PRODUCT_TABS]: {
    type: SECTION_TYPES.PRODUCT_TABS,
    label: 'Product Category Tabs',
    description: 'Tabbed product grids (e.g. New Arrivals / Bestsellers / Special Deals)',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'FolderKanban',
    defaultConfig: {
      title: 'Explore Collections',
      tabs: ['Bestsellers', 'New In', 'On Sale'],
      limit: 8,
      columns: 4,
      cardVariant: 'classic',
      animation: 'fade',
    },
  },
  [SECTION_TYPES.PRODUCT_COMPARISON]: {
    type: SECTION_TYPES.PRODUCT_COMPARISON,
    label: 'Product Spec Comparison Table',
    description: 'Side-by-side comparison table for electronics, appliances & gadgets',
    category: 'products',
    isRequired: false,
    isDeletable: true,
    icon: 'GitCompare',
    defaultConfig: {
      title: 'Compare Models',
      features: ['Display Size', 'Battery Life', 'Storage', 'Warranty', 'Price'],
      animation: 'fade-up',
    },
  },

  // E. MARKETING / PROMOTIONAL
  [SECTION_TYPES.BANNER]: {
    type: SECTION_TYPES.BANNER,
    label: 'Promotional Banner',
    description: 'Full-width banner with heading, description, background and CTA',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Megaphone',
    defaultConfig: {
      heading: 'Special Offer',
      description: 'Check out our latest deals and promotions',
      imageUrl: '',
      ctaText: 'Shop the Sale',
      ctaLink: '/products',
      bgColor: '#fef3c7',
      textColor: '#92400e',
      layout: 'left',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.PROMO_SPLIT]: {
    type: SECTION_TYPES.PROMO_SPLIT,
    label: 'Split Promo Banner',
    description: 'Dual promotion banner section highlighting two campaign offers',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Split',
    defaultConfig: {
      leftHeading: 'Women’s Festive Edit',
      leftSub: 'Flat 30% Off Sarees & Lehengas',
      leftCta: 'Shop Women',
      rightHeading: 'Men’s Heritage Kurtas',
      rightSub: 'Starting at ₹799',
      rightCta: 'Shop Men',
      animation: 'slide-up',
    },
  },
  [SECTION_TYPES.COUNTDOWN_SALE]: {
    type: SECTION_TYPES.COUNTDOWN_SALE,
    label: 'Countdown Sale Timer',
    description: 'Live ticking timer section for flash sales & festival deals',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Timer',
    defaultConfig: {
      title: 'Festival Flash Sale Ends In:',
      targetDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      badge: 'Hurry! Limited Time Offer',
      ctaText: 'Grab Deals Now',
      ctaLink: '/products',
      bgColor: '#7c2d12',
      textColor: '#fed7aa',
      animation: 'scale',
    },
  },
  [SECTION_TYPES.FLASH_SALE]: {
    type: SECTION_TYPES.FLASH_SALE,
    label: 'Flash Sale Showcase',
    description: 'Urgency-driven product strip with discount badges & progress stock',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Zap',
    defaultConfig: {
      title: 'Flash Deals — Up to 60% Off',
      subtitle: 'Selling out fast. Stock updated hourly.',
      limit: 4,
      cardVariant: 'deal',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.COUPON_STRIP]: {
    type: SECTION_TYPES.COUPON_STRIP,
    label: 'Coupon & Voucher Strip',
    description: 'Copyable discount codes strip to boost customer checkout rate',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Ticket',
    defaultConfig: {
      title: 'Store Discount Coupons',
      coupons: [
        { code: 'WELCOME10', discount: '10% OFF', detail: 'On your first order' },
        { code: 'BHARAT500', discount: '₹500 OFF', detail: 'On orders above ₹2,999' },
      ],
      animation: 'slide-up',
    },
  },
  [SECTION_TYPES.FREE_SHIPPING_BAR]: {
    type: SECTION_TYPES.FREE_SHIPPING_BAR,
    label: 'Free Shipping Threshold Bar',
    description: 'Highlight free delivery threshold to increase average order value',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Truck',
    defaultConfig: {
      threshold: 999,
      text: 'Add ₹{remaining} more for FREE Pan-India Shipping!',
      bgColor: '#15803d',
      textColor: '#ffffff',
      animation: 'none',
    },
  },
  [SECTION_TYPES.OFFER_MARQUEE]: {
    type: SECTION_TYPES.OFFER_MARQUEE,
    label: 'Scrolling Offer Marquee',
    description: 'Continuous smooth scrolling marquee ticker of highlights & announcements',
    category: 'marketing',
    isRequired: false,
    isDeletable: true,
    icon: 'Repeat',
    defaultConfig: {
      items: [
        '✨ 100% Genuine Direct Store Products',
        '🚚 Express Dispatch Within 24 Hours',
        '💳 Cash on Delivery & Khata Credit Available',
        '🧾 Tax Compliant GST Invoice Included',
      ],
      speed: 'normal',
      bgColor: '#1e293b',
      textColor: '#f8fafc',
      animation: 'none',
    },
  },

  // F. EDITORIAL / STORY
  [SECTION_TYPES.ABOUT]: {
    type: SECTION_TYPES.ABOUT,
    label: 'About Section',
    description: 'Tell your business story with images and descriptive paragraphs',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Info',
    defaultConfig: {
      title: 'About Us',
      description: 'We are a family-owned business dedicated to bringing you the finest products.',
      imageUrl: '',
      layout: 'left',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.EDITORIAL_SPLIT]: {
    type: SECTION_TYPES.EDITORIAL_SPLIT,
    label: 'Editorial Story Split',
    description: 'Magazine-style editorial spread with story narrative & image',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'BookOpen',
    defaultConfig: {
      quote: 'Craftsmanship is the bridge between heritage and modern living.',
      author: 'Our Founder',
      story: 'Every thread and ingredient in our store is chosen with reverence for quality.',
      imageUrl: '',
      animation: 'fade',
    },
  },
  [SECTION_TYPES.EDITORIAL_FULLWIDTH]: {
    type: SECTION_TYPES.EDITORIAL_FULLWIDTH,
    label: 'Full-Width Image Story',
    description: 'Dramatic full-bleed image section with minimal typography overlay',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Monitor',
    defaultConfig: {
      title: 'Purity in Every Batch',
      subtitle: 'From local Bharatiya farms straight to your home kitchen.',
      imageUrl: '',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.LOOKBOOK]: {
    type: SECTION_TYPES.LOOKBOOK,
    label: 'Fashion / Lifestyle Lookbook Grid',
    description: 'Interactive gallery showcasing outfits, rooms, or styled lifestyle looks',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Camera',
    defaultConfig: {
      title: 'Season Lookbook',
      subtitle: 'Get inspired by our styled edits',
      columns: 3,
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.ASYMMETRIC_GALLERY]: {
    type: SECTION_TYPES.ASYMMETRIC_GALLERY,
    label: 'Asymmetric Image Mosaic',
    description: 'Contemporary staggered grid gallery for interior & lifestyle stores',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Grid',
    defaultConfig: {
      title: 'Design Gallery',
      subtitle: 'A glimpse into our artisanal process',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.BRAND_STORY]: {
    type: SECTION_TYPES.BRAND_STORY,
    label: 'Brand Heritage & Founder Story',
    description: 'Authentic store origin narrative with signature & key milestones',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Award',
    defaultConfig: {
      title: 'Our Journey Since 2012',
      story: 'Started as a small local shop, BharatStore has grown to empower thousands of customers.',
      milestones: [
        { year: '2012', event: 'First store opened in Jaipur' },
        { year: '2018', event: 'Expanded to 100% natural products' },
        { year: '2026', event: 'Online storefront for Pan-India fulfillment' },
      ],
      animation: 'slide-up',
    },
  },
  [SECTION_TYPES.ROUTINE_BUILDER]: {
    type: SECTION_TYPES.ROUTINE_BUILDER,
    label: 'Beauty Routine & Ingredient Showcase',
    description: 'Step-by-step skincare routine cards or key ingredient breakdowns',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Heart',
    defaultConfig: {
      title: '3-Step Daily Glow Routine',
      steps: [
        { step: '01', title: 'Cleanse', desc: 'Gentle Ayurvedic face wash' },
        { step: '02', title: 'Tone & Hydrate', desc: 'Pure Rose Water Mist' },
        { step: '03', title: 'Nourish', desc: 'Kumkumadi Radiance Facial Oil' },
      ],
      animation: 'fade-up',
    },
  },

  // G. TRUST & SOCIAL PROOF
  [SECTION_TYPES.TRUST]: {
    type: SECTION_TYPES.TRUST,
    label: 'Trust Badges',
    description: 'Display trust signals like secure payments, GST invoices & fast shipping',
    category: 'trust',
    isRequired: false,
    isDeletable: true,
    icon: 'ShieldCheck',
    defaultConfig: {
      badges: [
        { icon: 'ShieldCheck', title: 'Secure Payments', description: '100% secure checkout' },
        { icon: 'FileText', title: 'GST Invoice', description: 'Tax compliance guaranteed' },
        { icon: 'Truck', title: 'Fast Delivery', description: 'Quick dispatch & tracking' },
        { icon: 'Headphones', title: '24/7 Support', description: 'We are here to help' },
      ],
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.TESTIMONIALS]: {
    type: SECTION_TYPES.TESTIMONIALS,
    label: 'Testimonials Carousel',
    description: 'Interactive sliding customer review cards with star ratings',
    category: 'trust',
    isRequired: false,
    isDeletable: true,
    icon: 'MessageSquare',
    defaultConfig: {
      title: 'What Our Customers Say',
      testimonials: [
        { name: 'Priya S.', text: 'Amazing quality products! Delivered within 2 days in Delhi.', rating: 5 },
        { name: 'Rahul M.', text: 'Fast delivery, proper GST invoice, and authentic items.', rating: 5 },
        { name: 'Anita K.', text: 'Best online shopping experience for my boutique requirements.', rating: 5 },
      ],
      autoplay: true,
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.REVIEWS_SUMMARY]: {
    type: SECTION_TYPES.REVIEWS_SUMMARY,
    label: 'Customer Rating & Review Summary',
    description: 'Social proof stats counter (e.g. 4.9/5 stars, 10k+ happy customers)',
    category: 'trust',
    isRequired: false,
    isDeletable: true,
    icon: 'Star',
    defaultConfig: {
      rating: '4.9',
      reviewCount: '12,450+',
      headline: 'Loved by Thousands Across India',
      stats: [
        { number: '99.4%', label: 'On-Time Dispatch' },
        { number: '15,000+', label: 'Orders Shipped' },
        { number: '4.9 ★', label: 'Customer Rating' },
      ],
      animation: 'scale',
    },
  },
  [SECTION_TYPES.BRAND_LOGOS]: {
    type: SECTION_TYPES.BRAND_LOGOS,
    label: 'Brand & Press Logo Carousel',
    description: 'Logo bar showcasing featured brands, press coverage, or certifications',
    category: 'trust',
    isRequired: false,
    isDeletable: true,
    icon: 'BadgeCheck',
    defaultConfig: {
      title: 'Featured In & Trusted By',
      logos: ['FSSAI Certified', 'ISO 9001', 'Make in India', '100% Organic'],
      animation: 'none',
    },
  },
  [SECTION_TYPES.FAQ]: {
    type: SECTION_TYPES.FAQ,
    label: 'FAQ Accordion',
    description: 'Interactive accessible accordion for common customer questions',
    category: 'trust',
    isRequired: false,
    isDeletable: true,
    icon: 'HelpCircle',
    defaultConfig: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'What payment methods do you accept?', answer: 'We accept Cash on Delivery, UPI, Credit/Debit cards, and Khata credit.' },
        { question: 'How long does delivery take?', answer: 'Orders are dispatched within 24 hours and delivered in 2-4 business days.' },
        { question: 'Do you provide a tax invoice for GST claiming?', answer: 'Yes, every order includes a valid B2B/B2C GST tax invoice.' },
      ],
      animation: 'fade-up',
    },
  },

  // H. UTILITY / COMMUNICATION
  [SECTION_TYPES.CONTACT]: {
    type: SECTION_TYPES.CONTACT,
    label: 'Contact & Support Section',
    description: 'Display phone, WhatsApp, email, store address and business hours',
    category: 'utility',
    isRequired: false,
    isDeletable: true,
    icon: 'Phone',
    defaultConfig: {
      title: 'Get in Touch',
      showPhone: true,
      showEmail: true,
      showAddress: true,
      showHours: true,
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.DELIVERY_INFO]: {
    type: SECTION_TYPES.DELIVERY_INFO,
    label: 'Delivery & Shipping Promise',
    description: 'Informative card detailing delivery timelines, packing & return policy',
    category: 'utility',
    isRequired: false,
    isDeletable: true,
    icon: 'Box',
    defaultConfig: {
      title: 'Shipping & Delivery Promise',
      items: [
        { title: 'Local Delivery', desc: 'Same day dispatch for orders before 2 PM' },
        { title: 'Safe Packaging', desc: 'Tamper-proof & eco-friendly boxes' },
        { title: 'Easy Returns', desc: '7-day hassle-free return/exchange policy' },
      ],
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.NEWSLETTER]: {
    type: SECTION_TYPES.NEWSLETTER,
    label: 'Newsletter Signup Bar',
    description: 'Email/phone subscription bar for exclusive offers & drops',
    category: 'utility',
    isRequired: false,
    isDeletable: true,
    icon: 'Mail',
    defaultConfig: {
      title: 'Join Our VIP Circle',
      subtitle: 'Subscribe for secret discounts, early drop access and seasonal updates.',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email or phone number...',
      animation: 'fade-up',
    },
  },
  [SECTION_TYPES.FOOTER]: {
    type: SECTION_TYPES.FOOTER,
    label: 'Store Footer',
    description: 'Complete store footer with links, copyright, social icons & value props',
    category: 'footer',
    isRequired: true,
    isDeletable: false,
    icon: 'LayoutTemplate',
    defaultConfig: {
      showValueProps: true,
      showSocialLinks: true,
      showCopyright: true,
      valueProps: [
        { icon: 'ShieldCheck', title: 'Genuine Products', description: 'Direct store inventory' },
        { icon: 'Truck', title: 'Fast Dispatch', description: 'Quick local fulfillment' },
        { icon: 'CreditCard', title: 'Flexible Payment', description: 'UPI, Cash & Khata' },
        { icon: 'FileText', title: 'GST Invoice', description: 'B2B & B2C compliant' },
      ],
      animation: 'none',
    },
  },

  // I. INDUSTRY SOLUTIONS
  [SECTION_TYPES.SIZE_GUIDE]: {
    type: SECTION_TYPES.SIZE_GUIDE,
    label: 'Size Guide Table',
    description: 'In-store size chart for fashion & grocery — reduces returns and confusion',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Ruler',
    defaultConfig: {
      title: 'Size Guide',
      subtitle: 'Find your perfect fit before you order',
      columns: ['Size', 'Chest', 'Length'],
      rows: [
        { label: 'S', values: ['38"', '28"'] },
        { label: 'M', values: ['40"', '29"'] },
        { label: 'L', values: ['42"', '30"'] },
        { label: 'XL', values: ['44"', '31"'] },
      ],
      animation: 'none',
    },
  },
  [SECTION_TYPES.SHOP_BY_CONCERN]: {
    type: SECTION_TYPES.SHOP_BY_CONCERN,
    label: 'Shop by Concern',
    description: 'Solution-led browsing for beauty — match customer needs to products',
    category: 'collections',
    isRequired: false,
    isDeletable: true,
    icon: 'HeartHandshake',
    defaultConfig: {
      title: 'Shop by Concern',
      subtitle: 'Find the fix for what matters to you',
      concerns: ['Acne & Breakouts', 'Dullness', 'Dryness', 'Fine Lines', 'Sun Damage', 'Hairfall'],
      animation: 'none',
    },
  },
  [SECTION_TYPES.SHOP_BY_ROOM]: {
    type: SECTION_TYPES.SHOP_BY_ROOM,
    label: 'Shop by Room',
    description: 'Room-led shopping for home décor & furniture collections',
    category: 'collections',
    isRequired: false,
    isDeletable: true,
    icon: 'Sofa',
    defaultConfig: {
      title: 'Shop by Room',
      subtitle: 'Curated designs for every corner of your home',
      rooms: [
        { name: 'Living Room', items: ['Sofas', 'Rugs', 'Coffee Tables', 'Lighting'] },
        { name: 'Bedroom', items: ['Beds', 'Bedsheets', 'Wardrobes', 'Nightstands'] },
        { name: 'Kitchen', items: ['Cookware', 'Storage', 'Utensils', 'Countertops'] },
        { name: 'Study', items: ['Desks', 'Chairs', 'Shelves', 'Desk Lamps'] },
      ],
      animation: 'none',
    },
  },
  [SECTION_TYPES.INGREDIENT_HIGHLIGHTS]: {
    type: SECTION_TYPES.INGREDIENT_HIGHLIGHTS,
    label: 'Ingredient Highlights',
    description: 'Clean-label ingredient showpiece for grocery, food & beauty stores',
    category: 'editorial',
    isRequired: false,
    isDeletable: true,
    icon: 'Leaf',
    defaultConfig: {
      title: 'Key Ingredients',
      subtitle: 'Purity you can trace, batch after batch',
      ingredients: [
        { name: 'Cold-Pressed Virgin Oils', benefit: 'Extracted without heat for maximum nutrition', tag: '100% Pure' },
        { name: 'Single-Origin Spices', benefit: 'Grown without chemical pesticides', tag: 'Organic' },
        { name: 'Traditional Grains', benefit: 'Naturally polished, never bleached', tag: 'House Special' },
      ],
      animation: 'none',
    },
  },
} as const;

export function isValidSectionType(type: string): type is SectionType {
  return VALID_SECTION_TYPES.includes(type);
}

export function getSectionDefinition(type: string): SectionDefinition | undefined {
  return COMPONENT_REGISTRY[type as SectionType];
}

export function createDefaultSection(type: SectionType, id?: string): {
  id: string;
  type: SectionType;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
} {
  const def = COMPONENT_REGISTRY[type];
  if (!def) {
    throw new Error(`Unknown section type: ${type}`);
  }
  return {
    id: id || `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    config: { ...def.defaultConfig },
    visible: true,
    order: 0,
  };
}
