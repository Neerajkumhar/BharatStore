import { z } from 'zod';
import { SECTION_TYPES, VALID_SECTION_TYPES } from '../constants/component-registry';

const imageUrlSchema = z.string().max(2048).refine(
  (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
  { message: 'Must be a valid HTTP/HTTPS URL' }
).optional().nullable();

const safeTextSchema = z.string().max(500).optional().nullable();

// Section-level config schemas
export const announcementConfigSchema = z.object({
  text: z.string().max(200).default('Welcome to our store!'),
  link: imageUrlSchema,
  visible: z.boolean().default(true),
  bgColor: z.string().max(20).default('#0f172a'),
  textColor: z.string().max(20).default('#fbbf24'),
});

export const heroConfigSchema = z.object({
  title: z.string().max(200).default('Welcome to Our Store'),
  subtitle: z.string().max(500).default('Quality products delivered to your doorstep'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Shop Now'),
  ctaLink: z.string().max(200).default('/products'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  height: z.enum(['small', 'medium', 'large']).default('medium'),
  overlayOpacity: z.number().min(0).max(100).default(40),
});

export const categoriesConfigSchema = z.object({
  title: z.string().max(200).default('Shop by Category'),
  subtitle: z.string().max(500).default('Browse our curated collections'),
  layout: z.enum(['grid', 'carousel']).default('grid'),
  columns: z.number().min(2).max(6).default(6),
  showProductCount: z.boolean().default(true),
  limit: z.number().min(1).max(20).default(6),
});

export const featuredProductsConfigSchema = z.object({
  title: z.string().max(200).default('Featured Products'),
  subtitle: z.string().max(500).default('Handpicked just for you'),
  selectionMode: z.enum(['newest', 'featured', 'category', 'manual']).default('newest'),
  categoryId: z.string().optional().nullable(),
  productIds: z.array(z.string()).optional().default([]),
  limit: z.number().min(1).max(20).default(8),
  layout: z.enum(['grid', 'carousel']).default('grid'),
  columns: z.number().min(2).max(4).default(4),
});

export const productGridConfigSchema = z.object({
  title: z.string().max(200).default('All Products'),
  columns: z.number().min(2).max(4).default(3),
  showFilters: z.boolean().default(true),
  showSort: z.boolean().default(true),
});

export const bannerConfigSchema = z.object({
  heading: z.string().max(200).default('Special Offer'),
  description: z.string().max(1000).default('Check out our latest deals'),
  imageUrl: imageUrlSchema,
  ctaText: z.string().max(50).default('Shop Now'),
  ctaLink: z.string().max(200).default('/products'),
  bgColor: z.string().max(20).default('#fef3c7'),
  textColor: z.string().max(20).default('#92400e'),
  layout: z.enum(['left', 'center', 'right']).default('left'),
});

export const aboutConfigSchema = z.object({
  title: z.string().max(200).default('About Us'),
  description: z.string().max(2000).default('We are a family-owned business dedicated to quality.'),
  imageUrl: imageUrlSchema,
  layout: z.enum(['left', 'right', 'center']).default('left'),
});

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
});

export const contactConfigSchema = z.object({
  title: z.string().max(200).default('Get in Touch'),
  showPhone: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showAddress: z.boolean().default(true),
  showHours: z.boolean().default(true),
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

// Section config validator by type
export function validateSectionConfig(type: string, config: Record<string, unknown>) {
  const schemas: Record<string, z.ZodType> = {
    [SECTION_TYPES.ANNOUNCEMENT]: announcementConfigSchema,
    [SECTION_TYPES.HERO]: heroConfigSchema,
    [SECTION_TYPES.CATEGORIES]: categoriesConfigSchema,
    [SECTION_TYPES.FEATURED_PRODUCTS]: featuredProductsConfigSchema,
    [SECTION_TYPES.PRODUCT_GRID]: productGridConfigSchema,
    [SECTION_TYPES.BANNER]: bannerConfigSchema,
    [SECTION_TYPES.ABOUT]: aboutConfigSchema,
    [SECTION_TYPES.TRUST]: trustConfigSchema,
    [SECTION_TYPES.TESTIMONIALS]: testimonialsConfigSchema,
    [SECTION_TYPES.FAQ]: faqConfigSchema,
    [SECTION_TYPES.CONTACT]: contactConfigSchema,
    [SECTION_TYPES.FOOTER]: footerConfigSchema,
  };
  const schema = schemas[type];
  if (!schema) return { success: false, error: `Unknown section type: ${type}` };
  return schema.safeParse(config);
}
