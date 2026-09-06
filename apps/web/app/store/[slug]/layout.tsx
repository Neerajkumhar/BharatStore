import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@bharatstore/database';
import { CartProvider } from '@/components/storefront/cart-context';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { StoreHeader } from '@/components/storefront/store-header';
import { StoreFooter } from '@/components/storefront/store-footer';

export default async function PublicStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      storefrontTheme: true,
    },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const theme = tenant.storefrontTheme;
  if (theme && theme.isPublished === false) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{tenant.tradeName} Storefront</h1>
        <p className="text-sm text-slate-400">This online store is currently taking a short maintenance break.</p>
      </div>
    );
  }

  return (
    <CartProvider slug={slug}>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
        <div>
          <StoreHeader
            slug={slug}
            tradeName={tenant.tradeName}
            logoUrl={theme?.logoUrl || undefined}
            phone={theme?.contactPhone || tenant.phone}
            city={tenant.city}
          />
          <main>{children}</main>
        </div>

        <CartDrawer slug={slug} />

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
      </div>
    </CartProvider>
  );
}
