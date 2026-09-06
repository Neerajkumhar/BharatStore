import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { updateCouponSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const coupon = await tenantDb.coupon.findUnique({
      where: { id },
      include: {
        campaign: true,
        redemptions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            order: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error('Fetch coupon error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const body = await request.json();
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const beforeState = await tenantDb.coupon.findUnique({ where: { id } });

    const dataToUpdate: any = { ...parsed.data };
    if (parsed.data.code) dataToUpdate.code = parsed.data.code.trim().toUpperCase();
    if (parsed.data.validFrom) dataToUpdate.validFrom = new Date(parsed.data.validFrom);
    if (parsed.data.validUntil) dataToUpdate.validUntil = new Date(parsed.data.validUntil);

    const updated = await tenantDb.coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'coupon:update',
        resourceType: 'coupon',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: beforeState ? { code: beforeState.code, isActive: beforeState.isActive } : undefined,
        afterState: { code: updated.code, isActive: updated.isActive },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    // Soft-disable coupon to preserve redemption history
    const coupon = await tenantDb.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'coupon:disable',
        resourceType: 'coupon',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { isActive: false },
      },
    });

    return NextResponse.json({ success: true, message: 'Coupon deactivated successfully', data: coupon });
  } catch (error: any) {
    console.error('Disable coupon error:', error);
    return NextResponse.json({ error: error.message || 'Failed to disable coupon' }, { status: 500 });
  }
}
