/**
 * Formats a number into Indian Rupee representation (e.g. ₹1,24,999.00)
 * Uses the Indian numbering system: thousands, lakhs, crores.
 */
export function formatINR(amount: number | string | null | undefined, includeDecimals = true): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  const numericAmount = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numericAmount);
}

/**
 * Validates a 15-digit Indian GSTIN format.
 * Format: 2 digits (state code) + 5 chars (PAN) + 4 digits (PAN) + 1 char (PAN) + 1 digit (entity) + 'Z' + 1 checksum char
 */
export function isValidGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.trim().toUpperCase());
}

/**
 * Validates an Indian 10-digit mobile number (+91 optional).
 */
export function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(cleaned.slice(2));
  }
  return false;
}
