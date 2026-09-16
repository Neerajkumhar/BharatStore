import { formatINR } from '@bharatstore/shared/utils';
import { INDIAN_STATES } from '@bharatstore/shared/constants';

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/** Converts a number < 1000 to words. */
function threeDigitsToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) {
    const tens = TENS[Math.floor(n / 10)];
    const ones = ONES[n % 10];
    return ones ? `${tens} ${ones}` : tens;
  }
  const hundreds = ONES[Math.floor(n / 100)];
  const rest = threeDigitsToWords(n % 100);
  return rest ? `${hundreds} Hundred ${rest}` : `${hundreds} Hundred`;
}

/** Converts a number to Indian words (crore/lakh/thousand/hundred). */
export function amountToWords(amount: number): string {
  const value = Math.abs(Math.round(amount * 100) / 100);
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);

  const convert = (n: number): string => {
    if (n === 0) return '';
    if (n < 1000) return threeDigitsToWords(n);
    if (n < 100000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      return rest ? `${threeDigitsToWords(thousands)} Thousand ${threeDigitsToWords(rest)}` : `${threeDigitsToWords(thousands)} Thousand`;
    }
    if (n < 10000000) {
      const lakhs = Math.floor(n / 100000);
      const rest = n % 100000;
      return rest ? `${convert(lakhs)} Lakh ${convert(rest)}` : `${convert(lakhs)} Lakh`;
    }
    const crores = Math.floor(n / 10000000);
    const rest = n % 10000000;
    return rest ? `${convert(crores)} Crore ${convert(rest)}` : `${convert(crores)} Crore`;
  };

  const rupeeWords = rupees === 0 ? 'Zero' : convert(rupees);
  if (paise > 0) {
    return `${rupeeWords} Rupees and ${convert(paise)} Paise Only`;
  }
  return `${rupeeWords} Rupees Only`;
}

/** Formats a numeric value with Indian grouping and ₹ symbol (2 decimals). */
export function inr(value: number | string | null | undefined): string {
  return formatINR(value, true);
}

/** Looks up an Indian state name from a 2-digit state code. */
export function stateName(stateCode: string | null | undefined): string {
  return INDIAN_STATES.find((s) => s.code === stateCode)?.name ?? stateCode ?? '-';
}

/** Formats a Date/string/ISO date to DD-MMM-YYYY. */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}