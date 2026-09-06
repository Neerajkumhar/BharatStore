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
  return '<span style="color:#f59e0b;font-size:11px;letter-spacing:1px;">'
    + '&#9733;'.repeat(full)
    + '<span style="color:#d1d5db;">&#9733;</span>'.repeat(5 - full)
    + '</span>';
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
  demo?: PreviewDemoData,
): string {
  const accent     = theme.accentColor   || '#d97706';
  const bg         = theme.backgroundColor || '#f8fafc';
  const primary    = theme.primaryColor  || '#0f172a';
  const textColor  = theme.textColor     || '#0f172a';
  const cardRadius = theme.borderRadius === 'none' ? '4px'
    : theme.borderRadius === 'sm'   ? '8px'
    : theme.borderRadius === 'md'   ? '12px'
    : theme.borderRadius === 'xl'   ? '20px' : '16px';

  const demoCats   = demo?.categories || [];
  const demoProds  = demo?.products   || [];
  const demoStore  = demo?.store      || storeData;
  const store      = demoStore || demo?.store || { tradeName: 'Store', tagline: '' };
  const bannerImgs = demo?.bannerImages || [];
  const aboutImg   = demo?.aboutImage   || '';
  const demoTesti  = demo?.testimonials || [];

  const heroImg = demo?.heroImage || '';

  let sectionsHTML = '';

  for (const section of sections) {
    const cfg = section.config || {};

    switch (section.type) {

      /* ─── ANNOUNCEMENT BAR ─── */
      case 'announcement': {
        if (!cfg.visible) break;
        sectionsHTML += `
          <div style="background:${cfg.bgColor || '#0f172a'};color:${cfg.textColor || '#fbbf24'};text-align:center;padding:7px 16px;font-size:11px;font-weight:600;letter-spacing:.3px;">
            ${esc(cfg.text)}
          </div>`;
        break;
      }

      /* ─── HEADER (storefront) ─── */
      case 'hero': {
        // Only render the top header once, before the first hero section
        if (!sectionsHTML.includes('<!--header-->')) {
          sectionsHTML += `
          <!--header-->
          <header style="background:${primary};color:white;display:flex;align-items:center;justify-content:space-between;padding:12px 24px;gap:16px;flex-wrap:wrap;">
            <div style="font-weight:800;font-size:15px;white-space:nowrap;">${esc(store.tradeName || 'Store')}</div>
            <nav style="display:flex;gap:16px;font-size:12px;opacity:.85;flex-wrap:wrap;">
              <span>Home</span><span>Shop</span><span>New In</span><span>Sale</span><span>About</span>
            </nav>
            <div style="display:flex;align-items:center;gap:14px;font-size:12px;">
              <span style="opacity:.85;">&#9825;</span>
              <span style="position:relative;">
                &#128722;
                <span style="position:absolute;top:-6px;right:-8px;background:${accent};color:${primary};font-size:9px;font-weight:800;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;">0</span>
              </span>
            </div>
          </header>`;
        }

        const heroHeight = cfg.height === 'large' ? 'min-height:440px'
          : cfg.height === 'small' ? 'min-height:220px' : 'min-height:320px';
        const align = cfg.alignment || 'center';
        const heroImageUrl = heroImg || cfg.imageUrl || '';
        const heroOverlay = heroImageUrl
          ? `background-image:url('${esc(heroImageUrl)}');background-size:cover;background-position:center;position:relative;`
          : `background:${primary};position:relative;`;
        const overlayDiv = heroImageUrl
          ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${((cfg.overlayOpacity ?? 40) / 100).toFixed(2)});"></div>`
          : '';
        const textColorHero = heroImageUrl ? '#ffffff' : 'white';

        sectionsHTML += `
          <section style="${heroHeight};display:flex;align-items:center;padding:48px 24px;${heroOverlay}text-align:${align};color:${textColorHero};">
            ${overlayDiv}
            <div style="position:relative;z-index:1;max-width:640px;${align === 'left' ? 'margin-right:auto;' : align === 'right' ? 'margin-left:auto;' : 'margin:0 auto;'}">
              <h1 style="font-size:34px;font-weight:800;margin:0 0 10px;line-height:1.15;${heroImageUrl ? 'text-shadow:0 2px 12px rgba(0,0,0,.35);' : ''}">${esc(cfg.title || store.tagline || 'Welcome')}</h1>
              <p style="font-size:15px;opacity:.88;margin:0 0 20px;max-width:480px;${align === 'center' ? 'margin-left:auto;margin-right:auto;' : ''}">${esc(cfg.subtitle || store.tagline || '')}</p>
              ${cfg.ctaText ? `
              <a style="display:inline-block;background:${accent};color:${primary};padding:12px 28px;border-radius:${cardRadius};font-weight:700;font-size:13px;text-decoration:none;transition:opacity .2s;">${esc(cfg.ctaText)}</a>` : ''}
            </div>
          </section>`;
        break;
      }

      /* ─── CATEGORIES ─── */
      case 'categories': {
        const count = Math.min(cfg.limit || 4, cfg.columns || 4);
        const imgSize = count >= 5 ? '110px' : count >= 4 ? '130px' : '160px';
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:36px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 20px;color:${textColor};">${esc(cfg.title || 'Shop by Category')}</h2>
            <div style="display:grid;grid-template-columns:repeat(${count},1fr);gap:14px;">
              ${Array.from({ length: count }).map((_, i) => {
                const cat = demoCats[i] || { name: `Category ${i + 1}`, count: 0, image: '' };
                return `
                <div style="border-radius:${cardRadius};overflow:hidden;background:white;border:1px solid #f1f5f9;transition:box-shadow .2s;cursor:pointer;">
                  <div style="height:${imgSize};overflow:hidden;background:#f1f5f9;">
                    ${cat.image ? `<img src="${esc(cat.image)}" alt="${esc(cat.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;background:#e2e8f0;"></div>`}
                  </div>
                  <div style="padding:10px 12px 12px;">
                    <div style="font-size:12px;font-weight:700;color:${textColor};">${esc(cat.name)}</div>
                    ${cfg.showProductCount !== false ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px;">${cat.count} products</div>` : ''}
                  </div>
                </div>`;
              }).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── FEATURED PRODUCTS / PRODUCT GRID ─── */
      case 'featured-products':
      case 'product-grid': {
        const limit   = cfg.limit || 4;
        const cols    = cfg.columns || 4;
        const display = demoProds.slice(0, limit);
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:36px 20px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px;flex-wrap:wrap;gap:8px;">
              <h2 style="font-size:18px;font-weight:800;margin:0;color:${textColor};">${esc(cfg.title || 'Products')}</h2>
              <span style="font-size:11px;color:#94a3b8;cursor:pointer;">View all &rarr;</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px;">
              ${display.map((p: any) => {
                const disc = discountPercent(p.price, p.mrp);
                return `
                <div style="background:white;border-radius:${cardRadius};overflow:hidden;border:1px solid #f1f5f9;transition:box-shadow .2s;cursor:pointer;">
                  <div style="position:relative;aspect-ratio:4/5;overflow:hidden;background:#f8fafc;">
                    ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:48px;">&#128722;</div>`}
                    ${p.badge ? `<span style="position:absolute;top:10px;left:10px;background:${accent};color:${primary};font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;letter-spacing:.2px;">${esc(p.badge)}</span>` : ''}
                    ${disc ? `<span style="position:absolute;top:10px;right:10px;background:#dc2626;color:white;font-size:10px;font-weight:700;padding:3px 7px;border-radius:20px;">-${disc}%</span>` : ''}
                  </div>
                  <div style="padding:12px 12px 14px;">
                    <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">${esc(p.category)}</div>
                    <div style="font-size:12px;font-weight:600;color:${textColor};line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(p.title)}</div>
                    ${p.rating ? `<div style="margin-top:5px;display:flex;align-items:center;gap:4px;">${stars(p.rating)}<span style="font-size:10px;color:#94a3b8;">(${p.reviews || 0})</span></div>` : ''}
                    <div style="margin-top:6px;display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
                      <span style="font-size:15px;font-weight:800;color:${accent};">&#8377;${p.price.toLocaleString('en-IN')}</span>
                      ${p.mrp && p.mrp > p.price ? `<span style="font-size:11px;color:#94a3b8;text-decoration:line-through;">&#8377;${p.mrp.toLocaleString('en-IN')}</span>` : ''}
                    </div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── PROMOTIONAL BANNER ─── */
      case 'banner': {
        const bannerImg = bannerImgs[0] || cfg.imageUrl || '';
        const bgStyle = bannerImg
          ? `background-image:url('${esc(bannerImg)}');background-size:cover;background-position:center;position:relative;color:white;`
          : `background:${cfg.bgColor || '#fef3c7'};color:${cfg.textColor || '#92400e'};`;
        const overlayBanner = bannerImg
          ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,.45);"></div>' : '';

        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:0 20px 12px;">
            <div style="${bgStyle}border-radius:${cardRadius};padding:48px 40px;text-align:${cfg.layout === 'center' ? 'center' : 'left'};position:relative;min-height:160px;display:flex;flex-direction:column;justify-content:center;">
              ${overlayBanner}
              <div style="position:relative;z-index:1;">
                <h2 style="font-size:24px;font-weight:800;margin:0 0 8px;${bannerImg ? 'color:white;' : ''}">${esc(cfg.heading || 'Special Offer')}</h2>
                <p style="font-size:14px;margin:0 0 16px;${bannerImg ? 'color:rgba(255,255,255,.88);' : 'opacity:.8;'}">${esc(cfg.description || '')}</p>
                ${cfg.ctaText ? `<a style="display:inline-block;background:${bannerImg ? 'white' : (cfg.textColor || '#92400e')};color:${bannerImg ? 'black' : (cfg.bgColor || '#fef3c7')};padding:10px 22px;border-radius:${cardRadius};font-weight:700;font-size:13px;text-decoration:none;">${esc(cfg.ctaText)}</a>` : ''}
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── ABOUT ─── */
      case 'about': {
        const img = aboutImg || cfg.imageUrl || '';
        const reverse = cfg.layout === 'right';
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 20px;">
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:32px;display:flex;gap:32px;align-items:center;${reverse ? 'flex-direction:row-reverse;' : ''}">
              ${img ? `
              <div style="flex:0 0 280px;height:200px;border-radius:${cardRadius};overflow:hidden;background:#f8fafc;">
                <img src="${esc(img)}" alt="${esc(cfg.title || 'About')}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />
              </div>` : ''}
              <div style="flex:1;min-width:0;">
                <h2 style="font-size:20px;font-weight:800;margin:0 0 8px;color:${textColor};">${esc(cfg.title || 'About Us')}</h2>
                <div style="width:40px;height:3px;border-radius:2px;background:${accent};margin-bottom:14px;"></div>
                <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0;max-width:520px;">${esc(cfg.description || '')}</p>
              </div>
            </div>
          </section>`;
        break;
      }

      /* ─── TRUST BADGES ─── */
      case 'trust': {
        const badges = cfg.badges || [];
        const iconSVG: Record<string, string> = {
          ShieldCheck: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
          Truck:       '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
          CreditCard:  '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
          FileText:    '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
          RefreshCw:   '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
          Headphones:  '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
          Star:        '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
          HeartHandshake: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        };
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:8px 20px 16px;">
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:24px;display:grid;grid-template-columns:repeat(${Math.min(badges.length, 4)},1fr);gap:16px;text-align:center;">
              ${badges.map((b: any) => `
              <div style="padding:14px 8px;border-radius:${cardRadius};background:${accent}0d;">
                <div style="color:${accent};margin:0 auto 8px;display:flex;justify-content:center;">${iconSVG[b.icon] || ''}</div>
                <div style="font-size:12px;font-weight:700;color:${textColor};">${esc(b.title)}</div>
                <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${esc(b.description)}</div>
              </div>`).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── TESTIMONIALS ─── */
      case 'testimonials': {
        const items = cfg.testimonials?.length ? cfg.testimonials : demoTesti;
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:36px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 20px;text-align:center;color:${textColor};">${esc(cfg.title || 'What Our Customers Say')}</h2>
            <div style="display:grid;grid-template-columns:repeat(${Math.min(items.length, 3)},1fr);gap:14px;">
              ${items.map((t: any) => `
              <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:20px;">
                <div style="margin-bottom:10px;">${stars(t.rating || 5)}</div>
                <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 14px;">"${esc(t.text)}"</p>
                <div style="display:flex;align-items:center;gap:8px;border-top:1px solid #f1f5f9;padding-top:10px;">
                  <div style="width:28px;height:28px;border-radius:50%;background:${accent}18;color:${accent};font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${esc((t.name || '').charAt(0))}</div>
                  <span style="font-size:12px;font-weight:600;color:${textColor};">${esc(t.name)}</span>
                </div>
              </div>`).join('')}
            </div>
          </section>`;
        break;
      }

      /* ─── FAQ ─── */
      case 'faq': {
        const items = cfg.items || [];
        sectionsHTML += `
          <section style="max-width:720px;margin:0 auto;padding:36px 20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 20px;text-align:center;color:${textColor};">${esc(cfg.title || 'FAQ')}</h2>
            ${items.map((item: any) => `
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:16px 18px;margin-bottom:8px;">
              <div style="font-size:13px;font-weight:700;color:${textColor};display:flex;gap:8px;align-items:start;">
                <span style="color:${accent};flex-shrink:0;">+</span>
                <span>${esc(item.question)}</span>
              </div>
              <div style="font-size:12px;color:#64748b;margin-top:6px;padding-left:22px;line-height:1.6;">${esc(item.answer)}</div>
            </div>`).join('')}
          </section>`;
        break;
      }

      /* ─── CONTACT ─── */
      case 'contact': {
        sectionsHTML += `
          <section style="max-width:600px;margin:0 auto;padding:32px 20px;text-align:center;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 16px;color:${textColor};">${esc(cfg.title || 'Get in Touch')}</h2>
            <div style="background:white;border:1px solid #f1f5f9;border-radius:${cardRadius};padding:20px;text-align:left;font-size:13px;color:#475569;">
              ${cfg.showPhone !== false && store.phone ? `<div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;">
                <span style="color:${accent};">&#9742;</span> ${esc(store.phone)}
              </div>` : ''}
              ${cfg.showEmail !== false && store.email ? `<div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;">
                <span style="color:${accent};">&#9993;</span> ${esc(store.email)}
              </div>` : ''}
              ${cfg.showAddress !== false && store.address ? `<div style="display:flex;align-items:center;gap:8px;">
                <span style="color:${accent};">&#9873;</span> ${esc(store.address)}
              </div>` : ''}
            </div>
          </section>`;
        break;
      }

      /* ─── FOOTER ─── */
      case 'footer': {
        const valueProps = cfg.valueProps || [];
        sectionsHTML += `
          <footer style="background:${primary};color:#cbd5e1;padding:48px 24px 32px;margin-top:40px;">
            <div style="max-width:1200px;margin:0 auto;">
              ${cfg.showValueProps !== false && valueProps.length > 0 ? `
              <div style="display:grid;grid-template-columns:repeat(${Math.min(valueProps.length, 4)},1fr);gap:20px;padding-bottom:28px;margin-bottom:28px;border-bottom:1px solid #334155;">
                ${valueProps.map((vp: any) => `
                <div style="text-align:center;">
                  <div style="color:${accent};margin-bottom:6px;font-size:18px;">&#10003;</div>
                  <div style="font-size:12px;font-weight:700;color:white;">${esc(vp.title)}</div>
                  <div style="font-size:10px;opacity:.7;margin-top:3px;">${esc(vp.description)}</div>
                </div>`).join('')}
              </div>` : ''}
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <div style="font-weight:700;color:white;font-size:14px;">${esc(store.tradeName || 'Store')}</div>
                ${cfg.showSocialLinks !== false ? `
                <div style="display:flex;gap:14px;font-size:12px;opacity:.7;">
                  <span>Instagram</span><span>Facebook</span><span>Twitter</span>
                </div>` : ''}
              </div>
              ${cfg.showCopyright !== false ? `
              <div style="text-align:center;font-size:11px;color:#475569;margin-top:24px;">
                &copy; ${new Date().getFullYear()} ${esc(store.tradeName || 'Store')}. All rights reserved. Powered by BharatStore
              </div>` : ''}
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
