import {
  STOREFRONT_DEMO_IMAGE_POOLS,
  STOREFRONT_TEMPLATE_HEROES,
  type DemoImagePool,
} from '@bharatstore/shared/constants';
import type { TemplateCategory } from '@bharatstore/shared/constants';

export interface PreviewDemoPayload {
  store: DemoStore;
  categories: DemoCategory[];
  products: DemoProduct[];
  bannerImages: string[];
  aboutImage: string;
  heroImage: string;
  testimonials: DemoTestimonial[];
}

export interface DemoCategory {
  name: string;
  slug: string;
  count: number;
  image: string;
}

export interface DemoProduct {
  title: string;
  price: number;
  mrp: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: string;
}

export interface DemoStore {
  tradeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
}

export interface DemoBanner {
  heading: string;
  description: string;
  image: string;
  ctaText: string;
}

export interface DemoTestimonial {
  name: string;
  text: string;
  rating: number;
}

export interface DemoDataset {
  store: DemoStore;
  categories: DemoCategory[];
  products: DemoProduct[];
  banners: DemoBanner[];
  testimonials: DemoTestimonial[];
  aboutImage: string;
}

// ---- Per-category seed data (titles, prices, store names) ----

const categoryNames: Record<string, string[]> = {
  general:     ['Essentials', 'Home & Kitchen', 'Fashion', 'Electronics', 'Bhindi Bazaar Picks', 'Office Supplies'],
  fashion:     ['Kurtas', 'Sarees', 'Lehenga Sets', 'Men Western', 'Women Ethnic', 'Footwear'],
  electronics: ['Mobiles', 'Laptops', 'Audio', 'Smart TV', 'Accessories', 'Gaming'],
  grocery:     ['Staples', 'Rice & Dal', 'Spices', 'Snacks', 'Personal Care', 'Beverages'],
  beauty:      ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Bath & Body', 'Beauty Tools'],
  food:        ['Snacks', 'Sweets', 'Savoury', 'Meals', 'Beverages', 'Packaged Food'],
  home:        ['Furniture', 'Bedsheets', 'Decor', 'Kitchen', 'Lighting', 'Storage'],
};

