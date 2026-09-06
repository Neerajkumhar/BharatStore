import { z } from 'zod';

export const orderItemInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  channel: z.enum(['STOREFRONT', 'POS_COUNTER', 'WHATSAPP']).default('POS_COUNTER'),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least 1 item'),
  paymentMethod: z.enum(['CASH', 'UPI_DIRECT', 'RAZORPAY', 'KHATA_CREDIT', 'SPLIT']),
  paymentAmount: z.number().min(0),
  notes: z.string().optional(),
  placeOfSupply: z.string().default('09'),
});
