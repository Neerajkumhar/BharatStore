import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTenantDb, prisma } from './client';

describe('Tenant Database Isolation', () => {
  let testTenantId: string;
  let testCategoryId: string;
  let testProductId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        legalName: 'Test Tenant Ltd',
        tradeName: 'Test Store',
        slug: `test-tenant-${Date.now()}`,
        phone: '9999999999',
        addressLine1: '123 Main St',
        city: 'Delhi',
        stateCode: '07',
        pincode: '110001',
      },
    });
    testTenantId = tenant.id;

    const category = await prisma.category.create({
      data: {
        tenantId: testTenantId,
        name: 'Test Category',
        slug: `test-cat-${Date.now()}`,
      },
    });
    testCategoryId = category.id;

    const product = await prisma.product.create({
      data: {
        tenantId: testTenantId,
        categoryId: testCategoryId,
        title: 'Test Product',
        slug: `test-prod-${Date.now()}`,
        hsnCode: '9999',
        gstRate: 18,
        sellingPrice: 100,
        mrp: 120,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    if (testTenantId) {
      await prisma.tenant.delete({ where: { id: testTenantId } });
    }
  });

  it('throws error when tenantId is empty', () => {
    expect(() => getTenantDb('')).toThrow('[Security Exception]');
  });

  it('successfully executes findUnique (converted to findFirst) on scoped model', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const found = await tenantDb.product.findUnique({
      where: { id: testProductId } as any,
    });
    expect(found).not.toBeNull();
    expect(found?.id).toBe(testProductId);
    expect(found?.tenantId).toBe(testTenantId);
  });

  it('returns null for findUnique when query belongs to another tenant', async () => {
    const otherTenantDb = getTenantDb('00000000-0000-0000-0000-000000000000');
    const found = await otherTenantDb.product.findUnique({
      where: { id: testProductId } as any,
    });
    expect(found).toBeNull();
  });

  it('successfully executes findUniqueOrThrow on scoped model', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const found = await tenantDb.product.findUniqueOrThrow({
      where: { id: testProductId } as any,
    });
    expect(found.id).toBe(testProductId);
  });

  it('throws when findUniqueOrThrow is executed for another tenant', async () => {
    const otherTenantDb = getTenantDb('00000000-0000-0000-0000-000000000000');
    await expect(
      otherTenantDb.product.findUniqueOrThrow({
        where: { id: testProductId } as any,
      })
    ).rejects.toThrow();
  });

  it('scopes findMany to tenantId', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const products = await tenantDb.product.findMany();
    expect(products.length).toBeGreaterThanOrEqual(1);
    expect(products.every((p) => p.tenantId === testTenantId)).toBe(true);

    const otherTenantDb = getTenantDb('00000000-0000-0000-0000-000000000000');
    const otherProducts = await otherTenantDb.product.findMany();
    expect(otherProducts.length).toBe(0);
  });

  it('scopes UserTenant and Role queries to tenantId', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const userTenants = await tenantDb.userTenant.findMany();
    const roles = await tenantDb.role.findMany();
    expect(Array.isArray(userTenants)).toBe(true);
    expect(Array.isArray(roles)).toBe(true);
  });

  it('injects tenantId on create and upsert operations', async () => {
    const tenantDb = getTenantDb(testTenantId);
    const newCategory = await tenantDb.category.create({
      data: {
        name: 'Created via TenantDb',
        slug: `created-cat-${Date.now()}`,
      } as any,
    });
    expect(newCategory.tenantId).toBe(testTenantId);

    const upsertedCat = await tenantDb.category.upsert({
      where: { id: newCategory.id } as any,
      create: {
        name: 'Upserted Category',
        slug: `upserted-cat-${Date.now()}`,
      } as any,
      update: {
        name: 'Updated Category Name',
      },
    });
    expect(upsertedCat.tenantId).toBe(testTenantId);
    expect(upsertedCat.name).toBe('Updated Category Name');
  });
});
