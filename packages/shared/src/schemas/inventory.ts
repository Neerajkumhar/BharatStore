import { z } from 'zod';

export const adjustInventorySchema = z.object({
  variantId: z.string().uuid('Valid variant ID is required'),
  changeQuantity: z.number().int().refine((val) => val !== 0, 'Quantity change must not be zero'),
  eventType: z.enum(['INWARD', 'SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT']),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});
