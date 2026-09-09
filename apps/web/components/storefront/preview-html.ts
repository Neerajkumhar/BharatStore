import { DemoCategory, DemoProduct, DemoStore } from '../../lib/storefront-demo-data';

export interface PreviewDemoData {
  store?: DemoStore;
  categories?: DemoCategory[];
  products?: DemoProduct[];
  heroImage?: string;
  bannerImages?: string[];
  aboutImage?: string;
  testimonials?: Array<{ name: string; text: string; rating: number }>;
}

const viewportWidths: Record<string, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function getPreviewViewportWidth(viewport: 'desktop' | 'tablet' | 'mobile'): string {
  return viewportWidths[viewport] || '100%';
}

function esc(str: unknown): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stars(rating: number): string {
  const full = Math.round(rating);
  return (
    '<span style="color:#f59e0b;font-size:11px;letter-spacing:1px;">' +
    '&#9733;'.repeat(full) +
    '<span style="color:#d1d5db;">&#9733;</span>'.repeat(5 - full) +
    '</span>'
  );
}

function discountPercent(price: number, mrp: number): number | null {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function generateStorefrontPreviewHTML(
  sections: any[],
  theme: any,
  storeData: any,
  slug: string,
  demo?: PreviewDemoData
): string {
  const accent = theme.accentColor || '#d97706';
  const bg = theme.backgroundColor || '#f8fafc';
  const primary = theme.primaryColor || '#0f172a';
  const textColor = theme.textColor || '#0f172a';
  const cardRadius =
    theme.borderRadius === 'none'
      ? '4px'
      : theme.borderRadius === 'sm'
      ? '8px'
      : theme.borderRadius === 'md'
      ? '12px'
      : theme.borderRadius === 'xl'
      ? '20px'
      : '16px';

  const demoCats = demo?.categories || [];
  const demoProds = demo?.products || [];
  const demoStore = demo?.store || storeData;
  const store = demoStore || demo?.store || { tradeName: 'Store', tagline: '' };
  const bannerImgs = demo?.bannerImages || [];
  const aboutImg = demo?.aboutImage || '';
  const demoTesti = demo?.testimonials || [];
  const heroImg = demo?.heroImage || '';

  let sectionsHTML = '';

  for (const section of sections) {
    const cfg = section.config || {};
    if (cfg.visible === false) continue;

    switch (section.type) {
      /* ─── ANNOUNCEMENT BAR ─── */
      case 'announcement': {
        sectionsHTML += `
          <div style="background:${cfg.bgColor || primary};color:${cfg.textColor || '#fbbf24'};text-align:center;padding:7px 16px;font-size:11px;font-weight:600;letter-spacing:.3px;">
            ${esc(cfg.text || 'Welcome to our store!')}
          </div>`;
        break;
      }

      /* ─── STICKY HEADER ─── */
      case 'sticky-header': {
        sectionsHTML += `
          <header style="background:white;color:${textColor};display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid #e2e8f0;">
            <div style="font-weight:900;font-size:16px;">${esc(store.tradeName || 'BharatStore')}</div>
            <nav style="display:flex;gap:18px;font-size:12px;font-weight:600;">
              <span>Home</span><span>Shop</span><span>Categories</span><span>Deals</span>
            </nav>
            <div style="display:flex;gap:12px;font-size:14px;">
              <span>&#128091;</span>
            </div>
          </header>`;
        break;
      }

      /* ─── MEGA MENU ─── */
      case 'mega-menu': {
        sectionsHTML += `
          <div style="background:#0f172a;color:white;padding:20px 24px;border-bottom:1px solid #1e293b;">
            <div style="font-size:11px;font-weight:800;color:${accent};text-transform:uppercase;margin-bottom:12px;">${esc(cfg.title || 'Explore Categories')}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;font-size:12px;">
              <div><strong style="display:block;margin-bottom:6px;">Apparel</strong><span style="opacity:.7;">Sarees • Kurtas • Footwear</span></div>
              <div><strong style="display:block;margin-bottom:6px;">Essentials</strong><span style="opacity:.7;">Organic Oils • Spices • Honey</span></div>
              <div><strong style="display:block;margin-bottom:6px;">Decor</strong><span style="opacity:.7;">Handicrafts • Brassware • Rugs</span></div>
            </div>
          </div>`;
        break;
      }

      /* ─── SEARCH OVERLAY ─── */
      case 'search-overlay': {
        sectionsHTML += `
          <div style="background:#f1f5f9;padding:14px 24px;border-bottom:1px solid #e2e8f0;">
            <div style="background:white;border:1px solid #cbd5e1;border-radius:12px;padding:8px 14px;font-size:12px;color:#64748b;display:flex;justify-content:space-between;align-items:center;">
              <span>${esc(cfg.placeholder || 'Search products, SKU...')}</span>
              <span style="background:${primary};color:white;padding:4px 10px;border-radius:6px;font-weight:700;">Search</span>
            </div>
          </div>`;
        break;
      }

      /* ─── HERO BANNER ─── */
      case 'hero': {
        const heroHeight = cfg.height === 'large' ? 'min-height:440px' : cfg.height === 'small' ? 'min-height:220px' : 'min-height:320px';
        const align = cfg.alignment || 'center';
        const heroImageUrl = heroImg || cfg.imageUrl || '';
        const heroBg = heroImageUrl
          ? `background-image:url('${esc(heroImageUrl)}');background-size:cover;background-position:center;position:relative;`
          : `background:${primary};position:relative;`;

        sectionsHTML += `
          <section style="${heroHeight};display:flex;align-items:center;padding:48px 24px;${heroBg}text-align:${align};color:white;">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,${((cfg.overlayOpacity ?? 40) / 100).toFixed(2)});"></div>
            <div style="position:relative;z-index:1;max-width:640px;${align === 'left' ? 'margin-right:auto;' : align === 'right' ? 'margin-left:auto;' : 'margin:0 auto;'}">
              <h1 style="font-size:32px;font-weight:800;margin:0 0 10px;line-height:1.15;">${esc(cfg.title || 'Welcome')}</h1>
              <p style="font-size:14px;opacity:.9;margin:0 0 20px;">${esc(cfg.subtitle || '')}</p>
              ${cfg.ctaText ? `<a style="display:inline-block;background:${accent};color:${primary};padding:12px 28px;border-radius:${cardRadius};font-weight:700;font-size:13px;text-decoration:none;">${esc(cfg.ctaText)}</a>` : ''}
            </div>
          </section>`;
        break;
      }

      /* ─── HERO FULLSCREEN ─── */
      case 'hero-fullscreen': {
        const heroImageUrl = heroImg || cfg.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80';
        sectionsHTML += `
          <section style="min-height:480px;display:flex;align-items:center;justify-content:center;padding:60px 24px;background-image:url('${esc(heroImageUrl)}');background-size:cover;background-position:center;position:relative;text-align:center;color:white;">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,.55);"></div>
            <div style="position:relative;z-index:1;max-width:700px;">
              <h1 style="font-size:40px;font-weight:900;margin:0 0 12px;line-height:1.1;">${esc(cfg.title || 'Crafted to Inspire.')}</h1>
              <p style="font-size:16px;opacity:.9;margin:0 0 24px;">${esc(cfg.subtitle || 'Explore our latest luxury release')}</p>
              <a style="display:inline-block;background:white;color:black;padding:14px 32px;border-radius:30px;font-weight:800;font-size:13px;text-decoration:none;">${esc(cfg.ctaText || 'Discover Collection')}</a>
            </div>
          </section>`;
        break;
      }

      /* ─── HERO SPLIT ─── */
      case 'hero-split': {
        const img = cfg.imageUrl || heroImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:40px 20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;">
              <div style="height:260px;border-radius:${cardRadius};overflow:hidden;background:#cbd5e1;">
                <img src="${esc(img)}" alt="Hero Split" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <div>
                ${cfg.badge ? `<span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:800;padding:3px 8px;border-radius:12px;">${esc(cfg.badge)}</span>` : ''}
                <h2 style="font-size:24px;font-weight:800;margin:8px 0;color:${textColor};">${esc(cfg.title || 'Modern Design')}</h2>
                <p style="font-size:13px;color:#64748b;margin-bottom:16px;">${esc(cfg.subtitle || 'Thoughtful materials for modern living.')}</p>
                <a style="display:inline-block;background:${primary};color:white;padding:10px 22px;border-radius:${cardRadius};font-weight:700;font-size:12px;text-decoration:none;">${esc(cfg.ctaText || 'Explore')}</a>
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── HERO EDITORIAL ─── */
      case 'hero-editorial': {
        const img = cfg.imageUrl || heroImg || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';
        sectionsHTML += `
          <section style="background:#f5f5f4;padding:48px 24px;text-align:center;color:#1c1917;">
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${accent};font-weight:800;">${esc(cfg.seasonTag || 'Autumn / Winter')}</div>
            <h1 style="font-size:38px;font-family:serif;margin:8px 0;">${esc(cfg.headline || 'The Heritage Edit')}</h1>
            <p style="font-size:13px;font-style:italic;color:#78716c;margin-bottom:20px;">${esc(cfg.subheadline || 'Handwoven textiles & modern Indian craft')}</p>
            <div style="max-width:800px;margin:0 auto;height:240px;overflow:hidden;">
              <img src="${esc(img)}" alt="Editorial" style="width:100%;height:100%;object-fit:cover;" />
            </div>
          </section>`;
        break;
      }

      /* ─── HERO PRODUCT ─── */
      case 'hero-product': {
        const img = cfg.imageUrl || heroImg || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
        sectionsHTML += `
          <section style="background:#0f172a;color:white;padding:40px 24px;">
            <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;">
              <div style="height:240px;background:#1e293b;border-radius:20px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                <img src="${esc(img)}" alt="Product Hero" style="max-height:100%;object-fit:contain;" />
              </div>
              <div>
                <span style="background:${accent};color:${primary};font-size:10px;font-weight:800;padding:3px 8px;border-radius:10px;">${esc(cfg.badge || 'Flagship Launch')}</span>
                <h2 style="font-size:26px;font-weight:800;margin:8px 0;">${esc(cfg.title || 'Pro Headphones')}</h2>
                <p style="font-size:13px;opacity:.8;margin-bottom:14px;">${esc(cfg.subtitle || 'Active Noise Cancellation • 40-Hour Battery')}</p>
                <div style="font-size:22px;font-weight:900;color:${accent};margin-bottom:16px;">₹${cfg.price || '4,999'}</div>
                <a style="display:inline-block;background:${accent};color:${primary};padding:12px 26px;border-radius:12px;font-weight:800;font-size:12px;text-decoration:none;">${esc(cfg.ctaText || 'Buy Now')}</a>
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── HERO MINIMAL ─── */
      case 'hero-minimal': {
        sectionsHTML += `
          <section style="padding:60px 24px;text-align:center;background:white;">
            <h1 style="font-size:36px;font-weight:900;color:${textColor};">${esc(cfg.title || 'Clean. Essential. Honest.')}</h1>
            <p style="font-size:14px;color:#64748b;max-width:500px;margin:10px auto 20px;">${esc(cfg.subtitle || 'Pure organic produce delivered fresh every morning.')}</p>
            <a style="display:inline-block;background:${primary};color:white;padding:10px 24px;border-radius:${cardRadius};font-weight:700;font-size:12px;text-decoration:none;">${esc(cfg.ctaText || 'Shop Essentials')}</a>
          </section>`;
        break;
      }

      /* ─── CATEGORIES ─── */
      case 'categories': {
        const count = Math.min(cfg.limit || 6, cfg.columns || 6);
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 16px;color:${textColor};">${esc(cfg.title || 'Shop by Category')}</h2>
            <div style="display:grid;grid-template-columns:repeat(${count},1fr);gap:12px;">
              ${Array.from({ length: count }).map((_, i) => {
                const cat = demoCats[i] || { name: `Category ${i + 1}`, count: 0, image: '' };
                return `
                <div style="border-radius:${cardRadius};overflow:hidden;background:white;border:1px solid #f1f5f9;text-align:center;">
                  <div style="height:100px;background:#f1f5f9;overflow:hidden;">
                    ${cat.image ? `<img src="${esc(cat.image)}" alt="${esc(cat.name)}" style="width:100%;height:100%;object-fit:cover;" />` : ''}
                  </div>
                  <div style="padding:8px;font-size:11px;font-weight:700;color:${textColor};">${esc(cat.name)}</div>
                </div>`;
              }).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── CATEGORY CIRCULAR ─── */
      case 'category-circular': {
        const count = Math.min(cfg.limit || 8, 8);
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:24px 20px;">
            <h2 style="font-size:14px;font-weight:800;margin:0 0 14px;color:#94a3b8;text-transform:uppercase;">${esc(cfg.title || 'Explore Departments')}</h2>
            <div style="display:flex;gap:16px;overflow-x:auto;">
              ${Array.from({ length: count }).map((_, i) => {
                const cat = demoCats[i] || { name: `Dept ${i + 1}`, image: '' };
                return `
                <div style="text-align:center;width:64px;flex-shrink:0;">
                  <div style="width:64px;height:64px;border-radius:50%;background:#e2e8f0;overflow:hidden;margin-bottom:6px;border:2px solid ${accent};">
                    ${cat.image ? `<img src="${esc(cat.image)}" alt="${esc(cat.name)}" style="width:100%;height:100%;object-fit:cover;" />` : ''}
                  </div>
                  <div style="font-size:10px;font-weight:700;color:${textColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(cat.name)}</div>
                </div>`;
              }).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── CATEGORY MEGA ─── */
      case 'category-mega': {
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 20px;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 16px;color:${textColor};">${esc(cfg.title || 'Shop by Room')}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
              ${['Living Room', 'Bedroom', 'Kitchen'].map((name, i) => `
              <div style="height:140px;border-radius:${cardRadius};background:#0f172a;color:white;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;position:relative;overflow:hidden;">
                <div style="position:relative;z-index:1;font-weight:800;font-size:15px;">${name}</div>
              </div>`).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── PRODUCT CARDS SECTIONS ─── */
      case 'featured-products':
      case 'product-grid':
      case 'product-carousel':
      case 'product-rail':
      case 'product-trending':
      case 'product-tabs':
      case 'flash-sale': {
        const limit = cfg.limit || 4;
        const cols = cfg.columns || 4;
        const display = demoProds.slice(0, limit);
        const sectionTitle = cfg.title || (section.type === 'flash-sale' ? 'Flash Deals' : 'Featured Products');

        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 16px;color:${textColor};">${esc(sectionTitle)}</h2>
            <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px;">
              ${display.map((p: any) => {
                const disc = discountPercent(p.price, p.mrp);
                return `
                <div style="background:white;border-radius:${cardRadius};overflow:hidden;border:1px solid #f1f5f9;padding:10px;">
                  <div style="aspect-ratio:1;background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:8px;position:relative;">
                    ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" style="width:100%;height:100%;object-fit:cover;" />` : ''}
                    ${disc ? `<span style="position:absolute;top:6px;right:6px;background:#dc2626;color:white;font-size:9px;font-weight:800;padding:2px 6px;border-radius:10px;">-${disc}%</span>` : ''}
                  </div>
                  <div style="font-size:11px;font-weight:700;color:${textColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(p.title)}</div>
                  <div style="font-size:13px;font-weight:900;color:${accent};margin-top:4px;">₹${p.price.toLocaleString('en-IN')}</div>
                </div>`;
              }).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── PRODUCT SPOTLIGHT ─── */
      case 'product-spotlight': {
        sectionsHTML += `
          <section style="max-width:1000px;margin:0 auto;padding:32px 20px;">
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center;">
              <div style="height:200px;background:#f1f5f9;border-radius:12px;overflow:hidden;">
                ${heroImg ? `<img src="${esc(heroImg)}" alt="Spotlight" style="width:100%;height:100%;object-fit:cover;" />` : ''}
              </div>
              <div>
                <span style="font-size:10px;font-weight:800;color:${accent};text-transform:uppercase;">${esc(cfg.title || 'Spotlight')}</span>
                <h3 style="font-size:20px;font-weight:800;margin:6px 0;color:${textColor};">${esc(cfg.subtitle || 'Virgin Coconut Oil')}</h3>
                <div style="font-size:22px;font-weight:900;color:${accent};margin-bottom:12px;">₹${cfg.price || '349'}</div>
                <a style="display:inline-block;background:${primary};color:white;padding:10px 20px;border-radius:${cardRadius};font-weight:700;font-size:12px;text-decoration:none;">${esc(cfg.ctaText || 'Add to Cart')}</a>
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── PROMOTIONAL BANNER ─── */
      case 'banner': {
        const bannerImg = bannerImgs[0] || cfg.imageUrl || '';
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:16px 20px;">
            <div style="background:${cfg.bgColor || '#fef3c7'};color:${cfg.textColor || '#92400e'};border-radius:${cardRadius};padding:32px 24px;text-align:${cfg.layout === 'center' ? 'center' : 'left'};">
              <h2 style="font-size:22px;font-weight:800;margin:0 0 6px;">${esc(cfg.heading || 'Special Offer')}</h2>
              <p style="font-size:13px;opacity:.85;margin:0 0 14px;">${esc(cfg.description || '')}</p>
              ${cfg.ctaText ? `<a style="display:inline-block;background:${cfg.textColor || '#92400e'};color:white;padding:8px 20px;border-radius:${cardRadius};font-weight:700;font-size:12px;text-decoration:none;">${esc(cfg.ctaText)}</a>` : ''}
            </div>
          </section>`;
        break;
      }

      /* ─── PROMO SPLIT ─── */
      case 'promo-split': {
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:24px 20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div style="background:#fef3c7;color:#92400e;padding:24px;border-radius:${cardRadius};">
                <h3 style="font-size:18px;font-weight:800;">${esc(cfg.leftHeading || 'Women’s Edit')}</h3>
                <p style="font-size:12px;opacity:.8;margin:6px 0 12px;">${esc(cfg.leftSub || 'Flat 30% Off')}</p>
                <a style="font-size:11px;font-weight:800;color:#92400e;">${esc(cfg.leftCta || 'Shop Women')} &rarr;</a>
              </div>
              <div style="background:#0f172a;color:white;padding:24px;border-radius:${cardRadius};">
                <h3 style="font-size:18px;font-weight:800;">${esc(cfg.rightHeading || 'Men’s Kurtas')}</h3>
                <p style="font-size:12px;opacity:.8;margin:6px 0 12px;">${esc(cfg.rightSub || 'Starting at ₹799')}</p>
                <a style="font-size:11px;font-weight:800;color:${accent};">${esc(cfg.rightCta || 'Shop Men')} &rarr;</a>
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── COUNTDOWN SALE ─── */
      case 'countdown-sale': {
        sectionsHTML += `
          <section style="background:${cfg.bgColor || '#7c2d12'};color:${cfg.textColor || '#fed7aa'};padding:36px 20px;text-align:center;">
            <h2 style="font-size:22px;font-weight:900;color:white;margin:0 0 16px;">${esc(cfg.title || 'Festival Sale Ends In:')}</h2>
            <div style="display:flex;justify-content:center;gap:12px;margin-bottom:20px;">
              <div style="background:rgba(0,0,0,.4);padding:10px 14px;border-radius:10px;"><span style="font-size:22px;font-weight:900;color:#fbbf24;">02</span><div style="font-size:9px;">DAYS</div></div>
              <div style="background:rgba(0,0,0,.4);padding:10px 14px;border-radius:10px;"><span style="font-size:22px;font-weight:900;color:#fbbf24;">14</span><div style="font-size:9px;">HOURS</div></div>
              <div style="background:rgba(0,0,0,.4);padding:10px 14px;border-radius:10px;"><span style="font-size:22px;font-weight:900;color:#fbbf24;">35</span><div style="font-size:9px;">MINS</div></div>
            </div>
            <a style="display:inline-block;background:#fbbf24;color:#7c2d12;padding:10px 24px;border-radius:12px;font-weight:900;font-size:12px;text-decoration:none;">${esc(cfg.ctaText || 'Grab Deals')}</a>
          </section>`;
        break;
      }

      /* ─── COUPON STRIP ─── */
      case 'coupon-strip': {
        sectionsHTML += `
          <section style="background:#0f172a;color:white;padding:20px 24px;">
            <div style="max-width:1000px;margin:0 auto;display:flex;justify-content:space-around;gap:12px;flex-wrap:wrap;">
              <div style="border:1px dashed ${accent};padding:8px 16px;border-radius:10px;font-size:11px;">
                <strong style="color:${accent};">WELCOME10</strong> — 10% OFF First Order
              </div>
              <div style="border:1px dashed ${accent};padding:8px 16px;border-radius:10px;font-size:11px;">
                <strong style="color:${accent};">BHARAT500</strong> — ₹500 OFF Above ₹2999
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── ABOUT ─── */
      case 'about': {
        const img = aboutImg || cfg.imageUrl || '';
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 20px;">
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:24px;display:flex;gap:24px;align-items:center;">
              ${img ? `<div style="flex:0 0 200px;height:140px;border-radius:${cardRadius};overflow:hidden;"><img src="${esc(img)}" alt="About" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}
              <div style="flex:1;">
                <h2 style="font-size:18px;font-weight:800;margin:0 0 6px;color:${textColor};">${esc(cfg.title || 'About Us')}</h2>
                <p style="font-size:13px;color:#64748b;margin:0;">${esc(cfg.description || '')}</p>
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── TRUST BADGES ─── */
      case 'trust': {
        const badges = cfg.badges || [];
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:16px 20px;">
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center;">
              ${badges.map((b: any) => `
              <div>
                <div style="font-size:12px;font-weight:800;color:${textColor};">${esc(b.title)}</div>
                <div style="font-size:10px;color:#94a3b8;">${esc(b.description)}</div>
              </div>`).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── TESTIMONIALS ─── */
      case 'testimonials': {
        const items = cfg.testimonials?.length ? cfg.testimonials : demoTesti;
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 16px;text-align:center;color:${textColor};">${esc(cfg.title || 'Customer Reviews')}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
              ${items.map((t: any) => `
              <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:16px;">
                <div style="margin-bottom:6px;">${stars(t.rating || 5)}</div>
                <p style="font-size:12px;color:#64748b;margin:0 0 8px;">"${esc(t.text)}"</p>
                <div style="font-size:11px;font-weight:700;color:${textColor};">${esc(t.name)}</div>
              </div>`).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── FAQ ─── */
      case 'faq': {
        const items = cfg.items || [];
        sectionsHTML += `
          <section style="max-width:720px;margin:0 auto;padding:24px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 16px;text-align:center;color:${textColor};">${esc(cfg.title || 'FAQ')}</h2>
            ${items.map((item: any) => `
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:14px;margin-bottom:8px;">
              <div style="font-size:12px;font-weight:700;color:${textColor};">+ ${esc(item.question)}</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px;">${esc(item.answer)}</div>
            </div>`).join('')}
          </section>`;
        break;
      }

      /* ─── CONTACT ─── */
      case 'contact': {
        sectionsHTML += `
          <section style="max-width:600px;margin:0 auto;padding:24px 20px;text-align:center;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 12px;color:${textColor};">${esc(cfg.title || 'Get in Touch')}</h2>
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:16px;font-size:12px;color:#475569;text-align:left;">
              <div>&#9742; Phone: ${esc(store.phone || '+91 9876543210')}</div>
              <div>&#9993; Email: ${esc(store.email || 'support@bharatstore.in')}</div>
            </div>
          </section>`;
        break;
      }

      /* ─── NEWSLETTER ─── */
      case 'newsletter': {
        sectionsHTML += `
          <section style="background:#0f172a;color:white;padding:36px 20px;text-align:center;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 6px;">${esc(cfg.title || 'Join Our VIP Circle')}</h2>
            <p style="font-size:12px;opacity:.8;margin:0 0 16px;">${esc(cfg.subtitle || 'Subscribe for secret discounts and updates.')}</p>
            <div style="max-width:360px;margin:0 auto;display:flex;gap:8px;">
              <input type="text" placeholder="${esc(cfg.placeholder || 'Enter email...')}" style="flex:1;padding:8px 12px;border-radius:8px;border:none;font-size:11px;" />
              <button style="background:${accent};color:${primary};padding:8px 16px;border-radius:8px;font-weight:800;font-size:11px;border:none;">Subscribe</button>
            </div>
          </section>`;
        break;
      }

      /* ─── FOOTER ─── */
      case 'footer': {
        const valueProps = cfg.valueProps || [];
        sectionsHTML += `
          <footer style="background:${primary};color:#cbd5e1;padding:36px 24px 24px;margin-top:32px;">
            <div style="max-width:1200px;margin:0 auto;">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <div style="font-weight:800;color:white;font-size:14px;">${esc(store.tradeName || 'BharatStore')}</div>
                <div style="font-size:11px;opacity:.7;">&copy; ${new Date().getFullYear()} ${esc(store.tradeName || 'BharatStore')}. All rights reserved.</div>
              </div>
            </div>
          </footer>`;
        break;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${bg};
      color: ${textColor};
      -webkit-font-smoothing: antialiased;
    }
    img { display: block; max-width: 100%; }
    section, header, footer, div { overflow: hidden; }
  </style>
</head>
<body>
  <div style="min-height:100vh;display:flex;flex-direction:column;background:${bg};">
    <div style="flex:1;">${sectionsHTML}</div>
  </div>
</body>
</html>`;
}
