import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const toggleSchema = z.object({
  field: z.enum(['isPlatformWide', 'isActive']),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    const existing = await prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

    const toggled = await prisma.featureFlag.update({
      where: { id },
      data: { [parsed.data.field]: !existing[parsed.data.field] },
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: `feature.toggle.${parsed.data.field}`,
      targetType: 'feature',
      targetId: id,
      targetName: existing.name,
      beforeState: { [parsed.data.field]: existing[parsed.data.field] },
      afterState: { [parsed.data.field]: toggled[parsed.data.field] },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: toggled });
  } catch (error: any) {
    console.error('Super admin toggle feature error:', error);
    return NextResponse.json({ error: 'Failed to toggle feature' }, { status: 500 });
  }
}