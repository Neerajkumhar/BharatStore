export interface DemoCategory {
  name: string;
  slug: string;
  count: number;
  color: string;
}

export interface DemoProduct {
  title: string;
  price: number;
  mrp: number;
  color: string;
  category: string;
}

export interface DemoStore {
  tradeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
}

export interface DemoDataset {
  store: DemoStore;
  categories: DemoCategory[];
  products: DemoProduct[];
}

const makeDelhiStore = (tradeName: string, tagline: string): DemoStore => ({
  tradeName,
  tagline,
  phone: '+91 98765 43210',
  email: 'care@example.com',
  address: 'Shop 12, Main Market, Delhi 110001',
});

const categoryNames: Record<string, string[]> = {
  general: ['Essentials', 'Home & Kitchen', 'Fashion', 'Electronics', 'Bhindi Bazaar Picks', 'Office Supplies'],
  fashion: ['Kurtas', 'Sarees', 'Lehenga Sets', 'Men Western', 'Women Ethnic', 'Footwear'],
  electronics: ['Mobiles', 'Laptops', 'Audio', 'Smart TV', 'Accessories', 'Gaming'],
  grocery: ['Staples', 'Rice & Dal', 'Spices', 'Snacks', 'Personal Care', 'Beverages'],
  beauty: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Bath & Body', 'Beauty Tools'],
  food: ['Snacks', 'Sweets', 'Savoury', 'Meals', 'Beverages', 'Packaged Food'],
  home: ['Furniture', 'Bedsheets', 'Decor', 'Kitchen', 'Lighting', 'Storage'],
};

