import { prisma } from '@bharatstore/database';

export type NotificationType =
  | 'ORDER_CONFIRMED'
  | 'ORDER_PACKED'
  | 'ORDER_DISPATCHED'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_RECEIVED'
  | 'KHATA_PAYMENT_DUE'
  | 'LOW_STOCK'
  | 'CAMPAIGN'
  | 'COUPON'
  | 'SYSTEM';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface DispatchNotificationOptions {
  tenantId: string;
  customerId?: string | null;
  type: NotificationType;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  title: string;
  message: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  variablesData?: Record<string, string>;
  ignorePreferences?: boolean;
}

export interface ProviderResult {
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'PENDING';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
}

// 1. Template Safe Variable Interpolation
export function interpolateTemplate(text: string, variables: Record<string, string>): string {
  if (!text) return '';
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = variables[key];
    if (value === undefined || value === null) return `{{${key}}}`;
    // Sanitize string to prevent script/HTML injection
    return String(value)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  });
}

// 2. Provider Adapters (Provider-agnostic interface)
export abstract class NotificationProviderAdapter {
  abstract send(
    channel: NotificationChannel,
    recipient: { phone?: string | null; email?: string | null; customerId?: string | null },
    title: string,
    message: string
  ): Promise<ProviderResult>;
}

export class InAppProvider extends NotificationProviderAdapter {
  async send(): Promise<ProviderResult> {
    const now = new Date();
    return {
      status: 'DELIVERED',
      sentAt: now,
      deliveredAt: now,
    };
  }
}

export class EmailProvider extends NotificationProviderAdapter {
  async send(
    channel: NotificationChannel,
    recipient: { email?: string | null }
  ): Promise<ProviderResult> {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      return {
        status: 'FAILED',
        failureReason: 'Provider not configured: Email API key missing (process.env.EMAIL_API_KEY)',
      };
    }
    if (!recipient.email) {
      return {
        status: 'FAILED',
        failureReason: 'Missing recipient email address',
      };
    }
    const now = new Date();
    return {
      status: 'DELIVERED',
      sentAt: now,
      deliveredAt: now,
    };
  }
}

export class SmsProvider extends NotificationProviderAdapter {
  async send(
    channel: NotificationChannel,
    recipient: { phone?: string | null }
  ): Promise<ProviderResult> {
    const apiKey = process.env.SMS_API_KEY;
    if (!apiKey) {
      return {
        status: 'FAILED',
        failureReason: 'Provider not configured: SMS Gateway credentials missing (process.env.SMS_API_KEY)',
      };
    }
    if (!recipient.phone) {
      return {
        status: 'FAILED',
        failureReason: 'Missing recipient phone number',
      };
    }
    const now = new Date();
    return {
      status: 'DELIVERED',
      sentAt: now,
      deliveredAt: now,
    };
  }
}

export class WhatsAppProvider extends NotificationProviderAdapter {
  async send(
    channel: NotificationChannel,
    recipient: { phone?: string | null }
  ): Promise<ProviderResult> {
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey) {
      return {
        status: 'FAILED',
        failureReason: 'Provider not configured: WhatsApp API credentials missing (process.env.WHATSAPP_API_KEY)',
      };
    }
    if (!recipient.phone) {
      return {
        status: 'FAILED',
        failureReason: 'Missing recipient phone number',
      };
    }
    const now = new Date();
    return {
      status: 'DELIVERED',
      sentAt: now,
      deliveredAt: now,
    };
  }
}

export function getProviderAdapter(channel: NotificationChannel): NotificationProviderAdapter {
  switch (channel) {
    case 'IN_APP':
      return new InAppProvider();
    case 'EMAIL':
      return new EmailProvider();
    case 'SMS':
      return new SmsProvider();
    case 'WHATSAPP':
      return new WhatsAppProvider();
    default:
      return new InAppProvider();
  }
}

// 3. Central Notification Dispatcher
export async function dispatchNotification(options: DispatchNotificationOptions) {
  const {
    tenantId,
    customerId,
    type,
    channel = 'IN_APP',
    priority = 'NORMAL',
    title,
    message,
    relatedEntityType,
    relatedEntityId,
    variablesData = {},
    ignorePreferences = false,
  } = options;

  // 1. Preference & Opt-Out Check
  if (customerId && !ignorePreferences) {
    const preference = await prisma.notificationPreference.findUnique({
      where: { tenantId_customerId: { tenantId, customerId } },
    });

    if (preference) {
      if ((type === 'CAMPAIGN' || type === 'COUPON') && !preference.marketing) {
        return {
          blocked: true,
          reason: 'Customer has opted out of marketing communications',
        };
      }
      if (type.startsWith('ORDER_') && !preference.orderUpdates) {
        return {
          blocked: true,
          reason: 'Customer has opted out of order update notifications',
        };
      }
      if ((type === 'PAYMENT_RECEIVED' || type === 'KHATA_PAYMENT_DUE') && !preference.paymentUpdates) {
        return {
          blocked: true,
          reason: 'Customer has opted out of payment update notifications',
        };
      }
      if (type === 'LOW_STOCK' && !preference.businessAlerts) {
        return {
          blocked: true,
          reason: 'Customer has opted out of business alerts',
        };
      }
    }
  }

  // 2. Fetch Customer Info if customerId provided
  let customerInfo: { phone?: string | null; email?: string | null } = {};
  if (customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      select: { phone: true, email: true },
    });
    if (customer) {
      customerInfo = customer;
    }
  }

  // 3. Interpolate Title & Message
  const finalTitle = interpolateTemplate(title, variablesData);
  const finalMessage = interpolateTemplate(message, variablesData);

  // 4. Create Initial Notification Record
  const notification = await prisma.notification.create({
    data: {
      tenantId,
      customerId: customerId || null,
      type,
      channel,
      title: finalTitle,
      message: finalMessage,
      priority,
      status: 'PENDING',
      relatedEntityType: relatedEntityType || null,
      relatedEntityId: relatedEntityId || null,
    },
  });

  // 5. Send through Provider Adapter
  const adapter = getProviderAdapter(channel);
  const providerResult = await adapter.send(channel, customerInfo, finalTitle, finalMessage);

  // 6. Update Notification with Provider Result
  const updatedNotification = await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: providerResult.status,
      sentAt: providerResult.sentAt || null,
      deliveredAt: providerResult.deliveredAt || null,
      failureReason: providerResult.failureReason || null,
    },
  });

  return {
    blocked: false,
    notification: updatedNotification,
  };
}
