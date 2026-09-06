import { z } from 'zod';
import { GST_SLABS } from '../constants/gst';

export const CategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters and hyphens'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().default(0),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

export const ProductVariantSchema = z.object({
  sku: z.string().min(2, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  variantName: z.string().min(1, 'Variant name is required (e.g. Red / Standard)'),
  priceOverride: z.number().positive().optional().nullable(),
  weightGrams: z.number().int().nonnegative().default(0),
  initialStock: z.number().int().nonnegative().default(0),
});

export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;

export const ProductSchema = z.object({
  title: z.string().min(2, 'Product title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  categoryId: z.string().uuid('Select a valid category'),
  hsnCode: z.string().min(4, 'HSN code must be 4, 6, or 8 digits').max(8),
  gstRate: z.number().refine((val) => GST_SLABS.includes(val as any), {
    message: 'GST rate must be 0, 5, 12, 18, or 28%',
  }),
  baseCost: z.number().nonnegative('Cost must be positive or zero'),
  mrp: z.number().positive('MRP must be greater than zero'),
  sellingPrice: z.number().positive('Selling price must be greater than zero'),
  isPublished: z.boolean().default(true),
  variants: z.array(ProductVariantSchema).min(1, 'At least one variant or default SKU is required'),
});

export type ProductInput = z.infer<typeof ProductSchema>;
