import { z } from 'zod';

export const OrderItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPrice: z.number().positive(),
});

export const PosCheckoutSchema = z.object({
  customerName: z.string().min(2).default('Walk-in Customer'),
  customerPhone: z.string().optional().nullable(),
  customerGstin: z.string().optional().nullable(),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['CASH', 'UPI_DIRECT', 'RAZORPAY', 'KHATA_CREDIT']),
  discountAmount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export type PosCheckoutInput = z.infer<typeof PosCheckoutSchema>;
