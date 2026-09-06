import { z } from 'zod';

export const notificationTypeEnum = z.enum([
  'ORDER_CONFIRMED',
  'ORDER_PACKED',
  'ORDER_DISPATCHED',
  'ORDER_DELIVERED',
  'PAYMENT_RECEIVED',
  'KHATA_PAYMENT_DUE',
  'LOW_STOCK',
  'CAMPAIGN',
  'COUPON',
  'SYSTEM',
]);

export const notificationChannelEnum = z.enum(['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP']);

export const notificationPriorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

export const createNotificationSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  type: notificationTypeEnum,
  channel: notificationChannelEnum.optional().default('IN_APP'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: notificationPriorityEnum.optional().default('NORMAL'),
  relatedEntityType: z.string().optional().nullable(),
  relatedEntityId: z.string().optional().nullable(),
  scheduledAt: z.string().or(z.date()).optional().nullable(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  type: notificationTypeEnum,
  channel: notificationChannelEnum.optional().default('IN_APP'),
  subject: z.string().optional().nullable(),
  body: z.string().min(1, 'Template body is required'),
  variables: z.array(z.string()).optional().default([]),
  isEnabled: z.boolean().optional().default(true),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const updatePreferenceSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  orderUpdates: z.boolean().optional(),
  paymentUpdates: z.boolean().optional(),
  marketing: z.boolean().optional(),
  businessAlerts: z.boolean().optional(),
  preferredChannel: notificationChannelEnum.optional(),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
});

export const sendNotificationSchema = z.object({
  templateId: z.string().uuid().optional().nullable(),
  type: notificationTypeEnum.optional(),
  channel: notificationChannelEnum.optional().default('IN_APP'),
  customerIds: z.array(z.string().uuid()).optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  variablesData: z.record(z.string(), z.string()).optional(),
});
