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
  {
    id: 'minimal',
    name: 'Minimal Commerce',
    description: 'Clean, simple commerce storefront focused purely on products',
    category: 'general',
    style: 'minimal',
    layout: 'centered',
    tags: ['clean', 'simple', 'products', 'minimal', 'general'],
    popular: true,
    preview: {
      bgColor: '#f8fafc',
      accentColor: '#0f172a',
      sections: [SECTION_TYPES.HERO, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.HERO, configOverrides: { height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Our Products', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion Editorial',
    description: 'High-impact editorial layout for clothing, sarees, apparel and accessories',
    category: 'fashion',
    style: 'editorial',
    layout: 'centered',
    tags: ['clothing', 'sarees', 'apparel', 'couture', 'fashion'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#fefce8',
      accentColor: '#a16207',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Free shipping on orders above ₹999!' } },
      { type: SECTION_TYPES.HERO, configOverrides: { height: 'large', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Collection', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Trending Now', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Summer Collection', description: 'Explore our latest seasonal styles', layout: 'center', bgColor: '#fef3c7', textColor: '#92400e' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Style Inspo from Our Customers' } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Shopping Help', items: [
        { question: 'What sizes are available?', answer: 'We offer sizes from XS to 3XL. Check individual product pages for size charts.' },
        { question: 'Do you offer exchanges?', answer: 'Yes, we offer free exchanges within 7 days of delivery.' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'electronics',
    name: 'Tech Store',
    description: 'Ideal for electronics, mobile accessories and gadgets',
    category: 'electronics',
    style: 'modern',
    layout: 'left-aligned',
    tags: ['electronics', 'mobile', 'accessories', 'tech'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#f0f9ff',
      accentColor: '#2563eb',
      sections: [SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.HERO, configOverrides: { height: 'medium', alignment: 'left' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Category', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Best Sellers', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'New Arrivals', description: 'Check out the latest tech at best prices', layout: 'left', bgColor: '#eff6ff', textColor: '#1e40af' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: 'Genuine Products', description: '100% authentic items' },
        { icon: 'FileText', title: 'GST Invoice', description: 'Tax invoice with every order' },
        { icon: 'Truck', title: 'Fast Shipping', description: 'Dispatched within 24 hours' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day return policy' },
      ] } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Product FAQs', items: [
        { question: 'Are products covered under warranty?', answer: 'Yes, all electronics come with manufacturer warranty.' },
        { question: 'Do you offer EMI options?', answer: 'Currently we support Cash, UPI, and Khata credit payments.' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'grocery',
    name: 'Fresh Grocery',
    description: 'Great for food, grains, household and daily essentials',
    category: 'grocery',
    style: 'modern',
    layout: 'compact',
    tags: ['food', 'grains', 'daily', 'essentials', 'grocery'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#f0fdf4',
      accentColor: '#16a34a',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Fresh daily essentials delivered to your door!', bgColor: '#14532d', textColor: '#bbf7d0' } },
      { type: SECTION_TYPES.HERO, configOverrides: { height: 'small', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Category', columns: 6, limit: 6 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Daily Essentials', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Bulk Orders Welcome', description: 'Special prices for bulk and wholesale orders', layout: 'center', bgColor: '#dcfce7', textColor: '#166534' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: 'Quality Assured', description: 'Fresh & genuine products' },
        { icon: 'Truck', title: 'Same Day Delivery', description: 'Order before 2 PM' },
        { icon: 'CreditCard', title: 'Pay on Delivery', description: 'Cash & UPI accepted' },
        { icon: 'FileText', title: 'GST Invoice', description: 'For all orders' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Cosmetics',
    description: 'Perfect for cosmetics, skincare and salon products',
    category: 'beauty',
    style: 'editorial',
    layout: 'centered',
    tags: ['cosmetics', 'makeup', 'skincare', 'beauty'],
    featured: true,
    preview: {
      bgColor: '#fdf2f8',
      accentColor: '#db2777',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.ABOUT, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Flat 15% off on your first order! Use code BEAUTY15', bgColor: '#831843', textColor: '#fbcfe8' } },
      { type: SECTION_TYPES.HERO, configOverrides: { height: 'large', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Category', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Bestsellers', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Beauty Secrets Shared by Our Customers' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Our Beauty Promise', description: 'We curate only the finest beauty and skincare products, sourced directly from trusted brands.', layout: 'left' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'general',
    name: 'Modern General Store',
    description: 'Flexible template for any business or multi-category store',
    category: 'general',
    style: 'classic',
    layout: 'full',
    tags: ['general', 'multi-category', 'versatile', 'store', 'everything'],
    featured: true,
    preview: {
      bgColor: '#f8fafc',
      accentColor: '#d97706',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.ABOUT, SECTION_TYPES.TRUST, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FAQ, SECTION_TYPES.CONTACT, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.HERO, configOverrides: { height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Category', columns: 6, limit: 6 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Featured Products', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Special Offers', description: 'Check out our latest deals', layout: 'center' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'About Us', description: 'We are dedicated to bringing you the best products at great prices.', layout: 'left' } },
      { type: SECTION_TYPES.TRUST, configOverrides: {} },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: {} },
      { type: SECTION_TYPES.FAQ, configOverrides: {} },
      { type: SECTION_TYPES.CONTACT, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Bold, youth-driven layout built around limited drops and hype releases',
    category: 'fashion',
    style: 'playful',
    layout: 'left-aligned',
    tags: ['street', 'urban', 'youth', 'graphic', 'drop'],
    isNew: true,
    preview: {
      bgColor: '#fafafa',
      accentColor: '#84cc16',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'NEW DROP — Limited Edits Live Now', bgColor: '#09090b', textColor: '#ecfccb' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Limited Drop. Grab It Before It\u2019s Gone.', subtitle: 'Fresh street styles, sized to sell out.', ctaText: 'Shop the Drop', height: 'large', alignment: 'left' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop the Catalog', columns: 4, limit: 4, showProductCount: true } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Latest Drops', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Only XXL Left', description: 'Final call on our bestselling street edits', layout: 'right', bgColor: '#ecfccb', textColor: '#14532d', ctaText: 'Run It' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'Truck', title: 'Fast Dispatch', description: 'Shipped within 24 hours' },
        { icon: 'RefreshCw', title: '7-Day Exchange', description: 'Free size swaps' },
        { icon: 'CreditCard', title: 'COD Available', description: 'Cash on delivery' },
        { icon: 'Star', title: 'Rated 4.8/5', description: 'By 2,000+ customers' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: { valueProps: [
        { icon: 'Truck', title: 'Same-Day Dispatch', description: 'For orders before 6 PM' },
        { icon: 'RefreshCw', title: 'Easy Exchange', description: 'Within 7 days' },
        { icon: 'CreditCard', title: 'Pay Your Way', description: 'UPI, Cards & COD' },
        { icon: 'ShieldCheck', title: 'GST Invoice', description: 'On every order' },
      ] } },
    ],
  },
  {
    id: 'boutique',
    name: 'Boutique',
    description: 'Elegant, handcrafted feel for ethnic wear and curated gift stores',
    category: 'fashion',
    style: 'classic',
    layout: 'centered',
    tags: ['handcrafted', 'ethnic', 'elegant', 'boutique'],
    featured: true,
    preview: {
      bgColor: '#fff7ed',
      accentColor: '#c2410c',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.ABOUT, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Handcrafted pieces, made to be loved', bgColor: '#431407', textColor: '#fed7aa' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Slow-Made Styles for Everyday Grace.', subtitle: 'Curated fabrics, thoughtful craft', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Curated Collections', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'The Boutique Edit', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Seasonal Weaves', description: 'Handloom favourites, back in stock', layout: 'center', bgColor: '#ffedd5', textColor: '#9a3412' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Client Love' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Our Craft Story', description: 'Each piece is handpicked and crafted with local artisans, bringing heritage to your wardrobe.', layout: 'left' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: { valueProps: [
        { icon: 'HeartHandshake', title: 'Local Artisans', description: 'Every piece handcrafted' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day no-questions asked' },
        { icon: 'CreditCard', title: 'Flexible Payments', description: 'UPI, Cards & Khata' },
        { icon: 'FileText', title: 'GST Invoice', description: 'On every order' },
      ] } },
    ],
  },
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
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.ABOUT, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Complimentary shipping on orders above ₹5,000', bgColor: '#0a0a0a', textColor: '#e7e5e4' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Quiet Luxury, Defined.', subtitle: 'Considered pieces crafted to last generations', height: 'large', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Ateliers', columns: 3, limit: 3 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'The Collection', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Private Appointments', description: 'By request in-store and online', layout: 'right', bgColor: '#e7e5e4', textColor: '#292524' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'In Their Words' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Maison Story', description: 'Three generations of mastery in craft, design and material selection.', layout: 'right' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {
        showValueProps: false,
        showSocialLinks: true,
        showCopyright: true,
      } },
    ],
  },
  {
    id: 'electronics-marketplace',
    name: 'Electronics Marketplace',
    description: 'Multi-brand marketplace layout with dense grids and deal-led sections',
    category: 'electronics',
    style: 'modern',
    layout: 'full',
    tags: ['marketplace', 'multi-brand', 'deals', 'electronics'],
    featured: true,
    isNew: true,
    preview: {
      bgColor: '#f8fafc',
      accentColor: '#2563eb',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Free delivery above ₹499 • EMI available', bgColor: '#0f172a', textColor: '#dbeafe' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Every Brand. One Roof.', subtitle: 'Compare prices across a full marketplace of brands', height: 'small', alignment: 'left' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Department', columns: 6, limit: 6, showProductCount: true } },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'Top Deals This Week', columns: 3 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Flash Sale', description: '48-hour price drops on leading brands', layout: 'left', bgColor: '#eff6ff', textColor: '#1e40af', ctaText: 'Shop Deals' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: 'Genuine Products', description: '100% authentic' },
        { icon: 'Truck', title: 'Fast Shipping', description: 'Pan-India delivery' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day return policy' },
        { icon: 'FileText', title: 'GST Invoice', description: 'On every order' },
      ] } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Buying FAQs', items: [
        { question: 'Are products brand genuine?', answer: 'Yes, everything is sourced directly from authorized distributors.' },
        { question: 'Is EMI available on all items?', answer: 'EMI is available on orders above ₹5,000.' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'gadgets',
    name: 'Gadgets',
    description: 'Bright, fun store for audio, wearables and smart accessories',
    category: 'electronics',
    style: 'playful',
    layout: 'centered',
    tags: ['gadgets', 'audio', 'wearables', 'accessories'],
    popular: true,
    isNew: true,
    preview: {
      bgColor: '#f5f3ff',
      accentColor: '#7c3aed',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: '20% off accessories • Code GADGET20', bgColor: '#1e1b4b', textColor: '#ddd6fe' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Gear Up. Stand Out.', subtitle: 'The latest in audio, wearables and smart gear', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop Gadgets', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Trending Now', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Accessorize', description: 'Cables, cases & carry for your daily gear', layout: 'center', bgColor: '#ede9fe', textColor: '#5b21b6' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: '1-Year Warranty', description: 'On all electronics' },
        { icon: 'Truck', title: 'Fast Shipping', description: 'Dispatched in 24 hours' },
        { icon: 'CreditCard', title: 'Secure Checkout', description: 'UPI, cards & Khata' },
        { icon: 'RefreshCw', title: '7-Day Returns', description: 'No-questions asked' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: { valueProps: [
        { icon: 'ShieldCheck', title: 'Warranty Covered', description: '1-year standard warranty' },
        { icon: 'Truck', title: 'Express Dispatch', description: 'Within 24 hours' },
        { icon: 'CreditCard', title: 'Pay Your Way', description: 'UPI, cards, COD' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day replacement' },
      ] } },
    ],
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    description: 'Structured aisle-based layout with offers and weekly deals',
    category: 'grocery',
    style: 'modern',
    layout: 'compact',
    tags: ['supermarket', 'aisles', 'staples', 'household'],
    popular: true,
    preview: {
      bgColor: '#f0fdf4',
      accentColor: '#16a34a',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Monsoon Season Sale: Upto 35% off staples', bgColor: '#14532d', textColor: '#bbf7d0' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Daily Essentials, Delivered Fresh.', height: 'small', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop by Aisle', columns: 6, limit: 6, showProductCount: true } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Everyday Staples', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'Big Basket Deals', columns: 3 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Mega Savings Week', description: 'Up to 40% off household must-haves', layout: 'center', bgColor: '#dcfce7', textColor: '#166534' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'Truck', title: 'Same-Day Delivery', description: 'Order before 2 PM' },
        { icon: 'ShieldCheck', title: 'Quality Assured', description: 'Fresh & sealed' },
        { icon: 'CreditCard', title: 'Pay on Delivery', description: 'Cash & UPI' },
        { icon: 'FileText', title: 'GST Invoice', description: 'For all orders' },
      ] } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Delivery FAQs', items: [
        { question: 'How fast is delivery?', answer: 'Same-day delivery for orders placed before 2 PM.' },
        { question: 'Can I get a GST invoice?', answer: 'Yes, every order includes a proper GST tax invoice.' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'organic',
    name: 'Organic Store',
    description: 'Earthy, natural aesthetic for organic and pesticide-free products',
    category: 'grocery',
    style: 'classic',
    layout: 'centered',
    tags: ['organic', 'natural', 'farm', 'pesticide-free'],
    featured: true,
    preview: {
      bgColor: '#f7fee7',
      accentColor: '#65a30d',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.ABOUT, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: '100% certified organic • No pesticides', bgColor: '#1a2e05', textColor: '#d9f99d' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Grown Without Chemicals.', subtitle: 'Straight from partner farms to your kitchen', height: 'medium', alignment: 'left' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Farm to Home Promise', description: 'We work directly with certified organic farms, so you know exactly where your food comes from.', layout: 'left' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Shop Organic', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Harvest Favourites', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'From the Community' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: { valueProps: [
        { icon: 'ShieldCheck', title: 'Pesticide-Free', description: 'Certified organic produce' },
        { icon: 'Truck', title: 'Farm-To-Door', description: 'Cold-chain delivery' },
        { icon: 'CreditCard', title: 'Cash on Delivery', description: 'Pay when it arrives' },
        { icon: 'FileText', title: 'GST Invoice', description: 'On every order' },
      ] } },
    ],
  },
  {
    id: 'skincare',
    name: 'Skincare',
    description: 'Clean, calm aesthetic for serum, cream and routine products',
    category: 'beauty',
    style: 'minimal',
    layout: 'centered',
    tags: ['skincare', 'clean-beauty', 'serums', 'glow'],
    isNew: true,
    preview: {
      bgColor: '#f0fdfa',
      accentColor: '#0d9488',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.ABOUT, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Clean beauty • Cruelty free • Derm-tested', bgColor: '#134e4a', textColor: '#99f6e4' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Skin, Restored.', subtitle: 'Calm, science-backed routines for every skin type', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Routines', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Best for Your Skin', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'The Glow Standard', description: 'Formulated with clinically-backed actives and dermatologist-approved ingredients.', layout: 'right' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Real Routines' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'salon',
    name: 'Salon / Beauty Shop',
    description: 'Dramatic, pro-grade look for salon products and tools',
    category: 'beauty',
    style: 'editorial',
    layout: 'centered',
    tags: ['salon', 'pro-beauty', 'tools', 'makeup'],
    featured: true,
    preview: {
      bgColor: '#fff1f2',
      accentColor: '#be185d',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Pro-grade tools • Upto 40% off', bgColor: '#18181b', textColor: '#fbcfe8' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Salon Results, At Home.', subtitle: 'Professional tools and formulas for a legendary look', height: 'large', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Salon Essentials', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Pro Picks', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Glow Up Set', description: 'Stage-ready kits curated by expert stylists', layout: 'center', bgColor: '#fce7f3', textColor: '#9d174d', ctaText: 'Shop the Set' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: '100% Authentic', description: 'Straight from brands' },
        { icon: 'Truck', title: 'Express Shipping', description: 'Dispatched in 24 hours' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day policy' },
        { icon: 'CreditCard', title: 'Secure Checkout', description: 'UPI, cards & COD' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant / Food Store',
    description: 'Warm, appetite-driven layout for restaurants and food stores',
    category: 'food',
    style: 'classic',
    layout: 'centered',
    tags: ['restaurant', 'chef', 'foodie', 'specials'],
    featured: true,
    popular: true,
    preview: {
      bgColor: '#fef2f2',
      accentColor: '#b91c1c',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Same-day delivery across the city', bgColor: '#1c1917', textColor: '#fecaca' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Taste That Remembers Home.', subtitle: 'Chef-crafted specials delivered hot to your door', height: 'large', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Explore the Menu', columns: 6, limit: 6 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Chef\u2019s Specials', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Order Before 8 PM', description: 'For dinner delivery the same evening', layout: 'center', bgColor: '#fee2e2', textColor: '#991b1b' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'From Our Foodies' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Soft, warm layout for bakeries, patisseries and dessert shops',
    category: 'food',
    style: 'classic',
    layout: 'centered',
    tags: ['bakery', 'fresh', 'bread', 'desserts'],
    isNew: true,
    preview: {
      bgColor: '#fffbeb',
      accentColor: '#d97706',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.ABOUT, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Freshly baked every morning at 7 AM', bgColor: '#451a03', textColor: '#fde68a' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Baked Today, Gone Tomorrow.', subtitle: 'Small-batch breads, cakes and pastries', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Baked Daily', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Fresh Batch', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Our Ovens, Our Pride', description: 'Slow-fermented doughs and real butter — nothing artificial, ever.', layout: 'center' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: 'Baked Fresh Daily', description: 'No day-old stock' },
        { icon: 'Truck', title: 'Order by 9 PM', description: 'Morning delivery' },
        { icon: 'HeartHandshake', title: 'Eggless Options', description: 'A full eggless range' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'cafe',
    name: 'Café',
    description: 'Cosy coffee-house feel for cafés, roasters and brunch spots',
    category: 'food',
    style: 'minimal',
    layout: 'left-aligned',
    tags: ['cafe', 'coffee', 'brunch', 'beans'],
    popular: true,
    preview: {
      bgColor: '#fafaf9',
      accentColor: '#b45309',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.BANNER, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Free delivery on orders above ₹299' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Slow Coffee. Fresh Words.', subtitle: 'Single-origin beans, roasted in small batches', height: 'small', alignment: 'left' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'The Menu', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'All-Day Menu', columns: 3 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Happy Hours 3–6 PM', description: 'Flat 20% off signature pours', layout: 'center', bgColor: '#f5f5f4', textColor: '#44403c' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'Regulars Say' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    description: 'Warm, curated layout for home decor and lifestyle goods',
    category: 'home',
    style: 'classic',
    layout: 'centered',
    tags: ['home', 'decor', 'living', 'curated'],
    featured: true,
    preview: {
      bgColor: '#fafaf9',
      accentColor: '#a16207',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.ABOUT, SECTION_TYPES.TESTIMONIALS, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Curated pieces for a calmer home', bgColor: '#292524', textColor: '#fde68a' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Home, Made Thoughtful.', subtitle: 'Considered designs that turn a house into home', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Rooms & Spaces', columns: 4, limit: 4 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'The Lookbook', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'New Season', description: 'Warm tones for cooler evenings', layout: 'center', bgColor: '#f5f5f4', textColor: '#57534e' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Our Design Philosophy', description: 'We believe a home should feel lived-in and loved — so every piece is chosen with intention.', layout: 'left' } },
      { type: SECTION_TYPES.TESTIMONIALS, configOverrides: { title: 'A Closer Look' } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Spacious, minimal layout for furniture and large-format home goods',
    category: 'home',
    style: 'minimal',
    layout: 'full',
    tags: ['furniture', 'sofa', 'tables', 'minimal'],
    featured: true,
    isNew: true,
    preview: {
      bgColor: '#f5f5f4',
      accentColor: '#b45309',
      sections: [SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.ABOUT, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Rooms Designed to Breathe.', subtitle: 'Solid timber pieces built for the long term', height: 'large', alignment: 'left' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Collections', columns: 3, limit: 3 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Signature Pieces', selectionMode: 'newest', limit: 6, columns: 3 } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Crafted for the Long Term', description: 'Solid timber, honest joinery and finishes designed to age beautifully.', layout: 'right' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: 'Solid Wood', description: 'No particle board' },
        { icon: 'Truck', title: '7-Day Delivery', description: 'Doorstep assembly' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '30-day policy' },
        { icon: 'Headphones', title: 'Lifetime Support', description: 'Care for 10+ years' },
      ] } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Delivery & Care', items: [
        { question: 'Do you assemble furniture?', answer: 'Yes, white-glove delivery includes full assembly in your room.' },
        { question: 'What is your return policy?', answer: 'Unopened items can be returned within 30 days.' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Store',
    description: 'Trend-led, modern layout mixing categories with new-arrival grids',
    category: 'home',
    style: 'modern',
    layout: 'centered',
    tags: ['lifestyle', 'trendy', 'new-arrivals', 'mix'],
    popular: true,
    preview: {
      bgColor: '#f5f3ff',
      accentColor: '#6366f1',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.PRODUCT_GRID, SECTION_TYPES.TRUST, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'New season • Shop the lookbooks', bgColor: '#1e1b4b', textColor: '#c7d2fe' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Live Modern. Live You.', subtitle: 'Everyday pieces, beautifully made', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Curate by Category', columns: 6, limit: 6 } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Bestsellers', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'The Lifestyle Edit', description: 'Handpicked pieces to refresh your everyday', layout: 'center', bgColor: '#e0e7ff', textColor: '#3730a3' } },
      { type: SECTION_TYPES.PRODUCT_GRID, configOverrides: { title: 'New Arrivals', columns: 3 } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'ShieldCheck', title: 'Quality Assured', description: 'Every piece checked' },
        { icon: 'Truck', title: 'Fast Dispatch', description: 'Within 24 hours' },
        { icon: 'CreditCard', title: 'Secure Payments', description: 'UPI, cards & COD' },
        { icon: 'FileText', title: 'GST Invoice', description: 'On every order' },
      ] } },
      { type: SECTION_TYPES.FOOTER, configOverrides: {} },
    ],
  },
  {
    id: 'bharat-business',
    name: 'Bharat Business',
    description: 'Festive, high-energy layout built for Indian multi-category retail',
    category: 'general',
    style: 'modern',
    layout: 'compact',
    tags: ['bharat', 'festive', 'bargain', 'local', 'desi'],
    featured: true,
    popular: true,
    isNew: true,
    preview: {
      bgColor: '#fff7ed',
      accentColor: '#ea580c',
      sections: [SECTION_TYPES.ANNOUNCEMENT, SECTION_TYPES.HERO, SECTION_TYPES.CATEGORIES, SECTION_TYPES.FEATURED_PRODUCTS, SECTION_TYPES.BANNER, SECTION_TYPES.ABOUT, SECTION_TYPES.TRUST, SECTION_TYPES.FAQ, SECTION_TYPES.CONTACT, SECTION_TYPES.FOOTER],
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
      { type: SECTION_TYPES.ANNOUNCEMENT, configOverrides: { text: 'Big Bharat Sale live — Upto 70% off', bgColor: '#7c2d12', textColor: '#fed7aa' } },
      { type: SECTION_TYPES.HERO, configOverrides: { title: 'Desi Deals, Dil Se.', subtitle: 'Everything your home needs, at honest prices', height: 'medium', alignment: 'center' } },
      { type: SECTION_TYPES.CATEGORIES, configOverrides: { title: 'Popular Categories', columns: 6, limit: 6, showProductCount: true } },
      { type: SECTION_TYPES.FEATURED_PRODUCTS, configOverrides: { title: 'Bestsellers', selectionMode: 'newest', limit: 8, columns: 4 } },
      { type: SECTION_TYPES.BANNER, configOverrides: { heading: 'Monsoon Offers', description: 'Seasonal discounts across the store', layout: 'center', bgColor: '#ffedd5', textColor: '#c2410c' } },
      { type: SECTION_TYPES.ABOUT, configOverrides: { title: 'Vocal for Local', description: 'Sourced from local makers and trusted distributors, delivered with a Bharatiya touch.', layout: 'left' } },
      { type: SECTION_TYPES.TRUST, configOverrides: { badges: [
        { icon: 'CreditCard', title: 'COD Available', description: 'Cash on delivery' },
        { icon: 'Star', title: 'Top-Rated Service', description: '4.8/5 from 5,000+ reviews' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day replacement' },
        { icon: 'FileText', title: 'GST Invoice', description: 'B2B & B2C ready' },
      ] } },
      { type: SECTION_TYPES.FAQ, configOverrides: { title: 'Shopping FAQs', items: [
        { question: 'Do you support khata / credit billing?', answer: 'Yes, registered business customers can avail khata credit on orders.' },
        { question: 'Can I pay cash on delivery?', answer: 'Yes, COD is available across most pincodes.' },
      ] } },
      { type: SECTION_TYPES.CONTACT, configOverrides: {} },
      { type: SECTION_TYPES.FOOTER, configOverrides: { valueProps: [
        { icon: 'CreditCard', title: 'COD Available', description: 'Pay when it arrives' },
        { icon: 'RefreshCw', title: 'Easy Returns', description: '7-day policy' },
        { icon: 'FileText', title: 'GST Invoice', description: 'On every order' },
        { icon: 'ShieldCheck', title: 'Trusted & Local', description: 'Backed by local makers' },
      ] } },
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