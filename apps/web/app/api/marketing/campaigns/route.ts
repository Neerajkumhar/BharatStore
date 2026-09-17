import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createCampaignSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { requireFeature } from '@/lib/plan-enforcement';
import { PERMISSIONS, FEATURE_FLAGS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.WHATSAPP_BROADCAST);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }

    const campaigns = await tenantDb.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { coupons: true, promotions: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    console.error('Fetch campaigns error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.WHATSAPP_BROADCAST);
    if (featureDenied) return featureDenied;

    const tenantId = auth.tenantId;
    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description, status, startAt, endAt, budget, usageLimit } = parsed.data;

    const campaign = await prisma.campaign.create({
      data: {
        tenantId,
        name,
        description: description || null,
        status: status || 'DRAFT',
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        budget: budget !== undefined ? budget : null,
        usageLimit: usageLimit !== undefined ? usageLimit : null,
        createdById: auth.userId || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'campaign:create',
        resourceType: 'campaign',
        resourceId: campaign.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { name: campaign.name, status: campaign.status },
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create campaign' }, { status: 500 });
  }
}
