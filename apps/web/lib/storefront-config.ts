import { getTenantDb, prisma } from '@bharatstore/database';

interface SaveStorefrontDraftOptions {
  tenantId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  config: any;
  auditAction: string;
  ipAddress: string;
}

/**
 * Builder theme lives in config.theme (per template) but the legacy
 * StorefrontTheme columns (primaryColor/accentColor/...) are still read by the
 * settings page, the fallback hero and other legacy surfaces. Keep them in sync
 * so changing color in the builder shows up everywhere and vice versa.
 */
const THEME_TO_LEGACY_FIELD: Record<string, string> = {
  primaryColor: 'primaryColor',
  accentColor: 'accentColor',
  logoUrl: 'logoUrl',
  heroTitle: 'heroTitle',
  heroSubtitle: 'heroSubtitle',
  heroBannerUrl: 'heroBannerUrl',
  description: 'description',
  businessHours: 'businessHours',
  contactPhone: 'contactPhone',
  contactEmail: 'contactEmail',
};

export async function syncLegacyThemeFromConfig(tenantId: string, config: any) {
  const theme = config?.theme;
  if (!theme || typeof theme !== 'object') return;

  const data: Record<string, string> = {};
  for (const [configKey, field] of Object.entries(THEME_TO_LEGACY_FIELD)) {
    const value = (theme as Record<string, unknown>)[configKey];
    if (typeof value === 'string' && value.trim() !== '') data[field] = value;
  }

  if (Object.keys(data).length === 0) return;

  const tenantDb = getTenantDb(tenantId);
  await tenantDb.storefrontTheme.update({ where: { tenantId }, data });
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

  await syncLegacyThemeFromConfig(opts.tenantId, opts.config);

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