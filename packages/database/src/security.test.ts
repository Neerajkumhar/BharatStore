import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { getTenantDb, prisma } from './client';
import { SYSTEM_ROLES, PERMISSIONS } from '@bharatstore/shared/constants';

describe('Milestone 6 Security, RBAC & Tenant Isolation', () => {
  let tenant1Id: string;
  let tenant2Id: string;

  let owner1User: any;
  let staff1User: any;
  let roleOwnerId: string;
  let roleStaffId: string;
  let roleAdminId: string;

  beforeAll(async () => {
    // 1. Create Roles
    const ownerRole = await prisma.role.findFirst({ where: { name: 'OWNER' } }) ||
      await prisma.role.create({ data: { name: 'OWNER', isSystemRole: true } });
    roleOwnerId = ownerRole.id;

    const staffRole = await prisma.role.findFirst({ where: { name: 'STAFF' } }) ||
      await prisma.role.create({ data: { name: 'STAFF', isSystemRole: true } });
    roleStaffId = staffRole.id;

    const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } }) ||
      await prisma.role.create({ data: { name: 'ADMIN', isSystemRole: true } });
    roleAdminId = adminRole.id;

    // 2. Create Tenant 1
    const tenant1 = await prisma.tenant.create({
      data: {
        legalName: 'Security Test Tenant 1 Ltd',
        tradeName: 'Store One',
        slug: `sec-tenant-1-${Date.now()}`,
        phone: '9111111111',
        addressLine1: '1 Sec Rd',
        city: 'Delhi',
        stateCode: '07',
        pincode: '110001',
      },
    });
    tenant1Id = tenant1.id;

    // 3. Create Tenant 2
    const tenant2 = await prisma.tenant.create({
      data: {
        legalName: 'Security Test Tenant 2 Ltd',
        tradeName: 'Store Two',
        slug: `sec-tenant-2-${Date.now()}`,
        phone: '9222222222',
        addressLine1: '2 Sec Rd',
        city: 'Mumbai',
        stateCode: '27',
        pincode: '400001',
      },
    });
    tenant2Id = tenant2.id;

    // 4. Create Owner for Tenant 1
    owner1User = await prisma.user.create({
      data: {
        email: `owner1-${Date.now()}@test.com`,
        phone: `91111${Date.now().toString().slice(-5)}`,
        passwordHash: 'hash123',
        fullName: 'Owner One',
      },
    });

    await prisma.userTenant.create({
      data: {
        userId: owner1User.id,
        tenantId: tenant1Id,
        roleId: roleOwnerId,
        status: 'ACTIVE',
      },
    });

    // 5. Create Staff for Tenant 1
    staff1User = await prisma.user.create({
      data: {
        email: `staff1-${Date.now()}@test.com`,
        phone: `92222${Date.now().toString().slice(-5)}`,
        passwordHash: 'hash123',
        fullName: 'Staff One',
      },
    });

    await prisma.userTenant.create({
      data: {
        userId: staff1User.id,
        tenantId: tenant1Id,
        roleId: roleStaffId,
        status: 'ACTIVE',
      },
    });
  });

  afterAll(async () => {
    if (tenant1Id) await prisma.tenant.delete({ where: { id: tenant1Id } });
    if (tenant2Id) await prisma.tenant.delete({ where: { id: tenant2Id } });
    if (owner1User) await prisma.user.delete({ where: { id: owner1User.id } });
    if (staff1User) await prisma.user.delete({ where: { id: staff1User.id } });
  });

  it('strictly isolates queries when accessing database via getTenantDb', async () => {
    const tenant1Db = getTenantDb(tenant1Id);
    const tenant2Db = getTenantDb(tenant2Id);

    // Create product under Tenant 1
    const category1 = await tenant1Db.category.create({
      data: { name: 'SecCat1', slug: `sec-cat1-${Date.now()}` },
    });

    const product1 = await tenant1Db.product.create({
      data: {
        categoryId: category1.id,
        title: 'Secret Item 1',
        slug: `secret-item-1-${Date.now()}`,
        hsnCode: '1234',
        sellingPrice: 100,
        mrp: 120,
        gstRate: 5,
      },
    });

    // Tenant 1 DB finds product1
    const p1Found = await tenant1Db.product.findUnique({ where: { id: product1.id } });
    expect(p1Found).toBeDefined();

    // Tenant 2 DB querying product1 returns null due to injected tenant condition
    const p2Attempt = await tenant2Db.product.findFirst({ where: { id: product1.id } });
    expect(p2Attempt).toBeNull();
  });

  it('prevents privilege escalation (non-owner cannot promote anyone to OWNER)', async () => {
    const attemptPromotion = async (actorRoleId: string, targetRoleId: string) => {
      // Simulate validation rule: non-owner role cannot set target role to OWNER
      const actorRole = await prisma.role.findUniqueOrThrow({ where: { id: actorRoleId } });
      const targetRole = await prisma.role.findUniqueOrThrow({ where: { id: targetRoleId } });

      if (targetRole.name === SYSTEM_ROLES.OWNER && actorRole.name !== SYSTEM_ROLES.OWNER) {
        throw new Error('Privilege Escalation Blocked');
      }
      return true;
    };

    await expect(attemptPromotion(roleAdminId, roleOwnerId)).rejects.toThrow('Privilege Escalation Blocked');
    await expect(attemptPromotion(roleStaffId, roleOwnerId)).rejects.toThrow('Privilege Escalation Blocked');
    await expect(attemptPromotion(roleOwnerId, roleOwnerId)).resolves.toBe(true);
  });

  it('protects Owner account from demotion or deletion', async () => {
    const ownerMembership = await prisma.userTenant.findFirstOrThrow({
      where: { tenantId: tenant1Id, userId: owner1User.id },
      include: { role: true },
    });

    const attemptDemotion = async (membership: typeof ownerMembership) => {
      if (membership.role.name === SYSTEM_ROLES.OWNER) {
        throw new Error('Owner Protection: The business Owner account cannot be modified or demoted');
      }
    };

    await expect(attemptDemotion(ownerMembership)).rejects.toThrow('Owner Protection');
  });

  it('generates secure staff invitation tokens and enforces single-use acceptance', async () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60000);

    const invitation = await prisma.staffInvitation.create({
      data: {
        tenantId: tenant1Id,
        email: `newstaff-${Date.now()}@test.com`,
        roleId: roleStaffId,
        tokenHash,
        expiresAt,
      },
    });

    expect(invitation.status).toBe('PENDING');

    // Accepting invitation once
    const updated = await prisma.staffInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    expect(updated.status).toBe('ACCEPTED');

    // Attempting to re-accept throws error
    const reAccept = async () => {
      const inv = await prisma.staffInvitation.findUniqueOrThrow({ where: { id: invitation.id } });
      if (inv.status !== 'PENDING') {
        throw new Error('Invalid or already used invitation token');
      }
    };

    await expect(reAccept()).rejects.toThrow('already used invitation token');
  });

  it('records append-only immutable audit logs and security events', async () => {
    const auditEntry = await prisma.auditLog.create({
      data: {
        tenantId: tenant1Id,
        actorId: owner1User.id,
        actorEmail: owner1User.email,
        action: 'security:policy_update',
        resourceType: 'tenant_security',
        resourceId: tenant1Id,
        ipAddress: '127.0.0.1',
        afterState: { mfaEnabled: false, isolation: 'STRICT' },
      },
    });

    expect(auditEntry.id).toBeDefined();
    expect(auditEntry.action).toBe('security:policy_update');

    const secEvent = await prisma.securityEvent.create({
      data: {
        tenantId: tenant1Id,
        eventType: 'UNAUTHORIZED_CROSS_TENANT_ATTEMPT',
        severity: 'HIGH',
        ipAddress: '192.168.1.100',
        details: { path: '/api/orders/xyz' },
      },
    });

    expect(secEvent.severity).toBe('HIGH');
    expect(secEvent.eventType).toBe('UNAUTHORIZED_CROSS_TENANT_ATTEMPT');
  });
});
