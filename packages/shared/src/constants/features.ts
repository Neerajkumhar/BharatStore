export const FEATURE_FLAGS = {
  POS_COUNTER: 'pos_counter',
  GST_INVOICING: 'gst_invoicing',
  THERMAL_RECEIPT: 'thermal_receipt',
  STOREFRONT_BUILDER: 'storefront_builder',
  CUSTOM_DOMAIN: 'custom_domain',
  WHATSAPP_BROADCAST: 'whatsapp_broadcast',
  ABANDONED_CART: 'abandoned_cart',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  GSTR1_EXPORT: 'gstr1_export',
  BULK_IMPORT_EXPORT: 'bulk_import_export',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  PRIORITY_SUPPORT: 'priority_support',
  CUSTOM_ROLES: 'custom_roles',
} as const;

export type FeatureSlug = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

export interface FeatureFlagDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  isPlatformWide: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    slug: FEATURE_FLAGS.POS_COUNTER,
    name: 'POS Counter',
    description: 'Counter billing terminal for walk-in sales.',
    category: 'commerce',
    isPlatformWide: true,
  },
  {
    slug: FEATURE_FLAGS.GST_INVOICING,
    name: 'GST Invoicing',
    description: 'GST-compliant tax invoices with CGST/SGST/IGST breakdown.',
    category: 'finance',
    isPlatformWide: true,
  },
  {
    slug: FEATURE_FLAGS.STOREFRONT_BUILDER,
    name: 'Storefront Builder',
    description: 'No-code visual storefront page builder.',
    category: 'storefront',
    isPlatformWide: true,
  },
  {
    slug: FEATURE_FLAGS.THERMAL_RECEIPT,
    name: 'Thermal Receipt Printing',
    description: '80mm thermal receipt printing for POS counters.',
    category: 'commerce',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.CUSTOM_DOMAIN,
    name: 'Custom Domain',
    description: 'Connect your own domain with auto-SSL.',
    category: 'storefront',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.WHATSAPP_BROADCAST,
    name: 'WhatsApp Broadcast',
    description: 'WhatsApp campaign broadcasts to customers.',
    category: 'marketing',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.ABANDONED_CART,
    name: 'Abandoned Cart Recovery',
    description: 'Automated WhatsApp nudges for abandoned carts.',
    category: 'marketing',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.ADVANCED_ANALYTICS,
    name: 'Advanced Analytics',
    description: 'Deep sales, product, and cohort analytics reports.',
    category: 'analytics',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.GSTR1_EXPORT,
    name: 'GSTR-1 Export',
    description: 'Monthly GSTR-1 filing-ready CSV export.',
    category: 'finance',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.BULK_IMPORT_EXPORT,
    name: 'Bulk Import/Export',
    description: 'Bulk CSV import and export of product catalog.',
    category: 'commerce',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.API_ACCESS,
    name: 'API Access',
    description: 'Programmatic REST API access with scoped keys.',
    category: 'platform',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.WHITE_LABEL,
    name: 'White Label',
    description: 'Remove BharatStore branding from storefront and invoices.',
    category: 'platform',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.PRIORITY_SUPPORT,
    name: 'Priority Support',
    description: 'Dedicated support with faster response times.',
    category: 'platform',
    isPlatformWide: false,
  },
  {
    slug: FEATURE_FLAGS.CUSTOM_ROLES,
    name: 'Custom Roles',
    description: 'Create custom roles with granular permissions.',
    category: 'platform',
    isPlatformWide: false,
  },
];