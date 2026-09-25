'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { StoreHeader } from './store-header';
import { StoreFooter } from './store-footer';

/**
 * Section-defined page chrome (sticky-header / mega-menu / footer) is only
 * rendered by the home page StorefrontRenderer. The shared store/[slug] layout
 * serves every sub-page (products, checkout, orders, ...) which never render
 * those sections, so the default header/footer must only be suppressed on the
 * home route itself.
 */
function isStoreHome(pathname: string, slug: string): boolean {
  return pathname.replace(/\/+$/, '') === `/store/${slug}`;
}

interface StoreHeaderGateProps {
  slug: string;
  tradeName: string;
  logoUrl?: string;
  phone?: string;
  city?: string;
  replacedBySection: boolean;
}

export function StoreHeaderGate({ slug, tradeName, logoUrl, phone, city, replacedBySection }: StoreHeaderGateProps) {
  const pathname = usePathname();
  if (replacedBySection && isStoreHome(pathname, slug)) return null;
  return <StoreHeader slug={slug} tradeName={tradeName} logoUrl={logoUrl} phone={phone} city={city} />;
}

interface StoreFooterGateProps {
  slug: string;
  tradeName: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  pincode?: string;
  gstin?: string;
  businessHours?: string;
  replacedBySection: boolean;
}

export function StoreFooterGate({
  slug,
  tradeName,
  phone,
  email,
  addressLine1,
  city,
  pincode,
  gstin,
  businessHours,
  replacedBySection,
}: StoreFooterGateProps) {
  const pathname = usePathname();
  if (replacedBySection && isStoreHome(pathname, slug)) return null;
  return (
    <StoreFooter
      slug={slug}
      tradeName={tradeName}
      phone={phone}
      email={email}
      addressLine1={addressLine1}
      city={city}
      pincode={pincode}
      gstin={gstin}
      businessHours={businessHours}
    />
  );
}