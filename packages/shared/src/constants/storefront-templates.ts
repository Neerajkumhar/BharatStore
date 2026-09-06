import { SECTION_TYPES, type SectionType, createDefaultSection } from './component-registry';

export interface StorefrontTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
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
    name: 'Minimal',
    description: 'Clean, simple commerce storefront focused on products',
    category: 'general',
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
    name: 'Fashion',
    description: 'Perfect for clothing, sarees, apparel and accessories',
    category: 'fashion',
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
    name: 'Electronics',
    description: 'Ideal for electronics, mobile accessories and gadgets',
    category: 'electronics',
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
    name: 'Grocery',
    description: 'Great for food, grains, household and daily essentials',
    category: 'grocery',
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
    name: 'Beauty',
    description: 'Perfect for cosmetics, skincare and salon products',
    category: 'beauty',
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
    name: 'General Store',
    description: 'Flexible template for any business or multi-category store',
    category: 'general',
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
