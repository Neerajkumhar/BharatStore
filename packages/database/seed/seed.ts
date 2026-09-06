import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_bharat_salt_2026').digest('hex');
}

async function main() {
  console.log('🌱 Seeding BharatStore master data...');

  // 1. Permissions
  const permissionsList = [
    { code: 'business:delete', description: 'Permanently delete business' },
    { code: 'settings:read', description: 'View business settings' },
    { code: 'settings:write', description: 'Update business settings' },
    { code: 'billing:manage', description: 'Manage subscriptions & billing' },
    { code: 'staff:read', description: 'View staff members' },
    { code: 'staff:manage', description: 'Invite & manage staff' },
    { code: 'roles:manage', description: 'Configure custom roles' },
    { code: 'security:read', description: 'Inspect security health & active sessions' },
    { code: 'security:manage', description: 'Revoke sessions & manage API keys' },
    { code: 'audit:read', description: 'Inspect tamper-evident audit logs' },
    { code: 'products:read', description: 'View product catalog' },
    { code: 'products:write', description: 'Create & edit products' },
    { code: 'products:delete', description: 'Archive & delete products' },
    { code: 'categories:manage', description: 'Organize category tree' },
    { code: 'inventory:read', description: 'View inventory stock levels' },
    { code: 'inventory:adjust', description: 'Record manual stock adjustments' },
    { code: 'orders:read', description: 'View customer & POS orders' },
    { code: 'orders:create', description: 'Create walk-in & online orders' },
    { code: 'orders:manage', description: 'Fulfill & dispatch orders' },
    { code: 'orders:cancel', description: 'Cancel orders' },
    { code: 'orders:refund', description: 'Issue refunds' },
    { code: 'customers:read', description: 'View customer directory' },
    { code: 'customers:write', description: 'Create & update customer details' },
    { code: 'customers:khata:read', description: 'View customer credit ledger' },
    { code: 'customers:khata:write', description: 'Record credit payment or debit' },
    { code: 'invoices:read', description: 'View GST tax invoices' },
    { code: 'invoices:print', description: 'Print A4 & thermal receipts' },
    { code: 'invoices:create', description: 'Generate legal invoices' },
    { code: 'finances:export', description: 'Export GSTR-1 & ledger reports' },
    { code: 'finances:view_margins', description: 'Inspect gross profit margins' },
    { code: 'storefront:manage', description: 'Customize & publish storefront theme' },
    { code: 'marketing:manage', description: 'Manage coupons & promotional blasts' },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: { code: perm.code, description: perm.description },
    });
  }
  console.log(`✅ Seeded ${permissionsList.length} global permissions`);

  // 2. System Roles
  let ownerRole = await prisma.role.findFirst({ where: { name: 'OWNER', isSystemRole: true } });
  if (!ownerRole) {
    ownerRole = await prisma.role.create({
      data: {
        name: 'OWNER',
        isSystemRole: true,
        description: 'Business Owner with complete administrative sovereignty',
      },
    });
  }

  let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN', isSystemRole: true } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        isSystemRole: true,
        description: 'Operations administrator with full control except business deletion',
      },
    });
  }

  let staffRole = await prisma.role.findFirst({ where: { name: 'STAFF', isSystemRole: true } });
  if (!staffRole) {
    staffRole = await prisma.role.create({
      data: {
        name: 'STAFF',
        isSystemRole: true,
        description: 'Cashier & Counter assistant for walk-in billing and inventory lookup',
      },
    });
  }

  // Link permissions to roles
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ownerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: ownerRole.id, permissionId: perm.id },
    });
  }
  console.log('✅ Configured system roles & permission links');

  // 3. Demo Tenant Business
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'rajesh-sarees' },
    update: {},
    create: {
      legalName: 'Rajesh Saree Emporium Private Limited',
      tradeName: 'Rajesh Saree Emporium',
      slug: 'rajesh-sarees',
      gstin: '09AAECR1234F1Z5',
      pan: 'AAECR1234F',
      isCompositeScheme: false,
      currency: 'INR',
      phone: '9876543210',
      email: 'care@rajeshsarees.in',
      addressLine1: 'D-35/224, Godowlia Crossing, Dashashwamedh Road',
      city: 'Varanasi',
      stateCode: '09', // Uttar Pradesh
      pincode: '221001',
    },
  });
  console.log(`✅ Created demo business tenant: ${tenant.tradeName} (Slug: ${tenant.slug})`);

  // 4. Demo Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'sunil@bharatstore.in' },
    update: {},
    create: {
      email: 'sunil@bharatstore.in',
      phone: '9876543210',
      fullName: 'Sunil Kumar Verma',
      passwordHash: hashPassword('Bharat@2026'),
      isSuperAdmin: false,
    },
  });

  // Link Membership
  await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: ownerUser.id, tenantId: tenant.id } },
    update: {},
    create: {
      userId: ownerUser.id,
      tenantId: tenant.id,
      roleId: ownerRole.id,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Created owner user: ${ownerUser.fullName} (${ownerUser.email})`);

  // 5. Default Categories
  const silkCategory = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'banarasi-silk-sarees' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Banarasi Silk Sarees',
      slug: 'banarasi-silk-sarees',
      description: 'Authentic handwoven Katan and Georgette silk sarees from Varanasi weavers',
      displayOrder: 1,
    },
  });

  const suitsCategory = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'cotton-chanderi-suits' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Cotton & Chanderi Suits',
      slug: 'cotton-chanderi-suits',
      description: 'Breathable daily wear and festive cotton salwar suit materials',
      displayOrder: 2,
    },
  });

  // 6. Demo Products & Initial Stock
  const product1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'royal-red-katan-silk-saree' } },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: silkCategory.id,
      title: 'Royal Red Pure Katan Silk Banarasi Saree',
      slug: 'royal-red-katan-silk-saree',
      description: 'Intricate golden zari jaal work handwoven in pure mulberry katan silk with matching unstitched blouse piece.',
      hsnCode: '5007',
      gstRate: 5.0,
      baseCost: 2200.0,
      mrp: 4999.0,
      sellingPrice: 3499.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'BAN-KATAN-RED' } },
    update: {},
    create: {
      tenantId: tenant.id,
      productId: product1.id,
      sku: 'BAN-KATAN-RED',
      barcode: '890123450001',
      variantName: 'Sindoor Red / Free Size',
      weightGrams: 850,
      currentStock: 35,
      lowStockAlert: 5,
    },
  });

  await prisma.inventoryLedger.create({
    data: {
      tenantId: tenant.id,
      variantId: variant1.id,
      changeQuantity: 35,
      balanceAfter: 35,
      eventType: 'INWARD',
      notes: 'Initial warehouse intake from Varanasi master weaver',
      createdById: ownerUser.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'chanderi-zari-suit-set' } },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: suitsCategory.id,
      title: 'Chanderi Zari Embroidered 3-Piece Suit Set',
      slug: 'chanderi-zari-suit-set',
      description: 'Unstitched festive suit fabric with pure silk dupatta and cotton bottom.',
      hsnCode: '5208',
      gstRate: 5.0,
      baseCost: 1100.0,
      mrp: 2499.0,
      sellingPrice: 1799.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant2 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'CHAN-SUIT-MINT' } },
    update: {},
    create: {
      tenantId: tenant.id,
      productId: product2.id,
      sku: 'CHAN-SUIT-MINT',
      barcode: '890123450002',
      variantName: 'Mint Green / Unstitched',
      weightGrams: 600,
      currentStock: 4,
      lowStockAlert: 5,
    },
  });

  await prisma.inventoryLedger.create({
    data: {
      tenantId: tenant.id,
      variantId: variant2.id,
      changeQuantity: 4,
      balanceAfter: 4,
      eventType: 'INWARD',
      notes: 'Initial opening stock batch',
      createdById: ownerUser.id,
    },
  });

  // 7. Demo Customer
  const customer = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant.id, phone: '9811223344' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Pooja Sharma',
      phone: '9811223344',
      email: 'pooja.sharma@example.com',
      creditLimit: 15000.0,
      currentBalance: 0,
      notes: 'Loyal customer from Gomti Nagar, Lucknow',
    },
  });

  // 8. Demo Order
  const orderNumber = 'BS-2026-0001';
  const existingOrder = await prisma.order.findUnique({
    where: { tenantId_orderNumber: { tenantId: tenant.id, orderNumber } },
  });

  if (!existingOrder) {
    const createdOrder = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber,
        customerId: customer.id,
        channel: 'POS_COUNTER',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 3332.38,
        discountTotal: 0,
        taxTotal: 166.62,
        shippingTotal: 0,
        grandTotal: 3499.0,
        shippingAddress: {
          name: 'Pooja Sharma',
          phone: '9811223344',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          pincode: '226010',
        },
        billingAddress: {
          name: 'Pooja Sharma',
          phone: '9811223344',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          pincode: '226010',
        },
        items: {
          create: [
            {
              tenantId: tenant.id,
              variantId: variant1.id,
              productTitle: product1.title,
              sku: variant1.sku,
              quantity: 1,
              unitPrice: 3499.0,
              hsnCode: '5007',
              gstRate: 5.0,
              cgstAmount: 83.31,
              sgstAmount: 83.31,
              igstAmount: 0,
              lineTotal: 3499.0,
            },
          ],
        },
        payments: {
          create: [
            {
              tenantId: tenant.id,
              amount: 3499.0,
              gateway: 'UPI_DIRECT',
              status: 'SUCCESS',
              gatewayPaymentId: 'UPI-REF-202609051029',
            },
          ],
        },
        invoices: {
          create: [
            {
              tenantId: tenant.id,
              invoiceNumber: 'INV-2026-0001',
              invoiceType: 'TAX_INVOICE',
              supplierGstin: tenant.gstin!,
              placeOfSupply: '09',
              totalCgst: 83.31,
              totalSgst: 83.31,
              totalIgst: 0,
              grandTotal: 3499.0,
            },
          ],
        },
      },
    });

    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant.id,
        variantId: variant1.id,
        changeQuantity: -1,
        balanceAfter: 34,
        eventType: 'SALE',
        referenceId: createdOrder.id,
        notes: `Sold via In-Store POS Order #${orderNumber}`,
        createdById: ownerUser.id,
      },
    });

    await prisma.productVariant.update({
      where: { id: variant1.id },
      data: { currentStock: 34 },
    });

    console.log(`✅ Created demo order & tax invoice #${orderNumber}`);
  }

  // 9. Storefront Theme Setup
  await prisma.storefrontTheme.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      themeName: 'Heritage Silk',
      primaryColor: '#0f172a',
      accentColor: '#d97706',
      heroTitle: 'Authentic Banarasi Heritage Weaves',
      heroSubtitle: 'Direct from Varanasi master weavers to your wardrobe. 100% Pure Silk Certified.',
      heroBannerUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
      publishedAt: new Date(),
    },
  });
  console.log('✅ Configured storefront theme settings');

  console.log('\n🎉 Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Login Credentials:');
  console.log('Email:    sunil@bharatstore.in');
  console.log('Password: Bharat@2026');
  console.log('Tenant:   rajesh-sarees (Rajesh Saree Emporium)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
