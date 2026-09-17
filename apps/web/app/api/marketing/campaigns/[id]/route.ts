import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { updateCampaignSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { requireFeature } from '@/lib/plan-enforcement';
import { PERMISSIONS, FEATURE_FLAGS } from '@bharatstore/shared/constants';

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

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.WHATSAPP_BROADCAST);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const campaign = await tenantDb.campaign.findUnique({
      where: { id },
      include: {
        coupons: true,
        promotions: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Fetch campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch campaign' }, { status: 500 });
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

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.WHATSAPP_BROADCAST);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const body = await request.json();
    const parsed = updateCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const beforeState = await tenantDb.campaign.findUnique({ where: { id } });

    const dataToUpdate: any = { ...parsed.data };
    if (parsed.data.startAt) dataToUpdate.startAt = new Date(parsed.data.startAt);
    if (parsed.data.endAt) dataToUpdate.endAt = new Date(parsed.data.endAt);

    const updated = await tenantDb.campaign.update({
      where: { id },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'campaign:update',
        resourceType: 'campaign',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: beforeState ? { name: beforeState.name, status: beforeState.status } : undefined,
        afterState: { name: updated.name, status: updated.status },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update campaign' }, { status: 500 });
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

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.WHATSAPP_BROADCAST);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const campaign = await tenantDb.campaign.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'campaign:delete',
        resourceType: 'campaign',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { name: campaign.name },
      },
    });

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully', data: campaign });
  } catch (error: any) {
    console.error('Delete campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete campaign' }, { status: 500 });
  }
}
