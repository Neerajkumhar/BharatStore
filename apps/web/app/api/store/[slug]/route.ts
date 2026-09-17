import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookupFromRequest, findStorefrontTenant } from '@/lib/storefront-resolver';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const lookup = getRequestStoreLookupFromRequest(request, slug);
    const tenant = await findStorefrontTenant(lookup, {
      include: { storefrontTheme: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Storefront not found or store is inactive' }, { status: 404 });
    }

    const theme = tenant.storefrontTheme;
    if (theme && theme.isPublished === false) {
      return NextResponse.json({ error: 'Storefront is currently offline' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          tradeName: tenant.tradeName,
          slug: tenant.slug,
          gstin: tenant.gstin,
          phone: tenant.phone,
          email: tenant.email,
          addressLine1: tenant.addressLine1,
          city: tenant.city,
          stateCode: tenant.stateCode,
          pincode: tenant.pincode,
        },
        theme: {
          themeName: theme?.themeName || 'default',
          primaryColor: theme?.primaryColor || '#0f172a',
          accentColor: theme?.accentColor || '#d97706',
          heroTitle: theme?.heroTitle || `Welcome to ${tenant.tradeName}`,
          heroSubtitle: theme?.heroSubtitle || 'Quality products delivered straight to your doorstep',
          heroBannerUrl: theme?.heroBannerUrl || '',
          logoUrl: theme?.logoUrl || '',
          description: theme?.description || '',
          businessHours: theme?.businessHours || 'Mon - Sat: 9:00 AM - 9:00 PM',
          contactPhone: theme?.contactPhone || tenant.phone,
          contactEmail: theme?.contactEmail || tenant.email || '',
          socialLinks: theme?.socialLinks || {},
        },
        publishedConfig: theme?.publishedConfig || null,
      },
    });
  } catch (error: any) {
    console.error('Fetch public store info error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch store details' }, { status: 500 });
  }
}
