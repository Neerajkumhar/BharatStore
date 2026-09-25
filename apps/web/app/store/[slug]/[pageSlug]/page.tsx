import React from 'react';
import { notFound } from 'next/navigation';
import { getTenantDb } from '@bharatstore/database';
import { getRequestStoreLookup, findStorefrontTenant } from '@/lib/storefront-resolver';
import { StorefrontRenderer } from '@/components/storefront/storefront-renderer';

export default async function StorefrontPageRoute({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams?: Promise<{ preview?: string; draft?: string }>;
}) {
  const { slug, pageSlug } = await params;
  const sParams = (await searchParams) || {};
  const isPreviewMode = sParams.preview === 'true' || sParams.draft === 'true';

  const lookup = await getRequestStoreLookup(slug);
  const tenant = await findStorefrontTenant(lookup, {
    include: { storefrontTheme: true },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const tenantDb = getTenantDb(tenant.id);
  const page = await tenantDb.storefrontPage.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug: pageSlug } },
  });

  if (!page) {
    notFound();
  }

  const isPublished = page.status === 'PUBLISHED';
  if (!isPublished && !isPreviewMode) {
    notFound();
  }

  const activeConfig = (isPreviewMode
    ? page.draftConfig || page.publishedConfig
    : page.publishedConfig || page.draftConfig) as any;

  if (!activeConfig || !activeConfig.sections || activeConfig.sections.length === 0) {
    notFound();
  }

  const theme = tenant.storefrontTheme;

  return (
    <StorefrontRenderer
      config={activeConfig}
      slug={slug}
      tenantId={tenant.id}
      isPreview={isPreviewMode}
      storeData={{
        tradeName: tenant.tradeName,
        phone: theme?.contactPhone || tenant.phone,
        email: theme?.contactEmail || tenant.email || undefined,
        address: tenant.addressLine1,
        city: tenant.city,
        pincode: tenant.pincode,
        gstin: tenant.gstin || undefined,
        businessHours: theme?.businessHours || undefined,
        socialLinks: (theme?.socialLinks as any) || {},
      }}
    />
  );
}