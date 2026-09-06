'use client';

import React, { useRef, useEffect, useState } from 'react';

interface BuilderCanvasProps {
  slug: string;
  draftConfig: any;
  storeData: any;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

const viewportWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function BuilderCanvas({ slug, draftConfig, storeData, viewport }: BuilderCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const sections = draftConfig?.sections || [];
  const theme = draftConfig?.theme || {};
  const visibleSections = sections
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  useEffect(() => {
    if (iframeRef.current) {
      setLoading(true);
      const html = generatePreviewHTML(visibleSections, theme, storeData, slug);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
  }, [draftConfig, viewport]);

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-auto flex justify-center">
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 h-full"
        style={{ width: viewportWidths[viewport], maxWidth: '100%' }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Storefront Preview"
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-xs text-slate-400">Loading preview...</div>
          </div>
        )}
      </div>
    </div>
  );
}

function generatePreviewHTML(sections: any[], theme: any, storeData: any, slug: string): string {
  const accent = theme.accentColor || '#d97706';
  const bg = theme.backgroundColor || '#f8fafc';
  const primary = theme.primaryColor || '#0f172a';
  const textColor = theme.textColor || '#0f172a';

  let sectionsHTML = '';

  for (const section of sections) {
    const cfg = section.config || {};
    switch (section.type) {
      case 'announcement':
        if (cfg.visible) {
          sectionsHTML += `<div style="background:${cfg.bgColor || '#0f172a'};color:${cfg.textColor || '#fbbf24'};text-align:center;padding:8px 16px;font-size:12px;font-weight:600;">${escapeHTML(cfg.text || '')}</div>`;
        }
        break;
      case 'hero':
        sectionsHTML += `
          <section style="background:${primary};color:white;text-align:${cfg.alignment || 'center'};padding:${cfg.height === 'large' ? '80px 20px' : cfg.height === 'small' ? '40px 20px' : '60px 20px'};position:relative;">
            ${cfg.imageUrl ? `<img src="${escapeHTML(cfg.imageUrl)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${(cfg.overlayOpacity || 40)/100};" />` : ''}
            <div style="position:relative;z-index:1;max-width:800px;margin:0 auto;">
              <h1 style="font-size:36px;font-weight:800;margin:0 0 12px;">${escapeHTML(cfg.title || 'Welcome')}</h1>
              <p style="font-size:16px;color:#cbd5e1;margin:0 0 20px;">${escapeHTML(cfg.subtitle || '')}</p>
              ${cfg.ctaText ? `<a style="display:inline-block;background:${accent};color:${primary};padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;">${escapeHTML(cfg.ctaText)}</a>` : ''}
            </div>
          </section>`;
        break;
      case 'categories':
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 16px;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 20px;">${escapeHTML(cfg.title || 'Categories')}</h2>
            <div style="display:grid;grid-template-columns:repeat(${cfg.columns || 3},1fr);gap:12px;">
              ${Array.from({length: Math.min(cfg.limit || 3, 6)}).map((_, i) => `
                <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
                  <div style="width:40px;height:40px;border-radius:12px;background:${accent}15;margin:0 auto 8px;"></div>
                  <div style="font-size:12px;font-weight:700;">Category ${i + 1}</div>
                  <div style="font-size:10px;color:#94a3b8;">Products</div>
                </div>
              `).join('')}
            </div>
          </section>`;
        break;
      case 'featured-products':
      case 'product-grid':
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 16px;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 20px;">${escapeHTML(cfg.title || 'Products')}</h2>
            <div style="display:grid;grid-template-columns:repeat(${cfg.columns || 4},1fr);gap:16px;">
              ${Array.from({length: Math.min(cfg.limit || 4, 8)}).map((_, i) => `
                <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                  <div style="height:140px;background:#f1f5f9;"></div>
                  <div style="padding:12px;">
                    <div style="font-size:12px;font-weight:700;">Product ${i + 1}</div>
                    <div style="font-size:14px;font-weight:800;color:${accent};">₹999</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>`;
        break;
      case 'banner':
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:0 16px;">
            <div style="background:${cfg.bgColor || '#fef3c7'};color:${cfg.textColor || '#92400e'};border-radius:16px;padding:40px;text-align:${cfg.layout || 'center'};">
              <h2 style="font-size:24px;font-weight:800;margin:0 0 8px;">${escapeHTML(cfg.heading || 'Special Offer')}</h2>
              <p style="font-size:14px;margin:0 0 16px;">${escapeHTML(cfg.description || '')}</p>
              ${cfg.ctaText ? `<a style="display:inline-block;background:${cfg.textColor || '#92400e'};color:${cfg.bgColor || '#fef3c7'};padding:10px 20px;border-radius:12px;font-weight:700;font-size:13px;text-decoration:none;">${escapeHTML(cfg.ctaText)}</a>` : ''}
            </div>
          </section>`;
        break;
      case 'about':
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 16px;">
            <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:32px;display:flex;gap:32px;align-items:center;${cfg.layout === 'right' ? 'flex-direction:row-reverse;' : ''}">
              ${cfg.imageUrl ? `<div style="flex-shrink:0;width:250px;"><img src="${escapeHTML(cfg.imageUrl)}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;" /></div>` : ''}
              <div>
                <h2 style="font-size:20px;font-weight:800;margin:0 0 8px;">${escapeHTML(cfg.title || 'About Us')}</h2>
                <div style="width:48px;height:4px;border-radius:2px;background:${accent};margin-bottom:12px;"></div>
                <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0;">${escapeHTML(cfg.description || '')}</p>
              </div>
            </div>
          </section>`;
        break;
      case 'trust':
        const badges = cfg.badges || [];
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:0 16px;">
            <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:24px;display:grid;grid-template-columns:repeat(${Math.min(badges.length, 4)},1fr);gap:16px;text-align:center;">
              ${badges.map((b: any) => `
                <div style="padding:12px;border-radius:12px;background:${accent}10;">
                  <div style="font-size:12px;font-weight:700;">${escapeHTML(b.title)}</div>
                  <div style="font-size:10px;color:#94a3b8;">${escapeHTML(b.description)}</div>
                </div>
              `).join('')}
            </div>
          </section>`;
        break;
      case 'faq':
        const faqItems = cfg.items || [];
        sectionsHTML += `
          <section style="max-width:700px;margin:0 auto;padding:32px 16px;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 20px;text-align:center;">${escapeHTML(cfg.title || 'FAQ')}</h2>
            ${faqItems.map((item: any) => `
              <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:8px;">
                <div style="font-size:13px;font-weight:700;">${escapeHTML(item.question)}</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px;">${escapeHTML(item.answer)}</div>
              </div>
            `).join('')}
          </section>`;
        break;
      case 'testimonials':
        const testimonials = cfg.testimonials || [];
        sectionsHTML += `
          <section style="max-width:1200px;margin:0 auto;padding:32px 16px;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 20px;text-align:center;">${escapeHTML(cfg.title || 'Testimonials')}</h2>
            <div style="display:grid;grid-template-columns:repeat(${Math.min(testimonials.length, 3)},1fr);gap:12px;">
              ${testimonials.map((t: any) => `
                <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
                  <p style="font-size:13px;color:#64748b;margin:0 0 12px;">${escapeHTML(t.text)}</p>
                  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f1f5f9;padding-top:8px;">
                    <span style="font-size:12px;font-weight:700;">${escapeHTML(t.name)}</span>
                    <span style="font-size:12px;color:${accent};">${'★'.repeat(t.rating || 5)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>`;
        break;
      case 'contact':
        sectionsHTML += `
          <section style="max-width:600px;margin:0 auto;padding:32px 16px;text-align:center;">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 20px;">${escapeHTML(cfg.title || 'Contact')}</h2>
            <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:left;font-size:13px;">
              ${storeData.phone ? `<div style="margin-bottom:8px;">Phone: ${escapeHTML(storeData.phone)}</div>` : ''}
              ${storeData.email ? `<div style="margin-bottom:8px;">Email: ${escapeHTML(storeData.email)}</div>` : ''}
              ${storeData.address ? `<div>Address: ${escapeHTML(storeData.address)}</div>` : ''}
            </div>
          </section>`;
        break;
      case 'footer':
        sectionsHTML += `
          <footer style="background:#0f172a;color:#cbd5e1;padding:40px 16px;margin-top:32px;">
            <div style="max-width:1200px;margin:0 auto;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:24px;margin-bottom:24px;">
                <div style="font-weight:700;color:white;">${escapeHTML(storeData.tradeName || 'Store')}</div>
                <div style="font-size:11px;color:#64748b;">Powered by BharatStore</div>
              </div>
              <div style="text-align:center;font-size:11px;color:#475569;">© ${new Date().getFullYear()} ${escapeHTML(storeData.tradeName || 'Store')}. All rights reserved.</div>
            </div>
          </footer>`;
        break;
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${bg}; color: ${textColor}; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  <div style="min-height:100vh;display:flex;flex-direction:column;">
    <div style="flex:1;">${sectionsHTML}</div>
  </div>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
