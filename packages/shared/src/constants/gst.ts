export const GST_SLABS = [0, 5, 12, 18, 28] as const;
export type GstSlab = typeof GST_SLABS[number];

export interface IndianState {
  code: string;
  name: string;
  isUnionTerritory: boolean;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: 'Jammu and Kashmir', isUnionTerritory: true },
  { code: '02', name: 'Himachal Pradesh', isUnionTerritory: false },
  { code: '03', name: 'Punjab', isUnionTerritory: false },
  { code: '04', name: 'Chandigarh', isUnionTerritory: true },
  { code: '05', name: 'Uttarakhand', isUnionTerritory: false },
  { code: '06', name: 'Haryana', isUnionTerritory: false },
  { code: '07', name: 'Delhi', isUnionTerritory: true },
  { code: '08', name: 'Rajasthan', isUnionTerritory: false },
  { code: '09', name: 'Uttar Pradesh', isUnionTerritory: false },
  { code: '10', name: 'Bihar', isUnionTerritory: false },
  { code: '11', name: 'Sikkim', isUnionTerritory: false },
  { code: '12', name: 'Arunachal Pradesh', isUnionTerritory: false },
  { code: '13', name: 'Nagaland', isUnionTerritory: false },
  { code: '14', name: 'Manipur', isUnionTerritory: false },
  { code: '15', name: 'Mizoram', isUnionTerritory: false },
  { code: '16', name: 'Tripura', isUnionTerritory: false },
  { code: '17', name: 'Meghalaya', isUnionTerritory: false },
  { code: '18', name: 'Assam', isUnionTerritory: false },
  { code: '19', name: 'West Bengal', isUnionTerritory: false },
  { code: '20', name: 'Jharkhand', isUnionTerritory: false },
  { code: '21', name: 'Odisha', isUnionTerritory: false },
  { code: '22', name: 'Chhattisgarh', isUnionTerritory: false },
  { code: '23', name: 'Madhya Pradesh', isUnionTerritory: false },
  { code: '24', name: 'Gujarat', isUnionTerritory: false },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu', isUnionTerritory: true },
  { code: '27', name: 'Maharashtra', isUnionTerritory: false },
  { code: '29', name: 'Karnataka', isUnionTerritory: false },
  { code: '30', name: 'Goa', isUnionTerritory: false },
  { code: '31', name: 'Lakshadweep', isUnionTerritory: true },
  { code: '32', name: 'Kerala', isUnionTerritory: false },
  { code: '33', name: 'Tamil Nadu', isUnionTerritory: false },
  { code: '34', name: 'Puducherry', isUnionTerritory: true },
  { code: '35', name: 'Andaman and Nicobar Islands', isUnionTerritory: true },
  { code: '36', name: 'Telangana', isUnionTerritory: false },
  { code: '37', name: 'Andhra Pradesh', isUnionTerritory: false },
  { code: '38', name: 'Ladakh', isUnionTerritory: true },
];

export interface TaxCalculation {
  taxableAmount: number;
  gstRate: number;
  isInterState: boolean;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grossTotal: number;
}

/**
 * Calculates GST components based on supplier state and place of supply.
 * Intra-state: 50% CGST + 50% SGST
 * Inter-state: 100% IGST
 */
export function calculateGstBreakdown(
  taxableAmount: number,
  gstRate: number,
  supplierStateCode: string,
  destinationStateCode: string
): TaxCalculation {
  const isInterState = supplierStateCode !== destinationStateCode;
  const totalTax = Math.round((taxableAmount * (gstRate / 100)) * 100) / 100;
  
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = totalTax;
  } else {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  }

  return {
    taxableAmount,
    gstRate,
    isInterState,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    grossTotal: Math.round((taxableAmount + totalTax) * 100) / 100,
  };
}
