export interface HsnPreset {
  code: string;
  description: string;
  gstRate: number; // 0, 5, 12, 18, 28
}

export const COMMON_HSN_CODES: HsnPreset[] = [
  { code: '5007', description: 'Woven fabrics of silk or silk waste (Sarees/Suits)', gstRate: 5 },
  { code: '6204', description: 'Womens suits, dresses, skirts & trousers', gstRate: 12 },
  { code: '6109', description: 'T-shirts, singlets and other vests, knitted', gstRate: 5 },
  { code: '1006', description: 'Rice, wheat, and agricultural food grains', gstRate: 0 },
  { code: '2106', description: 'Packaged food preparations, namkeen, sweets', gstRate: 12 },
  { code: '8517', description: 'Smartphones, cellular devices and electronics', gstRate: 18 },
  { code: '3304', description: 'Cosmetics, skincare & beauty products', gstRate: 18 },
  { code: '9983', description: 'Other professional & IT services (SAC)', gstRate: 18 },
];

export const GST_SLABS = [0, 5, 12, 18, 28];
