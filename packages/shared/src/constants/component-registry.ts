export const SECTION_TYPES = {
  ANNOUNCEMENT: 'announcement',
  HERO: 'hero',
  CATEGORIES: 'categories',
  FEATURED_PRODUCTS: 'featured-products',
  PRODUCT_GRID: 'product-grid',
  BANNER: 'banner',
  ABOUT: 'about',
  TRUST: 'trust',
  TESTIMONIALS: 'testimonials',
  FAQ: 'faq',
  CONTACT: 'contact',
  FOOTER: 'footer',
} as const;

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

export const VALID_SECTION_TYPES: readonly string[] = Object.values(SECTION_TYPES);

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  isRequired: boolean;
  isDeletable: boolean;
  icon: string;
  defaultConfig: Record<string, unknown>;
}

export const COMPONENT_REGISTRY: Record<SectionType, SectionDefinition> = {
  [SECTION_TYPES.ANNOUNCEMENT]: {
    type: SECTION_TYPES.ANNOUNCEMENT,
    label: 'Announcement Bar',
    description: 'Top bar with promotional text and optional link',
    isRequired: false,
    isDeletable: true,
    icon: 'Megaphone',
    defaultConfig: {
      text: 'Welcome to our store!',
      link: '',
      visible: true,
      bgColor: '#0f172a',
      textColor: '#fbbf24',
    },
  },
  [SECTION_TYPES.HERO]: {
    type: SECTION_TYPES.HERO,
    label: 'Hero Banner',
    description: 'Large hero section with title, subtitle, image and CTA',
    isRequired: true,
    isDeletable: false,
    icon: 'Image',
    defaultConfig: {
      title: 'Welcome to Our Store',
      subtitle: 'Quality products delivered to your doorstep',
      imageUrl: '',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      alignment: 'center',
      height: 'medium',
      overlayOpacity: 40,
    },
  },
  [SECTION_TYPES.CATEGORIES]: {
    type: SECTION_TYPES.CATEGORIES,
    label: 'Category Showcase',
    description: 'Automatically displays your product categories',
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
    },
  },
  [SECTION_TYPES.FEATURED_PRODUCTS]: {
    type: SECTION_TYPES.FEATURED_PRODUCTS,
    label: 'Featured Products',
    description: 'Showcase selected products from your catalog',
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
    },
  },
  [SECTION_TYPES.PRODUCT_GRID]: {
    type: SECTION_TYPES.PRODUCT_GRID,
    label: 'Product Grid',
    description: 'Full product catalog grid with filters',
    isRequired: false,
    isDeletable: true,
    icon: 'Grid3x3',
    defaultConfig: {
      title: 'All Products',
      columns: 3,
      showFilters: true,
      showSort: true,
    },
  },
  [SECTION_TYPES.BANNER]: {
    type: SECTION_TYPES.BANNER,
    label: 'Promotional Banner',
    description: 'Promotional section with heading, description and CTA',
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
    },
  },
  [SECTION_TYPES.ABOUT]: {
    type: SECTION_TYPES.ABOUT,
    label: 'About Section',
    description: 'Tell customers about your business',
    isRequired: false,
    isDeletable: true,
    icon: 'Info',
    defaultConfig: {
      title: 'About Us',
      description: 'We are a family-owned business dedicated to bringing you the finest products.',
      imageUrl: '',
      layout: 'left',
    },
  },
  [SECTION_TYPES.TRUST]: {
    type: SECTION_TYPES.TRUST,
    label: 'Trust Badges',
    description: 'Display trust signals like secure payments and quality guarantees',
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
    },
  },
  [SECTION_TYPES.TESTIMONIALS]: {
    type: SECTION_TYPES.TESTIMONIALS,
    label: 'Testimonials',
    description: 'Customer reviews and testimonials',
    isRequired: false,
    isDeletable: true,
    icon: 'MessageSquare',
    defaultConfig: {
      title: 'What Our Customers Say',
      testimonials: [
        { name: 'Priya S.', text: 'Amazing quality products! Will order again.', rating: 5 },
        { name: 'Rahul M.', text: 'Fast delivery and great customer service.', rating: 5 },
        { name: 'Anita K.', text: 'Best online shopping experience in India.', rating: 4 },
      ],
    },
  },
  [SECTION_TYPES.FAQ]: {
    type: SECTION_TYPES.FAQ,
    label: 'FAQ',
    description: 'Frequently asked questions section',
    isRequired: false,
    isDeletable: true,
    icon: 'HelpCircle',
    defaultConfig: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'What payment methods do you accept?', answer: 'We accept Cash, UPI, and Khata credit payments.' },
        { question: 'How long does delivery take?', answer: 'We typically dispatch orders within 24-48 hours.' },
        { question: 'Do you offer GST invoices?', answer: 'Yes, all orders come with proper GST tax invoices.' },
      ],
    },
  },
  [SECTION_TYPES.CONTACT]: {
    type: SECTION_TYPES.CONTACT,
    label: 'Contact / Support',
    description: 'Display customer support information',
    isRequired: false,
    isDeletable: true,
    icon: 'Phone',
    defaultConfig: {
      title: 'Get in Touch',
      showPhone: true,
      showEmail: true,
      showAddress: true,
      showHours: true,
    },
  },
  [SECTION_TYPES.FOOTER]: {
    type: SECTION_TYPES.FOOTER,
    label: 'Footer',
    description: 'Store footer with links and business info',
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
  return {
    id: id || `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    config: { ...def.defaultConfig },
    visible: true,
    order: 0,
  };
}
