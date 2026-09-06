import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Enter a valid email or 10-digit mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const OnboardBusinessSchema = z.object({
  legalName: z.string().min(2, 'Legal business name is required'),
  tradeName: z.string().min(2, 'Store/Brand name is required'),
  slug: z.string()
    .min(3, 'Store handle must be at least 3 characters')
    .max(50, 'Store handle cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  gstin: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val.trim().toUpperCase());
  }, { message: 'Invalid 15-digit Indian GSTIN format' }),
  isCompositeScheme: z.boolean().default(false),
  stateCode: z.string().length(2, '2-digit Indian state code is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email().optional().or(z.literal('')),
});

export type OnboardBusinessInput = z.infer<typeof OnboardBusinessSchema>;
