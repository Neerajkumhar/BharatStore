import { getTenantDb, prisma } from '@bharatstore/database';

interface SaveStorefrontDraftOptions {
  tenantId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  config: any;
  auditAction: string;
  ipAddress: string;
}

export async function saveStorefrontDraft(opts: SaveStorefrontDraftOptions) {
  const tenantDb = getTenantDb(opts.tenantId);
  const config = { ...opts.config, updatedAt: new Date().toISOString() };

  const theme = await tenantDb.storefrontTheme.upsert({
    where: { tenantId: opts.tenantId },
    create: {
      tenantId: opts.tenantId,
      draftConfig: config,
    },
    update: {
      draftConfig: config,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: opts.tenantId,
      actorId: opts.actorId || null,
      actorEmail: opts.actorEmail || 'unknown',
      action: opts.auditAction,
      resourceType: 'storefront_theme',
      resourceId: theme.id,
      ipAddress: opts.ipAddress,
      afterState: {
        sectionCount: opts.config.sections?.length || 0,
        templateId: opts.config.templateId || null,
      },
    },
  });

  return theme;
}