const productSeeds: Record<string, Array<{ title: string; price: number; mrp: number; category: string; rating: number; reviews: number; badge?: string }>> = {
  general: [
    { title: 'Cotton Utility Bag', price: 199, mrp: 349, category: 'Essentials', rating: 4.3, reviews: 128 },
    { title: 'Stainless Steel Casserole', price: 1299, mrp: 1899, category: 'Home & Kitchen', rating: 4.6, reviews: 94, badge: 'Best Seller' },
    { title: 'Men Cotton Kurta', price: 649, mrp: 999, category: 'Fashion', rating: 4.4, reviews: 210 },
    { title: 'Wireless Neckband', price: 899, mrp: 1499, category: 'Electronics', rating: 4.2, reviews: 345, badge: 'Sale' },
    { title: 'Brass Diya Set (2)', price: 249, mrp: 399, category: 'Bhindi Bazaar Picks', rating: 4.8, reviews: 67 },
    { title: 'Leather Desk Mat', price: 549, mrp: 899, category: 'Office Supplies', rating: 4.5, reviews: 52, badge: 'New' },
    { title: 'Copper Water Bottle', price: 399, mrp: 649, category: 'Home & Kitchen', rating: 4.7, reviews: 183 },
    { title: 'Block Print Cushion Cover', price: 299, mrp: 499, category: 'Bhindi Bazaar Picks', rating: 4.1, reviews: 74 },
  ],
  fashion: [
    { title: 'Chikankari Cotton Kurta', price: 749, mrp: 1199, category: 'Kurtas', rating: 4.6, reviews: 342, badge: 'Best Seller' },
    { title: 'Banarasi Silk Saree', price: 2499, mrp: 3999, category: 'Sarees', rating: 4.9, reviews: 89 },
    { title: 'Georgette Lehenga Set', price: 5999, mrp: 8999, category: 'Lehenga Sets', rating: 4.8, reviews: 56 },
    { title: 'Slim Fit Denim Jacket', price: 1999, mrp: 2999, category: 'Men Western', rating: 4.3, reviews: 178 },
    { title: 'Handloom Dupatta', price: 449, mrp: 749, category: 'Women Ethnic', rating: 4.5, reviews: 112 },
    { title: 'Kolhapuri Sandals', price: 999, mrp: 1499, category: 'Footwear', rating: 4.2, reviews: 203, badge: 'Sale' },
    { title: 'Patola Silk Saree', price: 3499, mrp: 5499, category: 'Sarees', rating: 4.7, reviews: 45 },
    { title: 'Graphic Oversized Tee', price: 699, mrp: 1199, category: 'Men Western', rating: 4.4, reviews: 267, badge: 'New' },
  ],
  electronics: [
    { title: '5G Smartphone (8/128)', price: 12999, mrp: 17999, category: 'Mobiles', rating: 4.5, reviews: 1203, badge: 'Sale' },
    { title: '14" Business Laptop', price: 42990, mrp: 52990, category: 'Laptops', rating: 4.7, reviews: 342 },
    { title: 'True Wireless Earbuds', price: 1199, mrp: 1999, category: 'Audio', rating: 4.3, reviews: 2104, badge: 'Best Seller' },
    { title: '43" Smart TV 4K', price: 25999, mrp: 34999, category: 'Smart TV', rating: 4.6, reviews: 567 },
    { title: '65W GaN Charger', price: 999, mrp: 1499, category: 'Accessories', rating: 4.8, reviews: 834, badge: 'New' },
    { title: 'Mobile Gaming Controller', price: 1999, mrp: 2999, category: 'Gaming', rating: 4.2, reviews: 189 },
    { title: 'Soundbar with Subwoofer', price: 4999, mrp: 7999, category: 'Audio', rating: 4.5, reviews: 423, badge: 'Sale' },
    { title: 'Smart Bulb (RGB)', price: 499, mrp: 899, category: 'Accessories', rating: 4.1, reviews: 567 },
  ],
  grocery: [
    { title: 'Basmati Rice 5kg', price: 549, mrp: 699, category: 'Staples', rating: 4.7, reviews: 2341, badge: 'Best Seller' },
    { title: 'Toor Dal 1kg', price: 169, mrp: 219, category: 'Rice & Dal', rating: 4.6, reviews: 1876 },
    { title: 'Turmeric Powder 250g', price: 99, mrp: 149, category: 'Spices', rating: 4.8, reviews: 3102 },
    { title: 'Masala Peanuts 400g', price: 129, mrp: 179, category: 'Snacks', rating: 4.4, reviews: 987, badge: 'Popular' },
    { title: 'Aloe Vera Soap (6)', price: 249, mrp: 349, category: 'Personal Care', rating: 4.3, reviews: 654 },
    { title: 'Masala Chai 500g', price: 299, mrp: 399, category: 'Beverages', rating: 4.9, reviews: 4521, badge: 'Best Seller' },
    { title: 'Cold Pressed Mustard Oil 1L', price: 289, mrp: 369, category: 'Staples', rating: 4.7, reviews: 1234 },
    { title: 'Kaju Katli 250g', price: 499, mrp: 649, category: 'Snacks', rating: 4.8, reviews: 876, badge: 'Popular' },
  ],
  beauty: [
    { title: 'Vitamin C Face Serum', price: 349, mrp: 549, category: 'Skincare', rating: 4.7, reviews: 2134, badge: 'Best Seller' },
    { title: 'Argan Hair Oil 100ml', price: 449, mrp: 699, category: 'Haircare', rating: 4.5, reviews: 987 },
    { title: 'Matte Lipstick (Nude)', price: 599, mrp: 899, category: 'Makeup', rating: 4.6, reviews: 654, badge: 'New' },
    { title: 'Eau de Parfum 50ml', price: 899, mrp: 1399, category: 'Fragrance', rating: 4.8, reviews: 432 },
    { title: 'Body Butter with Shea', price: 299, mrp: 449, category: 'Bath & Body', rating: 4.4, reviews: 876 },
    { title: 'Rose Quartz Facial Roller', price: 399, mrp: 599, category: 'Beauty Tools', rating: 4.3, reviews: 234, badge: 'New' },
    { title: 'Bamboo Charcoal Peel Mask', price: 249, mrp: 399, category: 'Skincare', rating: 4.5, reviews: 543, badge: 'Sale' },
    { title: 'Niacinamide Toner 150ml', price: 329, mrp: 499, category: 'Skincare', rating: 4.6, reviews: 1098 },
  ],
  food: [
    { title: 'Multigrain Khakhra (3)', price: 179, mrp: 249, category: 'Snacks', rating: 4.5, reviews: 876 },
    { title: 'Kaju Barfi Box', price: 549, mrp: 749, category: 'Sweets', rating: 4.8, reviews: 543, badge: 'Best Seller' },
    { title: 'Aloo Bhujia 400g', price: 119, mrp: 169, category: 'Savoury', rating: 4.7, reviews: 2341, badge: 'Popular' },
    { title: 'Paneer Butter Masala Meal Kit', price: 399, mrp: 549, category: 'Meals', rating: 4.6, reviews: 321, badge: 'New' },
    { title: 'Aamras 500g (Alphonso)', price: 349, mrp: 499, category: 'Beverages', rating: 4.9, reviews: 432 },
    { title: 'Ready Paratha (Frozen, 10)', price: 249, mrp: 329, category: 'Packaged Food', rating: 4.3, reviews: 654 },
    { title: 'Dry Fruit Mix 1kg', price: 899, mrp: 1299, category: 'Sweets', rating: 4.7, reviews: 213, badge: 'Sale' },
    { title: 'Chai Masala 100g', price: 189, mrp: 259, category: 'Beverages', rating: 4.8, reviews: 1876 },
  ],
  home: [
    { title: 'Solid Wood Bookshelf', price: 7999, mrp: 11999, category: 'Furniture', rating: 4.8, reviews: 89, badge: 'Premium' },
    { title: 'Cotton King Bedsheet', price: 999, mrp: 1499, category: 'Bedsheets', rating: 4.6, reviews: 2134, badge: 'Best Seller' },
    { title: 'Madhubani Wall Art', price: 649, mrp: 999, category: 'Decor', rating: 4.7, reviews: 123 },
    { title: 'Cast Iron Kadhai 2L', price: 1499, mrp: 2199, category: 'Kitchen', rating: 4.8, reviews: 345, badge: 'Artisan' },
    { title: 'Brass Table Lamp', price: 1299, mrp: 1799, category: 'Lighting', rating: 4.5, reviews: 213 },
    { title: 'Rattan Storage Basket (3)', price: 899, mrp: 1299, category: 'Storage', rating: 4.4, reviews: 87, badge: 'New' },
    { title: 'Satin Cushion Set (4)', price: 799, mrp: 1199, category: 'Bedsheets', rating: 4.6, reviews: 321 },
    { title: 'Ergonomic Lounge Chair', price: 8999, mrp: 12999, category: 'Furniture', rating: 4.9, reviews: 56, badge: 'Premium' },
  ],
};

