import { z } from 'zod';

export const variantInputSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  variantName: z.string().min(1, 'Variant name is required'),
  priceOverride: z.number().optional(),
  weightGrams: z.number().default(0),
  initialStock: z.number().default(0),
  lowStockAlert: z.number().default(5),
});

export const createProductSchema = z.object({
  title: z.string().min(2, 'Product title is required'),
  categoryId: z.string().uuid('Valid category is required'),
  description: z.string().optional(),
  hsnCode: z.string().min(4, 'Valid 4-8 digit HSN code is required'),
  gstRate: z.number().min(0).max(28),
  baseCost: z.number().min(0).default(0),
  mrp: z.number().min(0, 'MRP is required'),
  sellingPrice: z.number().min(0, 'Selling price is required'),
  isPublished: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  variants: z.array(variantInputSchema).min(1, 'At least one product variant is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});
