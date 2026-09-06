import { describe, it, expect } from 'vitest';
import { prisma, getTenantDb } from './client';
import bcrypt from 'bcryptjs';

describe('Database Seed & Multi-Tenant Verification', () => {
  const DEFAULT_PASSWORD = 'Password@123';

  it('verifies 32 system permissions exist in database', async () => {
    const permissions = await prisma.permission.findMany();
    expect(permissions.length).toBeGreaterThanOrEqual(32);
    const codes = permissions.map((p) => p.code);
    expect(codes).toContain('business:delete');
    expect(codes).toContain('products:read');
    expect(codes).toContain('orders:create');
  });

  it('verifies 4 system roles exist and are configured', async () => {
    const systemRoles = await prisma.role.findMany({
      where: { isSystemRole: true, tenantId: null },
      include: { permissions: { include: { permission: true } } },
    });
    expect(systemRoles.length).toBe(4);
    const roleNames = systemRoles.map((r) => r.name);
    expect(roleNames).toContain('OWNER');
    expect(roleNames).toContain('ADMIN');
    expect(roleNames).toContain('MANAGER');
    expect(roleNames).toContain('STAFF');

    const ownerRole = systemRoles.find((r) => r.name === 'OWNER');
    expect(ownerRole?.permissions.length).toBeGreaterThanOrEqual(32);
  });

  it('verifies two distinct tenants (rajesh-fabrics & varanasi-sarees)', async () => {
    const t1 = await prisma.tenant.findUnique({ where: { slug: 'rajesh-fabrics' } });
    const t2 = await prisma.tenant.findUnique({ where: { slug: 'varanasi-sarees' } });

    expect(t1).not.toBeNull();
    expect(t1?.tradeName).toBe('Rajesh Fabrics');

    expect(t2).not.toBeNull();
    expect(t2?.tradeName).toBe('Varanasi Sarees');
  });

  it('verifies users and bcrypt password hashes for rajesh-fabrics', async () => {
    const t1 = await prisma.tenant.findUniqueOrThrow({ where: { slug: 'rajesh-fabrics' } });
    const userTenants = await prisma.userTenant.findMany({
      where: { tenantId: t1.id },
      include: { user: true, role: true },
    });

    expect(userTenants.length).toBe(4);
    const roles = userTenants.map((ut) => ut.role.name);
    expect(roles).toContain('OWNER');
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('MANAGER');
    expect(roles).toContain('STAFF');

    for (const ut of userTenants) {
      expect(ut.status).toBe('ACTIVE');
      const passwordMatch = bcrypt.compareSync(DEFAULT_PASSWORD, ut.user.passwordHash);
      expect(passwordMatch).toBe(true);
    }
  });

  it('verifies users and bcrypt password hashes for varanasi-sarees', async () => {
    const t2 = await prisma.tenant.findUniqueOrThrow({ where: { slug: 'varanasi-sarees' } });
    const userTenants = await prisma.userTenant.findMany({
      where: { tenantId: t2.id },
      include: { user: true, role: true },
    });

    expect(userTenants.length).toBe(4);
    const roles = userTenants.map((ut) => ut.role.name);
    expect(roles).toContain('OWNER');
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('MANAGER');
    expect(roles).toContain('STAFF');

    for (const ut of userTenants) {
      expect(ut.status).toBe('ACTIVE');
      const passwordMatch = bcrypt.compareSync(DEFAULT_PASSWORD, ut.user.passwordHash);
      expect(passwordMatch).toBe(true);
    }
  });

  it('verifies category and product multi-tenant isolation', async () => {
    const t1 = await prisma.tenant.findUniqueOrThrow({ where: { slug: 'rajesh-fabrics' } });
    const t2 = await prisma.tenant.findUniqueOrThrow({ where: { slug: 'varanasi-sarees' } });

    const t1Db = getTenantDb(t1.id);
    const t2Db = getTenantDb(t2.id);

    const t1Products = await t1Db.product.findMany();
    const t2Products = await t2Db.product.findMany();

    expect(t1Products.length).toBeGreaterThanOrEqual(2);
    expect(t2Products.length).toBeGreaterThanOrEqual(2);

    expect(t1Products.every((p) => p.tenantId === t1.id)).toBe(true);
    expect(t2Products.every((p) => p.tenantId === t2.id)).toBe(true);

    // Cross-tenant check: t1Db querying t2 product slug returns null
    const crossProduct = await t1Db.product.findFirst({
      where: { slug: 'varanasi-royal-gold-zari-saree' },
    });
    expect(crossProduct).toBeNull();
  });
});