const storeNames: Record<string, string> = {
  general:     'BharatStore Essentials',
  fashion:     'Vastra Vogue',
  electronics: 'TechBazaar India',
  grocery:     'Annapurna Fresh',
  beauty:      'Glow Sutra',
  food:        'Swad Factory',
  home:        'Griha Decor',
};

const taglines: Record<string, string> = {
  general:     'Everything you need, at honest prices',
  fashion:     'Ethnic elegance & new-age style',
  electronics: 'The latest gadgets at local prices',
  grocery:     'Farm-fresh staples, delivered daily',
  beauty:      'Skincare & beauty, naturally',
  food:        'Snacks & sweets made with love',
  home:        'Turn your house into a home',
};

const bannerSeed: Record<string, Array<{ heading: string; description: string; ctaText: string }>> = {
  general: [
    { heading: 'Special Offers', description: 'Check out our latest deals and seasonal picks', ctaText: 'Shop Deals' },
    { heading: 'New Arrivals', description: 'Fresh stock just landed across all categories', ctaText: 'See What\'s New' },
  ],
  fashion: [
    { heading: 'Summer Collection', description: 'Explore our latest seasonal styles and freshest picks', ctaText: 'Shop the Collection' },
    { heading: 'Style Inspiration', description: 'Mix-and-match ideas from our editorial team', ctaText: 'Get Inspired' },
  ],
  electronics: [
    { heading: 'Flash Sale', description: '48-hour price drops on leading tech brands', ctaText: 'Shop Deals' },
    { heading: 'Upgrade Your Setup', description: 'Deals on laptops, audio and smart home gear', ctaText: 'Upgrade Now' },
  ],
  grocery: [
    { heading: 'Weekly Fresh Deals', description: 'Updated every Monday — staple prices at their lowest', ctaText: 'Shop Fresh' },
    { heading: 'Bulk Orders Welcome', description: 'Special pricing for families and wholesale buyers', ctaText: 'Order in Bulk' },
  ],
  beauty: [
    { heading: 'Glow-Up Season', description: 'New skincare drops from cult-favourite brands', ctaText: 'Shop New' },
    { heading: 'Bundle & Save', description: 'Buy any 3 skincare products and save 15%', ctaText: 'Build Your Set' },
  ],
  food: [
    { heading: 'Tiffin Specials', description: 'Fresh meal kits delivered before lunch — daily specials', ctaText: 'Order Lunch' },
    { heading: 'Festival Sweets Box', description: 'Seasonal mithai, gift-wrapped and delivered', ctaText: 'Order the Box' },
  ],
  home: [
    { heading: 'New Season, New Space', description: 'Warm tones and fresh textures for every room', ctaText: 'Explore the Edit' },
    { heading: 'Artisan Spotlight', description: 'Hand-selected pieces from India\'s best makers', ctaText: 'Meet the Makers' },
  ],
};

