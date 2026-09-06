import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(2, 'Campaign name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED']).optional().default('DRAFT'),
  startAt: z.string().or(z.date()),
  endAt: z.string().or(z.date()),
  budget: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const createCouponSchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  promotionRuleId: z.string().uuid().optional().nullable(),
  code: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Coupon code can only contain alphanumeric characters, dashes, and underscores'),
  discountType: z.enum(['PERCENTAGE', 'FLAT_AMOUNT']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  targetType: z.enum(['ALL_PRODUCTS', 'SELECTED_PRODUCTS', 'SELECTED_CATEGORIES']).optional().default('ALL_PRODUCTS'),
  targetIds: z.array(z.string()).optional().default([]),
  minOrderValue: z.number().min(0).optional().default(0),
  maxDiscount: z.number().min(0).optional().nullable(),
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date()),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perCustomerLimit: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  customerPhone: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Cart items are required for coupon validation'),
});
