'use client';

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name: string; email: string; contact?: string };
  notes?: Record<string, string>;
  themeColor?: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Opens the Razorpay Standard Checkout. Resolves on success, rejects on dismiss
 * or load failure.
 */
export function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<RazorpaySuccessResponse> {
  return new Promise(async (resolve, reject) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      reject(new Error('Failed to load Razorpay Checkout'));
      return;
    }

    let settled = false;
    const rzp = new (window as any).Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill,
      notes: options.notes,
      theme: { color: options.themeColor ?? '#f59e0b' },
      handler: (response: RazorpaySuccessResponse) => {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!settled) reject(new Error('Checkout cancelled'));
        },
      },
    });

    rzp.on('payment.failed', (resp: any) => {
      if (!settled) {
        settled = true;
        reject(new Error(resp?.error?.description || 'Payment failed'));
      }
    });

    rzp.open();
  });
}