const testimonialSeeds: Record<string, Array<{ name: string; text: string; rating: number }>> = {
  general: [
    { name: 'Priya S.', text: 'Exactly what I needed — delivered fast and well-packed.', rating: 5 },
    { name: 'Rahul M.', text: 'Great value for money on everyday essentials.', rating: 5 },
    { name: 'Anita K.', text: 'My go-to store for household needs and gifts.', rating: 4 },
  ],
  fashion: [
    { name: 'Sneha R.', text: 'The quality of the fabric is excellent — ordered twice already!', rating: 5 },
    { name: 'Farah A.', text: 'Beautiful ethnic collection, very premium feel.', rating: 5 },
    { name: 'Kavya L.', text: 'Fast delivery, and the sizing was perfect.', rating: 4 },
  ],
  electronics: [
    { name: 'Arjun T.', text: 'Genuine products with proper warranty — no issues.', rating: 5 },
    { name: 'Devika N.', text: 'Best price I found anywhere for this smartphone.', rating: 5 },
    { name: 'Mohit S.', text: 'Customer support helped me pick the right laptop.', rating: 4 },
  ],
  grocery: [
    { name: 'Sunita D.', text: 'Always fresh — the dal and rice quality is top-notch.', rating: 5 },
    { name: 'Vikram P.', text: 'Ordered daily essentials, everything arrived the same day.', rating: 5 },
    { name: 'Rekha G.', text: 'Prices are fair and packaging keeps everything sealed.', rating: 4 },
  ],
  beauty: [
    { name: 'Nisha V.', text: 'The serum changed my skincare routine for the better.', rating: 5 },
    { name: 'Tanya M.', text: 'Everything smells amazing and feels premium.', rating: 5 },
    { name: 'Jaya B.', text: 'Love that they carry clean, cruelty-free brands.', rating: 4 },
  ],
  food: [
    { name: 'Amit J.', text: 'The paneer tikka kit was as good as a restaurant.', rating: 5 },
    { name: 'Divya C.', text: 'Perfect chai masala — really authentic taste.', rating: 5 },
    { name: 'Rohit K.', text: 'Every order is packed with care — you can tell.', rating: 4 },
  ],
  home: [
    { name: 'Pallavi S.', text: 'The bookshelf is solid — real wood, not particle board.', rating: 5 },
    { name: 'Sanjay R.', text: 'The Madhubani art piece is gorgeous and authentic.', rating: 5 },
    { name: 'Lakshmi T.', text: 'Love the aesthetic — every piece feels curated.', rating: 4 },
  ],
};

// ---- Build datasets from seeds + shared image pools ----

function makeDelhiStore(tradeName: string, tagline: string): DemoStore {
  return {
    tradeName,
    tagline,
    phone: '+91 98765 43210',
    email: 'care@example.com',
    address: 'Shop 12, Main Market, Delhi 110001',
  };
}

const demoDatasets: Record<string, DemoDataset> = {};

for (const cat of Object.keys(categoryNames) as TemplateCategory[]) {
  const pool: DemoImagePool = STOREFRONT_DEMO_IMAGE_POOLS[cat];
  const seeds = productSeeds[cat];

  demoDatasets[cat] = {
    store: makeDelhiStore(storeNames[cat], taglines[cat]),
    categories: categoryNames[cat].map((name, i) => ({
      name,
      slug: `${cat}-cat-${i + 1}`,
      count: 8 + i * 3,
      image: pool.categories[i],
    })),
    products: seeds.map((seed, i) => ({
      ...seed,
      image: pool.products[i],
    })),
    banners: bannerSeed[cat].map((b, i) => ({
      ...b,
      image: pool.banner[i],
    })),
    testimonials: testimonialSeeds[cat],
    aboutImage: pool.about[0],
  };
}

export const DEMO_DATASETS: Record<string, DemoDataset> = demoDatasets;

export function getDemoDataset(category: string): DemoDataset {
  return DEMO_DATASETS[category] || DEMO_DATASETS.general;
}

export function getDemoStore(): DemoStore {
  return getDemoDataset('general').store;
}

export function getPreviewDemoPayload(category: string, templateId: string): PreviewDemoPayload {
  const ds = getDemoDataset(category);
  return {
    store: ds.store,
    categories: ds.categories,
    products: ds.products,
    bannerImages: ds.banners.map((b) => b.image),
    aboutImage: ds.aboutImage,
    heroImage: STOREFRONT_TEMPLATE_HEROES[templateId] || STOREFRONT_DEMO_IMAGE_POOLS.general.hero[0],
    testimonials: ds.testimonials,
  };
}