const productPools: Record<string, { title: string; price: number; mrp: number; color: string; category: string }[]> = {
  general: [
    { title: 'Cotton Utility Bag', price: 199, mrp: 349, color: '#fbbf24', category: 'Essentials' },
    { title: 'Stainless Steel Casserole', price: 1299, mrp: 1899, color: '#94a3b8', category: 'Home & Kitchen' },
    { title: 'Men Cotton Kurta', price: 649, mrp: 999, color: '#34d399', category: 'Fashion' },
    { title: 'Wireless Neckband', price: 899, mrp: 1499, color: '#818cf8', category: 'Electronics' },
    { title: 'Brass Diya Set (2)', price: 249, mrp: 399, color: '#f59e0b', category: 'Bhindi Bazaar Picks' },
    { title: 'Leather Desk Mat', price: 549, mrp: 899, color: '#a16207', category: 'Office Supplies' },
    { title: 'Copper Water Bottle', price: 399, mrp: 649, color: '#fb923c', category: 'Home & Kitchen' },
    { title: 'Block Print Cushion Cover', price: 299, mrp: 499, color: '#f472b6', category: 'Bhindi Bazaar Picks' },
  ],
  fashion: [
    { title: 'Chikankari Cotton Kurta', price: 749, mrp: 1199, color: '#a5b4fc', category: 'Kurtas' },
    { title: 'Banarasi Silk Saree', price: 2499, mrp: 3999, color: '#f9a8d4', category: 'Sarees' },
    { title: 'Georgette Lehenga Set', price: 5999, mrp: 8999, color: '#fda4af', category: 'Lehenga Sets' },
    { title: 'Slim Fit Denim Jacket', price: 1999, mrp: 2999, color: '#60a5fa', category: 'Men Western' },
    { title: 'Handloom Dupatta', price: 449, mrp: 749, color: '#fde68a', category: 'Women Ethnic' },
    { title: 'Kolhapuri Sandals', price: 999, mrp: 1499, color: '#d6a27b', category: 'Footwear' },
    { title: 'Patola Silk Saree', price: 3499, mrp: 5499, color: '#c084fc', category: 'Sarees' },
    { title: 'Graphic Oversized Tee', price: 699, mrp: 1199, color: '#4ade80', category: 'Men Western' },
  ],
  electronics: [
    { title: '5G Smartphone (8/128)', price: 12999, mrp: 17999, color: '#64748b', category: 'Mobiles' },
    { title: '14 Inch Business Laptop', price: 42990, mrp: 52990, color: '#475569', category: 'Laptops' },
    { title: 'True Wireless Earbuds', price: 1199, mrp: 1999, color: '#a855f7', category: 'Audio' },
    { title: '43 Smart TV 4K', price: 25999, mrp: 34999, color: '#1e293b', category: 'Smart TV' },
    { title: '65W GaN Charger', price: 999, mrp: 1499, color: '#f59e0b', category: 'Accessories' },
    { title: 'Mobile Gaming Controller', price: 1999, mrp: 2999, color: '#22d3ee', category: 'Gaming' },
    { title: 'Soundbar with Subwoofer', price: 4999, mrp: 7999, color: '#0ea5e9', category: 'Audio' },
    { title: 'Smart Bulb (RGB)', price: 499, mrp: 899, color: '#facc15', category: 'Accessories' },
  ],
  grocery: [
    { title: 'Basmati Rice 5kg', price: 549, mrp: 699, color: '#fef3c7', category: 'Staples' },
    { title: 'Toor Dal 1kg', price: 169, mrp: 219, color: '#fde68a', category: 'Rice & Dal' },
    { title: 'Turmeric Powder 250g', price: 99, mrp: 149, color: '#fbbf24', category: 'Spices' },
    { title: 'Masala Peanuts 400g', price: 129, mrp: 179, color: '#fb923c', category: 'Snacks' },
    { title: 'Aloe Vera Soap (6)', price: 249, mrp: 349, color: '#86efac', category: 'Personal Care' },
    { title: 'Masala Chai 500g', price: 299, mrp: 399, color: '#d97706', category: 'Beverages' },
    { title: 'Cold Pressed Mustard Oil 1L', price: 289, mrp: 369, color: '#facc15', category: 'Staples' },
    { title: 'Kaju Katli 250g', price: 499, mrp: 649, color: '#fcd34d', category: 'Snacks' },
  ],
  beauty: [
    { title: 'Vitamin C Face Serum', price: 349, mrp: 549, color: '#fb923c', category: 'Skincare' },
    { title: 'Argan Hair Oil 100ml', price: 449, mrp: 699, color: '#f59e0b', category: 'Haircare' },
    { title: 'Matte Lipstick (Nude)', price: 599, mrp: 899, color: '#e11d48', category: 'Makeup' },
    { title: 'Eau de Parfum 50ml', price: 899, mrp: 1399, color: '#7c3aed', category: 'Fragrance' },
    { title: 'Body Butter with Shea', price: 299, mrp: 449, color: '#f9a8d4', category: 'Bath & Body' },
    { title: 'Rose Quartz Facial Roller', price: 399, mrp: 599, color: '#fda4af', category: 'Beauty Tools' },
    { title: 'Bamboo Charcoal Peel Mask', price: 249, mrp: 399, color: '#475569', category: 'Skincare' },
    { title: 'Niacinamide Toner 150ml', price: 329, mrp: 499, color: '#93c5fd', category: 'Skincare' },
  ],
  food: [
    { title: 'Multigrain Khakhra (3)', price: 179, mrp: 249, color: '#fcd34d', category: 'Snacks' },
    { title: 'Kaju Barfi Box', price: 549, mrp: 749, color: '#fde68a', category: 'Sweets' },
    { title: 'Aloo Bhujia 400g', price: 119, mrp: 169, color: '#fdba74', category: 'Savoury' },
    { title: 'Paneer Butter Masala Meal Kit', price: 399, mrp: 549, color: '#fdba74', category: 'Meals' },
    { title: 'Aamras 500g (Alphonso)', price: 349, mrp: 499, color: '#fbbf24', category: 'Beverages' },
    { title: 'Ready Paratha (Frozen, 10)', price: 249, mrp: 329, color: '#fef08a', category: 'Packaged Food' },
    { title: 'Dry Fruit Mix 1kg', price: 899, mrp: 1299, color: '#d6a27b', category: 'Sweets' },
    { title: 'Chai Masala 100g', price: 189, mrp: 259, color: '#a16207', category: 'Beverages' },
  ],
  home: [
    { title: 'Solid Wood Bookshelf', price: 7999, mrp: 11999, color: '#92400e', category: 'Furniture' },
    { title: 'Cotton King Bedsheet', price: 999, mrp: 1499, color: '#93c5fd', category: 'Bedsheets' },
    { title: 'Madhubani Wall Art', price: 649, mrp: 999, color: '#f87171', category: 'Decor' },
    { title: 'Cast Iron Kadhai 2L', price: 1499, mrp: 2199, color: '#475569', category: 'Kitchen' },
    { title: 'Brass Table Lamp', price: 1299, mrp: 1799, color: '#fbbf24', category: 'Lighting' },
    { title: 'Rattan Storage Basket (3)', price: 899, mrp: 1299, color: '#d6a27b', category: 'Storage' },
    { title: 'Satin Cushion Set (4)', price: 799, mrp: 1199, color: '#c4b5fd', category: 'Bedsheets' },
    { title: 'Ergonomic Lounge Chair', price: 8999, mrp: 12999, color: '#7c2d12', category: 'Furniture' },
  ],
};

const storeNames: Record<string, string> = {
  general: 'BharatStore Essentials',
  fashion: 'Vastra Vogue',
  electronics: 'TechBazaar India',
  grocery: 'Annapurna Fresh',
  beauty: 'Glow Sutra',
  food: 'Swad Factory',
  home: 'Griha Decor',
};

const taglines: Record<string, string> = {
  general: 'Everything you need, at honest prices',
  fashion: 'Ethnic elegance & new-age style',
  electronics: 'The latest gadgets at local prices',
  grocery: 'Farm-fresh staples, delivered daily',
  beauty: 'Skincare & beauty, naturally',
  food: 'Snacks & sweets made with love',
  home: 'Turn your house into a home',
};

const demoDatasets: Record<string, DemoDataset> = {};

for (const key of Object.keys(productPools)) {
  demoDatasets[key] = {
    store: makeDelhiStore(storeNames[key], taglines[key]),
    categories: categoryNames[key].map((name, i) => ({
      name,
      slug: `${key}-cat-${i + 1}`,
      count: 8 + i * 3,
      color: productPools[key][i]?.color || '#cbd5e1',
    })),
    products: productPools[key],
  };
}

export const DEMO_DATASETS: Record<string, DemoDataset> = demoDatasets;

export function getDemoDataset(category: string): DemoDataset {
  return DEMO_DATASETS[category] || DEMO_DATASETS.general;
}

export function getDemoStore(): DemoStore {
  return getDemoDataset('general').store;
}