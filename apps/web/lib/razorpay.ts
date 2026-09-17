import crypto from 'crypto';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayCredentials() !== null;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

/**
 * Creates a Razorpay order via the REST API (no SDK dependency).
 * `amount` is in the smallest currency unit (paise).
 */
export async function createRazorpayOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const creds = getRazorpayCredentials();
  if (!creds) throw new Error('Razorpay is not configured');

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  const json: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.error?.description || `Razorpay order failed (${response.status})`);
  }
  return json as RazorpayOrder;
}

/** Verifies the checkout handler signature: HMAC_SHA256(`${orderId}|${paymentId}`, keySecret). */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const creds = getRazorpayCredentials();
  if (!creds) return false;
  const expected = crypto
    .createHmac('sha256', creds.keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');
  return timingSafeEqual(expected, params.signature);
}

/** Verifies a webhook body against the x-razorpay-signature header. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function toPaise(amount: number): number {
  return Math.round(amount * 100);
}
