import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const tenantDb = getTenantDb(tenantId);

    const tenant = await tenantDb.tenant.findUnique({
      where: { id: tenantId },
      include: { storefrontTheme: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          legalName: tenant.legalName,
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
        theme: tenant.storefrontTheme || {
          themeName: 'default',
          primaryColor: '#0f172a',
          accentColor: '#d97706',
          heroTitle: `Welcome to ${tenant.tradeName}`,
          heroSubtitle: 'Quality products delivered straight to your doorstep',
          heroBannerUrl: '',
          logoUrl: '',
          description: '',
          businessHours: 'Mon - Sat: 9:00 AM - 9:00 PM',
          contactPhone: tenant.phone,
          contactEmail: tenant.email || '',
          socialLinks: { instagram: '', whatsapp: '', facebook: '' },
          isPublished: true,
        },
      },
    });
  } catch (error: any) {
    console.error('Fetch storefront settings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch storefront settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const tenantDb = getTenantDb(tenantId);
    const body = await request.json();

    const {
      tradeName,
      slug,
      phone,
      email,
      addressLine1,
      city,
      stateCode,
      pincode,
      primaryColor,
      accentColor,
      heroTitle,
      heroSubtitle,
      heroBannerUrl,
      logoUrl,
      description,
      businessHours,
      contactPhone,
      contactEmail,
      socialLinks,
      isPublished,
    } = body;

    // 1. Update Tenant details
    const updatedTenant = await tenantDb.tenant.update({
      where: { id: tenantId },
      data: {
        ...(tradeName && { tradeName }),
        ...(slug && { slug }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(addressLine1 && { addressLine1 }),
        ...(city && { city }),
        ...(stateCode && { stateCode }),
        ...(pincode && { pincode }),
      },
    });

    // 2. Upsert StorefrontTheme
    const updatedTheme = await tenantDb.storefrontTheme.upsert({
      where: { tenantId },
      create: {
        tenantId,
        primaryColor: primaryColor || '#0f172a',
        accentColor: accentColor || '#d97706',
        heroTitle: heroTitle || `Welcome to ${updatedTenant.tradeName}`,
        heroSubtitle: heroSubtitle || 'Quality products delivered straight to your doorstep',
        heroBannerUrl: heroBannerUrl || '',
        logoUrl: logoUrl || '',
        description: description || '',
        businessHours: businessHours || 'Mon - Sat: 9:00 AM - 9:00 PM',
        contactPhone: contactPhone || updatedTenant.phone,
        contactEmail: contactEmail || updatedTenant.email || '',
        socialLinks: socialLinks || {},
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        publishedAt: new Date(),
      },
      update: {
        ...(primaryColor && { primaryColor }),
        ...(accentColor && { accentColor }),
        ...(heroTitle !== undefined && { heroTitle }),
        ...(heroSubtitle !== undefined && { heroSubtitle }),
        ...(heroBannerUrl !== undefined && { heroBannerUrl }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(description !== undefined && { description }),
        ...(businessHours !== undefined && { businessHours }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
        publishedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:update_settings',
        resourceType: 'storefront_theme',
        resourceId: updatedTheme.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { tradeName: updatedTenant.tradeName, slug: updatedTenant.slug, isPublished: updatedTheme.isPublished },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        tenant: updatedTenant,
        theme: updatedTheme,
      },
    });
  } catch (error: any) {
    console.error('Update storefront settings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update storefront settings' }, { status: 500 });
  }
}
