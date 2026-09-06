import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(10, '10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  creditLimit: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const logKhataSchema = z.object({
  customerId: z.string().uuid('Valid customer ID is required'),
  type: z.enum(['DEBIT_CREDIT_GIVEN', 'CREDIT_PAYMENT_RECEIVED']),
  amount: z.number().positive('Amount must be positive'),
  paymentMode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER']).optional(),
  orderId: z.string().uuid().optional(),
  notes: z.string().optional(),
});
