import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookup, findStorefrontTenant } from '@/lib/storefront-resolver';
import { CartProvider } from '@/components/storefront/cart-context';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { StoreHeader } from '@/components/storefront/store-header';
import { StoreFooter } from '@/components/storefront/store-footer';

// Section types that provide their own page chrome. When the active config
// contains one of these, the layout header/footer must NOT render too,
// otherwise the store shows duplicate headers/footers.
const HEADER_REPLACEMENT_SECTIONS = new Set(['sticky-header', 'mega-menu']);

export default async function PublicStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const headersList = await headers();
  const isPreviewMode = headersList.get('x-store-preview') === 'true';

  const lookup = await getRequestStoreLookup(slug);
  const tenant = await findStorefrontTenant(lookup, {
    include: { storefrontTheme: true },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const theme = tenant.storefrontTheme;

  // Same active-config selection used by the home page: draft while previewing,
  // otherwise published (falling back to draft for backward compatibility).
  const activeConfig = (isPreviewMode
    ? theme?.draftConfig || theme?.publishedConfig
    : theme?.publishedConfig || theme?.draftConfig) as any;

  const sections = Array.isArray(activeConfig?.sections) ? (activeConfig.sections as any[]) : [];

  const hasFooterSection = sections.some((s) => s.visible !== false && s.type === 'footer');

  const hasHeaderSection = sections.some(
    (s) => s.visible !== false && HEADER_REPLACEMENT_SECTIONS.has(s.type)
  );

  // Maintenance gate: unpublished stores stay hidden — unless this is a preview
  // request (x-store-preview is set by middleware for ?preview=true / ?draft=true).
  if (theme && theme.isPublished === false && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{tenant.tradeName} Storefront</h1>
        <p className="text-sm text-slate-400">This online store is currently taking a short maintenance break.</p>
      </div>
    );
  }

  return (
    <CartProvider slug={slug}>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-amber-500 selection:text-white font-sans">
        <div>
          {!hasHeaderSection && (
            <StoreHeader
              slug={slug}
              tradeName={tenant.tradeName}
              logoUrl={theme?.logoUrl || undefined}
              phone={theme?.contactPhone || tenant.phone}
              city={tenant.city}
            />
          )}
          <main>{children}</main>
        </div>

        <CartDrawer slug={slug} />

        {!hasFooterSection && (
          <StoreFooter
            slug={slug}
            tradeName={tenant.tradeName}
            phone={theme?.contactPhone || tenant.phone}
            email={theme?.contactEmail || tenant.email || undefined}
            addressLine1={tenant.addressLine1}
            city={tenant.city}
            pincode={tenant.pincode}
            gstin={tenant.gstin || undefined}
            businessHours={theme?.businessHours || undefined}
          />
        )}
      </div>
    </CartProvider>
  );
}
