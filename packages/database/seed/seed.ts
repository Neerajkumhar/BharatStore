import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password@123';
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

async function main() {
  console.log('🌱 Seeding BharatStore database with multi-tenant data...');

  // 1. Core System Permissions
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
  console.log(`✅ Seeded ${permissionsList.length} global system permissions`);

  // 2. Core System Roles
  const systemRolesDef = [
    {
      name: 'OWNER',
      description: 'Business Owner with complete administrative sovereignty',
      perms: permissionsList.map((p) => p.code),
    },
    {
      name: 'ADMIN',
      description: 'Operations administrator with full control except business deletion',
      perms: permissionsList.filter((p) => p.code !== 'business:delete').map((p) => p.code),
    },
    {
      name: 'MANAGER',
      description: 'Store manager overseeing day-to-day catalog, inventory, orders, and sales',
      perms: [
        'settings:read',
        'staff:read',
        'products:read',
        'products:write',
        'categories:manage',
        'inventory:read',
        'inventory:adjust',
        'orders:read',
        'orders:create',
        'orders:manage',
        'orders:cancel',
        'customers:read',
        'customers:write',
        'customers:khata:read',
        'customers:khata:write',
        'invoices:read',
        'invoices:print',
        'invoices:create',
        'finances:view_margins',
        'storefront:manage',
        'marketing:manage',
      ],
    },
    {
      name: 'STAFF',
      description: 'Cashier & Counter assistant for walk-in billing and inventory lookup',
      perms: [
        'products:read',
        'inventory:read',
        'orders:read',
        'orders:create',
        'orders:manage',
        'customers:read',
        'customers:write',
        'customers:khata:read',
        'customers:khata:write',
        'invoices:read',
        'invoices:print',
      ],
    },
  ];

  const roleMap = new Map<string, string>(); // name -> id

  for (const rDef of systemRolesDef) {
    let role = await prisma.role.findFirst({
      where: { name: rDef.name, isSystemRole: true, tenantId: null },
    });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: rDef.name,
          isSystemRole: true,
          description: rDef.description,
        },
      });
    }
    roleMap.set(rDef.name, role.id);

    // Link permissions
    for (const code of rDef.perms) {
      const permObj = await prisma.permission.findUnique({ where: { code } });
      if (permObj) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permObj.id } },
          update: {},
          create: { roleId: role.id, permissionId: permObj.id },
        });
      }
    }
  }
  console.log('✅ Configured 4 system roles (OWNER, ADMIN, MANAGER, STAFF) and permission links');

  // 3. SuperAdmin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@bharatstore.in' },
    update: { phone: '9999999999', passwordHash: DEFAULT_PASSWORD_HASH },
    create: {
      email: 'superadmin@bharatstore.in',
      phone: '9999999999',
      fullName: 'BharatStore Platform SuperAdmin',
      passwordHash: DEFAULT_PASSWORD_HASH,
      isSuperAdmin: true,
    },
  });
  console.log(`✅ Created SuperAdmin user: ${superAdmin.email}`);

  // 4. Tenant 1: rajesh-fabrics
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'rajesh-fabrics' },
    update: {},
    create: {
      legalName: 'Rajesh Fabrics Private Limited',
      tradeName: 'Rajesh Fabrics',
      slug: 'rajesh-fabrics',
      gstin: '09AAECR1234F1Z5',
      pan: 'AAECR1234F',
      isCompositeScheme: false,
      currency: 'INR',
      phone: '9876543210',
      email: 'care@rajeshfabrics.com',
      addressLine1: 'D-35/224, Godowlia Crossing, Dashashwamedh Road',
      city: 'Varanasi',
      stateCode: '09',
      pincode: '221001',
    },
  });
  console.log(`✅ Tenant 1: ${tenant1.tradeName} (Slug: ${tenant1.slug})`);

  // Tenant 1 Test Users
  const t1Users = [
    { email: 'owner@rajeshfabrics.com', phone: '9876500001', name: 'Sunil Kumar Verma (Owner)', role: 'OWNER' },
    { email: 'admin@rajeshfabrics.com', phone: '9876500002', name: 'Rajesh Sharma (Admin)', role: 'ADMIN' },
    { email: 'manager@rajeshfabrics.com', phone: '9876500003', name: 'Amit Patel (Manager)', role: 'MANAGER' },
    { email: 'staff@rajeshfabrics.com', phone: '9876500004', name: 'Priya Singh (Staff)', role: 'STAFF' },
  ];

  for (const u of t1Users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { phone: u.phone, passwordHash: DEFAULT_PASSWORD_HASH, fullName: u.name },
      create: {
        email: u.email,
        phone: u.phone,
        fullName: u.name,
        passwordHash: DEFAULT_PASSWORD_HASH,
        isSuperAdmin: false,
      },
    });

    const roleId = roleMap.get(u.role)!;
    await prisma.userTenant.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant1.id } },
      update: { roleId, status: 'ACTIVE' },
      create: {
        userId: user.id,
        tenantId: tenant1.id,
        roleId,
        status: 'ACTIVE',
      },
    });
  }
  console.log(`  └─ Created 4 users (Owner, Admin, Manager, Staff) for ${tenant1.slug}`);

  // Tenant 1 Categories & Products
  const silkCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'banarasi-silk-sarees' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: 'Banarasi Silk Sarees',
      slug: 'banarasi-silk-sarees',
      description: 'Authentic handwoven Katan and Georgette silk sarees from Varanasi weavers',
      displayOrder: 1,
    },
  });

  const suitsCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'cotton-chanderi-suits' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: 'Cotton & Chanderi Suits',
      slug: 'cotton-chanderi-suits',
      description: 'Breathable daily wear and festive cotton salwar suit materials',
      displayOrder: 2,
    },
  });

  const product1T1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'royal-red-katan-silk-saree' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      categoryId: silkCategoryT1.id,
      title: 'Royal Red Pure Katan Silk Banarasi Saree',
      slug: 'royal-red-katan-silk-saree',
      description: 'Intricate golden zari jaal work handwoven in pure mulberry katan silk.',
      hsnCode: '5007',
      gstRate: 5.0,
      baseCost: 2200.0,
      mrp: 4999.0,
      sellingPrice: 3499.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant1T1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant1.id, sku: 'BAN-KATAN-RED' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      productId: product1T1.id,
      sku: 'BAN-KATAN-RED',
      barcode: '890123450001',
      variantName: 'Sindoor Red / Free Size',
      weightGrams: 850,
      currentStock: 35,
      lowStockAlert: 5,
    },
  });

  const ownerUserT1 = await prisma.user.findUnique({ where: { email: 'owner@rajeshfabrics.com' } });

  const existingLedgerT1 = await prisma.inventoryLedger.findFirst({
    where: { tenantId: tenant1.id, variantId: variant1T1.id, eventType: 'INWARD' },
  });
  if (!existingLedgerT1) {
    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant1.id,
        variantId: variant1T1.id,
        changeQuantity: 35,
        balanceAfter: 35,
        eventType: 'INWARD',
        notes: 'Initial warehouse intake from Varanasi master weaver',
        createdById: ownerUserT1?.id,
      },
    });
  }

  const product2T1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'chanderi-zari-suit-set' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      categoryId: suitsCategoryT1.id,
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

  const variant2T1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant1.id, sku: 'CHAN-SUIT-MINT' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      productId: product2T1.id,
      sku: 'CHAN-SUIT-MINT',
      barcode: '890123450002',
      variantName: 'Mint Green / Unstitched',
      weightGrams: 600,
      currentStock: 15,
      lowStockAlert: 5,
    },
  });

  // Tenant 1 Customer & Sample Order
  const customerT1 = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant1.id, phone: '9811223344' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: 'Pooja Sharma',
      phone: '9811223344',
      email: 'pooja.sharma@example.com',
      creditLimit: 15000.0,
      currentBalance: 0,
      notes: 'Loyal customer from Lucknow',
    },
  });

  const orderNumberT1 = 'BS-2026-0001';
  const existingOrderT1 = await prisma.order.findUnique({
    where: { tenantId_orderNumber: { tenantId: tenant1.id, orderNumber: orderNumberT1 } },
  });

  if (!existingOrderT1) {
    const createdOrder = await prisma.order.create({
      data: {
        tenantId: tenant1.id,
        orderNumber: orderNumberT1,
        customerId: customerT1.id,
        channel: 'POS_COUNTER',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 3332.38,
        discountTotal: 0,
        taxTotal: 166.62,
        shippingTotal: 0,
        grandTotal: 3499.0,
        shippingAddress: { name: 'Pooja Sharma', phone: '9811223344', city: 'Lucknow', state: 'UP', pincode: '226010' },
        billingAddress: { name: 'Pooja Sharma', phone: '9811223344', city: 'Lucknow', state: 'UP', pincode: '226010' },
        items: {
          create: [
            {
              tenantId: tenant1.id,
              variantId: variant1T1.id,
              productTitle: product1T1.title,
              sku: variant1T1.sku,
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
              tenantId: tenant1.id,
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
              tenantId: tenant1.id,
              invoiceNumber: 'INV-2026-0001',
              invoiceType: 'TAX_INVOICE',
              supplierGstin: tenant1.gstin!,
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
        tenantId: tenant1.id,
        variantId: variant1T1.id,
        changeQuantity: -1,
        balanceAfter: 34,
        eventType: 'SALE',
        referenceId: createdOrder.id,
        notes: `Sold via In-Store POS Order #${orderNumberT1}`,
        createdById: ownerUserT1?.id,
      },
    });

    await prisma.productVariant.update({
      where: { id: variant1T1.id },
      data: { currentStock: 34 },
    });
  }

  await prisma.storefrontTheme.upsert({
    where: { tenantId: tenant1.id },
    update: {},
    create: {
      tenantId: tenant1.id,
      themeName: 'Heritage Silk',
      primaryColor: '#0f172a',
      accentColor: '#d97706',
      heroTitle: 'Authentic Banarasi Heritage Weaves',
      heroSubtitle: 'Direct from Varanasi master weavers to your wardrobe.',
      publishedAt: new Date(),
    },
  });

  // 4b. Tenant 1 Full-Feature Demo Data (Sunil Verma / Rajesh Fabrics)
  // Enriches tenant 1 with sample data across every module: a deeper category
  // tree, a fuller catalog + inventory, khata ledger, status-varied orders with
  // payments & invoices, marketing campaigns/coupons, notifications, audit and
  // security events. All operations are idempotent so db:seed can be re-run.
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const daysFromNow = (days: number, hours = 0) =>
    new Date(Date.now() + days * 864e5 + hours * 3600e3);

  // -- Deeper category tree (existing top-level + sub-categories)
  const muslinCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'handloom-muslin-sarees' } },
    update: { parentId: null },
    create: {
      tenantId: tenant1.id,
      name: 'Handloom Muslin Sarees',
      slug: 'handloom-muslin-sarees',
      description: 'Airy Bengali handloom muslin sarees for everyday grace',
      displayOrder: 3,
    },
  });

  const kurtasCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'kurtas-dress-material' } },
    update: { parentId: null },
    create: {
      tenantId: tenant1.id,
      name: 'Kurtas & Dress Material',
      slug: 'kurtas-dress-material',
      description: 'Ready-to-wear kurtas and unstitched dress materials',
      displayOrder: 4,
    },
  });

  const bengalCottonCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'bengal-cotton' } },
    update: { parentId: muslinCategoryT1.id },
    create: {
      tenantId: tenant1.id,
      name: 'Bengal Cotton',
      slug: 'bengal-cotton',
      description: 'Soft breathable mulmul cotton sarees',
      parentId: muslinCategoryT1.id,
      displayOrder: 1,
    },
  });

  const cottonKurtasCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'cotton-kurtas' } },
    update: { parentId: kurtasCategoryT1.id },
    create: {
      tenantId: tenant1.id,
      name: 'Cotton Kurtas',
      slug: 'cotton-kurtas',
      description: 'Classic straight-cut cotton kurtas for men',
      parentId: kurtasCategoryT1.id,
      displayOrder: 1,
    },
  });

  const rayonDressCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'rayon-dress-suits' } },
    update: { parentId: kurtasCategoryT1.id },
    create: {
      tenantId: tenant1.id,
      name: 'Rayon Dress Suits',
      slug: 'rayon-dress-suits',
      description: 'Unstitched rayon salwar suits with dupatta',
      parentId: kurtasCategoryT1.id,
      displayOrder: 2,
    },
  });

  const katanSilkCategoryT1 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'katan-silk-collection' } },
    update: { parentId: silkCategoryT1.id },
    create: {
      tenantId: tenant1.id,
      name: 'Katan Silk Collection',
      slug: 'katan-silk-collection',
      description: 'Heirloom pure katan silk sarees',
      parentId: silkCategoryT1.id,
      displayOrder: 1,
    },
  });

  // -- Extended catalog: 3 published + 1 draft product with variants & stock
  const product3T1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'banarasi-muslin-saree' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      categoryId: bengalCottonCategoryT1.id,
      title: 'Banarasi Handloom Muslin Saree',
      slug: 'banarasi-muslin-saree',
      description: 'Featherlight handwoven muslin saree with delicate jamdani borders.',
      hsnCode: '5208',
      gstRate: 5.0,
      baseCost: 1500.0,
      mrp: 3999.0,
      sellingPrice: 2799.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1620377390872-511e9d3a3d37?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant3T1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant1.id, sku: 'MUS-MUSLIN-NVY' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      productId: product3T1.id,
      sku: 'MUS-MUSLIN-NVY',
      barcode: '890123450003',
      variantName: 'Navy Blue / Free Size',
      weightGrams: 450,
      currentStock: 18,
      lowStockAlert: 5,
    },
  });

  const existingLedgerT1P3 = await prisma.inventoryLedger.findFirst({
    where: { tenantId: tenant1.id, variantId: variant3T1.id, eventType: 'INWARD' },
  });
  if (!existingLedgerT1P3) {
    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant1.id,
        variantId: variant3T1.id,
        changeQuantity: 18,
        balanceAfter: 18,
        eventType: 'INWARD',
        notes: 'Opening stock from Bengali muslin weaver cooperative',
        createdById: ownerUserT1?.id,
      },
    });
  }

  const product4T1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'classic-cotton-kurta' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      categoryId: cottonKurtasCategoryT1.id,
      title: 'Classic Cotton Kurta (Men)',
      slug: 'classic-cotton-kurta',
      description: 'Comfortable everyday cotton kurta with mandarin collar.',
      hsnCode: '6204',
      gstRate: 5.0,
      baseCost: 480.0,
      mrp: 1499.0,
      sellingPrice: 999.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant4T1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant1.id, sku: 'KUR-COTTON-BLU' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      productId: product4T1.id,
      sku: 'KUR-COTTON-BLU',
      barcode: '890123450004',
      variantName: 'Sky Blue / M',
      weightGrams: 300,
      currentStock: 60,
      lowStockAlert: 10,
    },
  });

  const existingLedgerT1P4 = await prisma.inventoryLedger.findFirst({
    where: { tenantId: tenant1.id, variantId: variant4T1.id, eventType: 'INWARD' },
  });
  if (!existingLedgerT1P4) {
    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant1.id,
        variantId: variant4T1.id,
        changeQuantity: 60,
        balanceAfter: 60,
        eventType: 'INWARD',
        notes: 'Opening stock purchased from textile mill',
        createdById: ownerUserT1?.id,
      },
    });
  }

  const product5T1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'maroon-rayon-dress-suit' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      categoryId: rayonDressCategoryT1.id,
      title: 'Maroon Rayon Dress Material (3-Piece)',
      slug: 'maroon-rayon-dress-suit',
      description: 'Premium matchless pattern rayon suit with embroidered dupatta.',
      hsnCode: '5208',
      gstRate: 5.0,
      baseCost: 850.0,
      mrp: 2199.0,
      sellingPrice: 1599.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant5T1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant1.id, sku: 'DRS-RAYON-MAROON' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      productId: product5T1.id,
      sku: 'DRS-RAYON-MAROON',
      barcode: '890123450005',
      variantName: 'Maroon / Free Size',
      weightGrams: 500,
      currentStock: 3,
      lowStockAlert: 5,
    },
  });

  const existingLedgerT1P5 = await prisma.inventoryLedger.findFirst({
    where: { tenantId: tenant1.id, variantId: variant5T1.id, eventType: 'INWARD' },
  });
  if (!existingLedgerT1P5) {
    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant1.id,
        variantId: variant5T1.id,
        changeQuantity: 3,
        balanceAfter: 3,
        eventType: 'INWARD',
        notes: 'Restock batch from Lucknow supplier',
        createdById: ownerUserT1?.id,
      },
    });
  }

  const product6T1 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'katan-silk-dupatta-set' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      categoryId: katanSilkCategoryT1.id,
      title: 'Katan Silk Dupatta Set',
      slug: 'katan-silk-dupatta-set',
      description: 'Two-tone katan silk dupatta with zari border.',
      hsnCode: '5007',
      gstRate: 5.0,
      baseCost: 650.0,
      mrp: 1799.0,
      sellingPrice: 1299.0,
      isPublished: false,
      images: [],
    },
  });

  const variant6T1 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant1.id, sku: 'DUP-KATAN-GOLD' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      productId: product6T1.id,
      sku: 'DUP-KATAN-GOLD',
      barcode: '890123450006',
      variantName: 'Gold / Standard',
      weightGrams: 200,
      currentStock: 0,
      lowStockAlert: 5,
    },
  });

  // -- More customers + Khata (credit) ledger
  const customerT1Meena = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant1.id, phone: '9833001122' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: 'Meena Agarwal',
      phone: '9833001122',
      email: 'meena.agarwal@example.com',
      creditLimit: 10000.0,
      currentBalance: 0,
      notes: 'Regular festive-season buyer from Mughalsarai',
    },
  });

  const customerT1Ravi = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant1.id, phone: '9811008899' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: 'Ravi Mishra',
      phone: '9811008899',
      email: 'ravi.mishra@example.com',
      creditLimit: 8000.0,
      currentBalance: 0,
      notes: 'Referral from Pooja Sharma',
    },
  });

  const poojaLedger = await prisma.khataLedger.findFirst({
    where: { tenantId: tenant1.id, customerId: customerT1.id },
  });
  if (!poojaLedger) {
    await prisma.khataLedger.createMany({
      data: [
        { tenantId: tenant1.id, customerId: customerT1.id, type: 'DEBIT_CREDIT_GIVEN', amount: 5000, balanceAfter: 5000, paymentMode: null, notes: 'Diwali sarees on credit' },
        { tenantId: tenant1.id, customerId: customerT1.id, type: 'DEBIT_CREDIT_GIVEN', amount: 1500, balanceAfter: 6500, paymentMode: null, notes: 'Rayon dress material on credit' },
        { tenantId: tenant1.id, customerId: customerT1.id, type: 'CREDIT_PAYMENT_RECEIVED', amount: 2000, balanceAfter: 4500, paymentMode: 'UPI', notes: 'Partial payment via UPI' },
      ],
    });
    await prisma.customer.update({ where: { id: customerT1.id }, data: { currentBalance: 4500 } });
  }

  const meenaLedger = await prisma.khataLedger.findFirst({
    where: { tenantId: tenant1.id, customerId: customerT1Meena.id },
  });
  if (!meenaLedger) {
    await prisma.khataLedger.createMany({
      data: [
        { tenantId: tenant1.id, customerId: customerT1Meena.id, type: 'DEBIT_CREDIT_GIVEN', amount: 3500, balanceAfter: 3500, paymentMode: null, notes: 'Suit material & dupatta on credit' },
        { tenantId: tenant1.id, customerId: customerT1Meena.id, type: 'CREDIT_PAYMENT_RECEIVED', amount: 3500, balanceAfter: 0, paymentMode: 'CASH', notes: 'Settled in full at store' },
      ],
    });
    await prisma.customer.update({ where: { id: customerT1Meena.id }, data: { currentBalance: 0 } });
  }

  const raviLedger = await prisma.khataLedger.findFirst({
    where: { tenantId: tenant1.id, customerId: customerT1Ravi.id },
  });
  if (!raviLedger) {
    await prisma.khataLedger.createMany({
      data: [
        { tenantId: tenant1.id, customerId: customerT1Ravi.id, type: 'DEBIT_CREDIT_GIVEN', amount: 3500, balanceAfter: 3500, paymentMode: null, notes: 'Banarasi saree kept on credit' },
        { tenantId: tenant1.id, customerId: customerT1Ravi.id, type: 'CREDIT_PAYMENT_RECEIVED', amount: 2000, balanceAfter: 1500, paymentMode: 'UPI', notes: 'Partial settlement via UPI' },
      ],
    });
    await prisma.customer.update({ where: { id: customerT1Ravi.id }, data: { currentBalance: 1500 } });
  }

  // -- Status-varied orders with payments, invoices, coupon redemption & stock
  type OrderSeedItem = { product: typeof product1T1; variant: typeof variant1T1; qty: number };
  type OrderSeedPayment = {
    amount: number;
    gateway: 'RAZORPAY' | 'CASHFREE' | 'UPI_DIRECT' | 'CASH' | 'MANUAL';
    status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    gatewayPaymentId?: string;
  };
  type OrderSeed = {
    orderNumber: string;
    customerId: string;
    customerPhone: string;
    channel: 'STOREFRONT' | 'POS_COUNTER' | 'WHATSAPP';
    status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
    items: OrderSeedItem[];
    payments: OrderSeedPayment[];
    invoiceNumber?: string;
    invoiceType?: 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'CREDIT_NOTE';
    invoiceTotals?: { totalCgst: number; totalSgst: number; grandTotal: number };
    couponId?: string;
    couponCode?: string;
    discountTotal?: number;
    notes?: string;
  };

  const seedOrderT1 = async (o: OrderSeed) => {
    const existing = await prisma.order.findUnique({
      where: { tenantId_orderNumber: { tenantId: tenant1.id, orderNumber: o.orderNumber } },
    });
    if (existing) return;

    let subtotal = 0;
    let taxTotal = 0;
    const items: any[] = [];
    for (const it of o.items) {
      const lineTotal = round2(Number(it.product.sellingPrice) * it.qty);
      const gstRate = Number(it.product.gstRate);
      const applyTax = o.invoiceType !== 'BILL_OF_SUPPLY' && o.invoiceType !== 'CREDIT_NOTE';
      const cgst = applyTax ? round2((lineTotal * gstRate) / 2 / 100) : 0;
      const sgst = applyTax ? round2((lineTotal * gstRate) / 2 / 100) : 0;
      subtotal += lineTotal;
      taxTotal += cgst + sgst;
      items.push({
        tenantId: tenant1.id,
        variantId: it.variant.id,
        productTitle: it.product.title,
        sku: it.variant.sku,
        quantity: it.qty,
        unitPrice: Number(it.product.sellingPrice),
        hsnCode: it.product.hsnCode!,
        gstRate: it.product.gstRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: 0,
        lineTotal,
      });
    }
    subtotal = round2(subtotal);
    taxTotal = round2(taxTotal);
    const discount = round2(o.discountTotal ?? 0);
    const grandTotal = round2(subtotal + taxTotal - discount);

    const invoiceTotals = o.invoiceTotals ?? {
      totalCgst: round2(taxTotal / 2),
      totalSgst: round2(taxTotal / 2),
      grandTotal,
    };

    const order = await prisma.order.create({
      data: {
        tenantId: tenant1.id,
        orderNumber: o.orderNumber,
        customerId: o.customerId,
        couponId: o.couponId ?? null,
        couponCode: o.couponCode ?? null,
        channel: o.channel,
        status: o.status,
        paymentStatus: o.paymentStatus,
        subtotal,
        discountTotal: discount,
        taxTotal,
        shippingTotal: 0,
        grandTotal,
        shippingAddress: { name: 'Rajesh Fabrics Store', phone: tenant1.phone, city: tenant1.city, state: 'UP', pincode: tenant1.pincode },
        billingAddress: { name: 'Rajesh Fabrics Store', phone: tenant1.phone, city: tenant1.city, state: 'UP', pincode: tenant1.pincode },
        notes: o.notes ?? null,
        items: { create: items },
        payments: {
          create: o.payments.map((p) => ({
            tenantId: tenant1.id,
            amount: p.amount,
            gateway: p.gateway,
            status: p.status,
            gatewayPaymentId: p.gatewayPaymentId ?? null,
          })),
        },
        invoices: o.invoiceNumber
          ? {
              create: [
                {
                  tenantId: tenant1.id,
                  invoiceNumber: o.invoiceNumber,
                  invoiceType: o.invoiceType!,
                  supplierGstin: tenant1.gstin!,
                  placeOfSupply: '09',
                  totalCgst: invoiceTotals.totalCgst,
                  totalSgst: invoiceTotals.totalSgst,
                  totalIgst: 0,
                  grandTotal: invoiceTotals.grandTotal,
                },
              ],
            }
          : undefined,
        redemptions: o.couponId
          ? {
              create: [
                {
                  tenantId: tenant1.id,
                  couponId: o.couponId,
                  customerId: o.customerId,
                  customerPhone: o.customerPhone,
                  discountAmount: discount,
                },
              ],
            }
          : undefined,
      },
    });

    if (o.status !== 'CANCELLED') {
      for (const it of o.items) {
        const v = await prisma.productVariant.findUnique({ where: { id: it.variant.id } });
        const newStock = Math.max(0, (v?.currentStock ?? 0) - it.qty);
        await prisma.inventoryLedger.create({
          data: {
            tenantId: tenant1.id,
            variantId: it.variant.id,
            changeQuantity: -it.qty,
            balanceAfter: newStock,
            eventType: 'SALE',
            referenceId: order.id,
            notes: `Sold via ${o.channel} Order #${o.orderNumber}`,
            createdById: ownerUserT1?.id,
          },
        });
        await prisma.productVariant.update({ where: { id: it.variant.id }, data: { currentStock: newStock } });
      }
    }

    if (o.couponId) {
      await prisma.coupon.update({ where: { id: o.couponId }, data: { usageCount: { increment: 1 } } });
      const c = await prisma.coupon.findUnique({ where: { id: o.couponId }, select: { campaignId: true } });
      if (c?.campaignId) {
        await prisma.campaign.update({ where: { id: c.campaignId }, data: { usageCount: { increment: 1 } } });
      }
    }
  };

  await seedOrderT1({
    orderNumber: 'BS-2026-0002',
    customerId: customerT1Meena.id,
    customerPhone: '9833001122',
    channel: 'POS_COUNTER',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    items: [{ product: product2T1, variant: variant2T1, qty: 2 }],
    payments: [{ amount: round2(Number(product2T1.sellingPrice) * 2), gateway: 'CASH', status: 'SUCCESS' }],
    invoiceNumber: 'INV-2026-0002',
    invoiceType: 'TAX_INVOICE',
    notes: 'Walk-in counter sale, cash received',
  });

  await seedOrderT1({
    orderNumber: 'BS-2026-0003',
    customerId: customerT1Ravi.id,
    customerPhone: '9811008899',
    channel: 'WHATSAPP',
    status: 'PACKED',
    paymentStatus: 'PAID',
    items: [{ product: product1T1, variant: variant1T1, qty: 1 }],
    payments: [{ amount: 3499, gateway: 'UPI_DIRECT', status: 'SUCCESS', gatewayPaymentId: 'UPI-REF-202609070812' }],
    invoiceNumber: 'INV-2026-0003',
    invoiceType: 'TAX_INVOICE',
    notes: 'Ordered over WhatsApp, packed for pickup',
  });

  await seedOrderT1({
    orderNumber: 'BS-2026-0004',
    customerId: customerT1.id,
    customerPhone: '9811223344',
    channel: 'STOREFRONT',
    status: 'DISPATCHED',
    paymentStatus: 'PARTIAL',
    items: [{ product: product3T1, variant: variant3T1, qty: 1 }],
    payments: [{ amount: 2799, gateway: 'RAZORPAY', status: 'INITIATED', gatewayPaymentId: null }],
    invoiceNumber: 'INV-2026-0004',
    invoiceType: 'BILL_OF_SUPPLY',
    invoiceTotals: { totalCgst: 0, totalSgst: 0, grandTotal: 2799 },
    notes: 'Bill of supply (composite scheme), payment pending settlement',
  });

  await seedOrderT1({
    orderNumber: 'BS-2026-0005',
    customerId: customerT1.id,
    customerPhone: '9811223344',
    channel: 'POS_COUNTER',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    items: [{ product: product1T1, variant: variant1T1, qty: 1 }],
    payments: [
      { amount: 3499, gateway: 'CASH', status: 'SUCCESS' },
      { amount: 3499, gateway: 'MANUAL', status: 'REFUNDED', gatewayPaymentId: 'REFUND-202609090300' },
    ],
    invoiceNumber: 'INV-2026-0005',
    invoiceType: 'CREDIT_NOTE',
    invoiceTotals: { totalCgst: 83.31, totalSgst: 83.31, grandTotal: 3499 },
    notes: 'Customer returned saree; refunded at counter',
  });

  // -- Marketing: campaigns, promotion rules, coupons
  const ensureCampaign = async (
    name: string,
    description: string,
    status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED',
    startAt: Date,
    endAt: Date,
    budget: number,
    usageLimit: number,
    usageCount = 0
  ) => {
    const existing = await prisma.campaign.findFirst({ where: { tenantId: tenant1.id, name } });
    if (existing) return existing;
    return prisma.campaign.create({
      data: {
        tenantId: tenant1.id,
        name,
        description,
        status,
        startAt,
        endAt,
        budget,
        usageLimit,
        usageCount,
        createdById: ownerUserT1?.id,
      },
    });
  };

  const diwaliCampaign = await ensureCampaign(
    'Diwali Dhanteras Sale',
    'Storewide 10% off across Banarasi weaves for Diwali week.',
    'ACTIVE',
    daysFromNow(-5),
    daysFromNow(5),
    20000,
    200,
    0
  );
  const monsoonCampaign = await ensureCampaign(
    'Monsoon Muslin Offer',
    'Flat ₹200 off on orders above ₹1,999 in the rainy season.',
    'ENDED',
    daysFromNow(-40),
    daysFromNow(-10),
    10000,
    500
  );
  const navratriCampaign = await ensureCampaign(
    'Navratri Advance Booking',
    'Early-bird 15% off on the Katan Silk Collection.',
    'SCHEDULED',
    daysFromNow(10),
    daysFromNow(40),
    30000,
    150
  );

  const ensurePromotionRule = async (name: string, data: {
    campaignId: string;
    discountType: 'PERCENTAGE' | 'FLAT_AMOUNT';
    discountValue: number;
    targetType: 'ALL_PRODUCTS' | 'SELECTED_PRODUCTS' | 'SELECTED_CATEGORIES';
    targetIds?: string[];
    minOrderValue?: number;
    maxDiscount?: number;
    usageCount?: number;
    isActive?: boolean;
  }) => {
    const existing = await prisma.promotionRule.findFirst({ where: { tenantId: tenant1.id, name } });
    if (existing) return existing;
    return prisma.promotionRule.create({
      data: {
        tenantId: tenant1.id,
        campaignId: data.campaignId,
        name,
        discountType: data.discountType,
        discountValue: data.discountValue,
        targetType: data.targetType,
        targetIds: data.targetIds ?? [],
        minOrderValue: data.minOrderValue ?? 0,
        maxDiscount: data.maxDiscount ?? null,
        usageCount: data.usageCount ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  };

  const diwaliRule = await ensurePromotionRule('Diwali 10% Storewide', {
    campaignId: diwaliCampaign.id,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    targetType: 'ALL_PRODUCTS',
    minOrderValue: 0,
    usageCount: 0,
  });
  const monsoonRule = await ensurePromotionRule('Monsoon Flat ₹200 Off', {
    campaignId: monsoonCampaign.id,
    discountType: 'FLAT_AMOUNT',
    discountValue: 200,
    targetType: 'ALL_PRODUCTS',
    minOrderValue: 1999,
  });
  const navratriRule = await ensurePromotionRule('Navratri Silk 15% Off', {
    campaignId: navratriCampaign.id,
    discountType: 'PERCENTAGE',
    discountValue: 15,
    targetType: 'SELECTED_CATEGORIES',
    targetIds: [silkCategoryT1.id],
    minOrderValue: 999,
    maxDiscount: 500,
  });

  const couponFestive10 = await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant1.id, code: 'FESTIVE10' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      campaignId: diwaliCampaign.id,
      promotionRuleId: diwaliRule.id,
      code: 'FESTIVE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      targetType: 'ALL_PRODUCTS',
      minOrderValue: 500,
      maxDiscount: 500,
      validFrom: daysFromNow(-5),
      validUntil: daysFromNow(10),
      usageLimit: 200,
      usageCount: 0,
      perCustomerLimit: 1,
      isActive: true,
    },
  });

  const couponWelcome200 = await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant1.id, code: 'WELCOME200' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      campaignId: monsoonCampaign.id,
      promotionRuleId: monsoonRule.id,
      code: 'WELCOME200',
      discountType: 'FLAT_AMOUNT',
      discountValue: 200,
      targetType: 'ALL_PRODUCTS',
      minOrderValue: 1499,
      validFrom: daysFromNow(-40),
      validUntil: daysFromNow(-10),
      usageLimit: 500,
      usageCount: 0,
      perCustomerLimit: 1,
      isActive: false,
    },
  });

  const couponNavratri15 = await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant1.id, code: 'NAVRATRI15' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      campaignId: navratriCampaign.id,
      promotionRuleId: navratriRule.id,
      code: 'NAVRATRI15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      targetType: 'SELECTED_CATEGORIES',
      targetIds: [silkCategoryT1.id],
      minOrderValue: 999,
      maxDiscount: 500,
      validFrom: daysFromNow(10),
      validUntil: daysFromNow(40),
      usageLimit: 150,
      usageCount: 0,
      perCustomerLimit: 1,
      isActive: true,
    },
  });

  await seedOrderT1({
    orderNumber: 'BS-2026-0006',
    customerId: customerT1Meena.id,
    customerPhone: '9833001122',
    channel: 'STOREFRONT',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    items: [{ product: product4T1, variant: variant4T1, qty: 3 }],
    payments: [{ amount: 2847.15, gateway: 'CASHFREE', status: 'SUCCESS', gatewayPaymentId: 'cashfree_ord_88430012' }],
    invoiceNumber: 'INV-2026-0006',
    invoiceType: 'TAX_INVOICE',
    couponId: couponFestive10.id,
    couponCode: 'FESTIVE10',
    discountTotal: 299.7,
    notes: 'Festive sale order with coupon FESTIVE10',
  });

  // -- Notifications: templates, preference & sample notifications
  for (const tpl of [
    { name: 'Order Confirmed SMS', type: 'ORDER_CONFIRMED' as const, channel: 'SMS' as const, subject: 'Order {orderNumber} confirmed', body: 'Hi {customerName}, your order {orderNumber} is confirmed. - {storeName}' },
    { name: 'Payment Received In-App', type: 'PAYMENT_RECEIVED' as const, channel: 'IN_APP' as const, subject: 'Payment received', body: 'We received ₹{amount} for order {orderNumber}. Thank you!' },
    { name: 'Low Stock Alert SMS', type: 'LOW_STOCK' as const, channel: 'SMS' as const, subject: 'Low stock alert', body: '{productName} ({sku}) has only {stock} left. Reorder now. - {storeName}' },
    { name: 'Festive Campaign Blast', type: 'CAMPAIGN' as const, channel: 'WHATSAPP' as const, subject: 'Diwali Dhanteras Sale is live', body: 'Get 10% off storewide with code FESTIVE10. Shop now!' },
  ]) {
    await prisma.notificationTemplate.upsert({
      where: { tenantId_name: { tenantId: tenant1.id, name: tpl.name } },
      update: {},
      create: {
        tenantId: tenant1.id,
        name: tpl.name,
        type: tpl.type,
        channel: tpl.channel,
        subject: tpl.subject,
        body: tpl.body,
        variables: ['customerName', 'orderNumber', 'amount', 'productName', 'sku', 'storeName', 'stock'],
        isEnabled: true,
      },
    });
  }

  await prisma.notificationPreference.upsert({
    where: { tenantId_customerId: { tenantId: tenant1.id, customerId: customerT1Meena.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      customerId: customerT1Meena.id,
      orderUpdates: true,
      paymentUpdates: true,
      marketing: true,
      businessAlerts: false,
      preferredChannel: 'WHATSAPP',
    },
  });

  const ensureNotification = async (n: {
    customerId?: string;
    type: 'ORDER_CONFIRMED' | 'ORDER_PACKED' | 'ORDER_DISPATCHED' | 'ORDER_DELIVERED' | 'PAYMENT_RECEIVED' | 'KHATA_PAYMENT_DUE' | 'LOW_STOCK' | 'CAMPAIGN' | 'COUPON' | 'SYSTEM';
    channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';
    title: string;
    message: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    isRead: boolean;
    status: 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) => {
    const existing = await prisma.notification.findFirst({
      where: { tenantId: tenant1.id, title: n.title, message: n.message },
    });
    if (existing) return;
    await prisma.notification.create({
      data: {
        tenantId: tenant1.id,
        customerId: n.customerId ?? null,
        type: n.type,
        channel: n.channel,
        title: n.title,
        message: n.message,
        priority: n.priority,
        isRead: n.isRead,
        status: n.status,
        relatedEntityType: n.relatedEntityType ?? null,
        relatedEntityId: n.relatedEntityId ?? null,
        sentAt: n.status === 'DELIVERED' || n.status === 'SENT' ? daysFromNow(-1) : null,
        deliveredAt: n.status === 'DELIVERED' ? daysFromNow(-1, -2) : null,
        readAt: n.isRead ? daysFromNow(-1, -4) : null,
      },
    });
  };

  await ensureNotification({
    customerId: customerT1Meena.id,
    type: 'ORDER_CONFIRMED',
    channel: 'IN_APP',
    title: 'Order BS-2026-0002 confirmed',
    message: 'Your Chanderi Suit Set order is confirmed and being packed. Thank you for shopping at Rajesh Fabrics!',
    priority: 'NORMAL',
    isRead: true,
    status: 'DELIVERED',
    relatedEntityType: 'ORDER',
    relatedEntityId: 'BS-2026-0002',
  });
  await ensureNotification({
    customerId: customerT1Meena.id,
    type: 'PAYMENT_RECEIVED',
    channel: 'IN_APP',
    title: 'Payment received for BS-2026-0006',
    message: 'We received ₹2,847.15 for order BS-2026-0006. Thank you!',
    priority: 'NORMAL',
    isRead: false,
    status: 'DELIVERED',
    relatedEntityType: 'ORDER',
    relatedEntityId: 'BS-2026-0006',
  });
  await ensureNotification({
    type: 'LOW_STOCK',
    channel: 'IN_APP',
    title: 'Low stock alert: Maroon Rayon Dress Suit',
    message: 'DRS-RAYON-MAROON has only 3 units left (alert at 5). Reorder from your supplier today.',
    priority: 'HIGH',
    isRead: false,
    status: 'DELIVERED',
    relatedEntityType: 'PRODUCT_VARIANT',
    relatedEntityId: variant5T1.id,
  });
  await ensureNotification({
    type: 'CAMPAIGN',
    channel: 'WHATSAPP',
    title: 'Diwali Dhanteras Sale is live',
    message: 'Flat excitement: 10% off storewide with code FESTIVE10. Shop the festive collection now!',
    priority: 'NORMAL',
    isRead: false,
    status: 'SENT',
  });

  // -- Audit trail & security events
  const ensureAuditLog = async (action: string, resourceType: string, resourceId: string, afterState: Record<string, unknown>) => {
    const existing = await prisma.auditLog.findFirst({
      where: { tenantId: tenant1.id, action, resourceType, resourceId },
    });
    if (existing) return;
    await prisma.auditLog.create({
      data: {
        tenantId: tenant1.id,
        actorId: ownerUserT1?.id,
        actorEmail: 'owner@rajeshfabrics.com',
        action,
        resourceType,
        resourceId,
        ipAddress: '103.97.66.221',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0',
        afterState: afterState as any,
      },
    });
  };

  await ensureAuditLog('PRODUCT_CREATED', 'PRODUCT', product3T1.id, { title: product3T1.title, slug: product3T1.slug });
  await ensureAuditLog('ORDER_STATUS_CHANGED', 'ORDER', 'BS-2026-0006', { from: 'CONFIRMED', to: 'DELIVERED' });

  const ensureSecurityEvent = async (eventType: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', ipAddress: string, details: Record<string, unknown>) => {
    const existing = await prisma.securityEvent.findFirst({
      where: { tenantId: tenant1.id, eventType, ipAddress },
    });
    if (existing) return;
    await prisma.securityEvent.create({
      data: {
        tenantId: tenant1.id,
        eventType,
        severity,
        ipAddress,
        details: details as any,
      },
    });
  };

  await ensureSecurityEvent('LOGIN_SUCCESS', 'LOW', '103.97.66.221', { email: 'owner@rajeshfabrics.com', device: 'Chrome on Windows 10' });
  await ensureSecurityEvent('FAILED_LOGIN', 'HIGH', '203.0.113.45', { email: 'unknown@example.com', reason: 'invalid_password' });
  await ensureSecurityEvent('ROLE_PERMISSION_CHANGED', 'MEDIUM', '103.97.66.221', { role: 'MANAGER', permission: 'finances:export' });

  console.log('✅ Seeded Tenant 1 full-feature demo data (catalog, khata, orders, marketing, notifications, audit, security)');

  // 5. Tenant 2: varanasi-sarees
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'varanasi-sarees' },
    update: {},
    create: {
      legalName: 'Varanasi Sarees & Textiles Private Limited',
      tradeName: 'Varanasi Sarees',
      slug: 'varanasi-sarees',
      gstin: '09BBBDS9876G1Z2',
      pan: 'BBBDS9876G',
      isCompositeScheme: false,
      currency: 'INR',
      phone: '9812345678',
      email: 'info@varanasisarees.com',
      addressLine1: 'K-46/12, Chowk Bazar',
      city: 'Varanasi',
      stateCode: '09',
      pincode: '221001',
    },
  });
  console.log(`✅ Tenant 2: ${tenant2.tradeName} (Slug: ${tenant2.slug})`);

  // Tenant 2 Test Users
  const t2Users = [
    { email: 'owner@varanasisarees.com', phone: '9812300001', name: 'Ramesh Gupta (Owner)', role: 'OWNER' },
    { email: 'admin@varanasisarees.com', phone: '9812300002', name: 'Suresh Gupta (Admin)', role: 'ADMIN' },
    { email: 'manager@varanasisarees.com', phone: '9812300003', name: 'Vikas Yadav (Manager)', role: 'MANAGER' },
    { email: 'staff@varanasisarees.com', phone: '9812300004', name: 'Neha Gupta (Staff)', role: 'STAFF' },
  ];

  for (const u of t2Users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { phone: u.phone, passwordHash: DEFAULT_PASSWORD_HASH, fullName: u.name },
      create: {
        email: u.email,
        phone: u.phone,
        fullName: u.name,
        passwordHash: DEFAULT_PASSWORD_HASH,
        isSuperAdmin: false,
      },
    });

    const roleId = roleMap.get(u.role)!;
    await prisma.userTenant.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant2.id } },
      update: { roleId, status: 'ACTIVE' },
      create: {
        userId: user.id,
        tenantId: tenant2.id,
        roleId,
        status: 'ACTIVE',
      },
    });
  }
  console.log(`  └─ Created 4 users (Owner, Admin, Manager, Staff) for ${tenant2.slug}`);

  // Tenant 2 Categories & Products
  const handloomCategoryT2 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'zari-handloom-sarees' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      name: 'Zari Handloom Sarees',
      slug: 'zari-handloom-sarees',
      description: 'Exclusive gold and silver zari woven handloom sarees',
      displayOrder: 1,
    },
  });

  const dupattasCategoryT2 = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'silk-dupattas-stoles' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      name: 'Silk Dupattas & Stoles',
      slug: 'silk-dupattas-stoles',
      description: 'Handcrafted silk dupattas and designer stoles',
      displayOrder: 2,
    },
  });

  const product1T2 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'varanasi-royal-gold-zari-saree' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      categoryId: handloomCategoryT2.id,
      title: 'Varanasi Royal Gold Zari Silk Saree',
      slug: 'varanasi-royal-gold-zari-saree',
      description: 'Traditional heritage brocade work with pure gold zari finish.',
      hsnCode: '5007',
      gstRate: 5.0,
      baseCost: 4000.0,
      mrp: 8999.0,
      sellingPrice: 6499.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant1T2 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant2.id, sku: 'VAR-ZARI-GLD' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      productId: product1T2.id,
      sku: 'VAR-ZARI-GLD',
      barcode: '890987650001',
      variantName: 'Royal Gold / Free Size',
      weightGrams: 900,
      currentStock: 25,
      lowStockAlert: 5,
    },
  });

  const ownerUserT2 = await prisma.user.findUnique({ where: { email: 'owner@varanasisarees.com' } });

  const existingLedgerT2 = await prisma.inventoryLedger.findFirst({
    where: { tenantId: tenant2.id, variantId: variant1T2.id, eventType: 'INWARD' },
  });
  if (!existingLedgerT2) {
    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant2.id,
        variantId: variant1T2.id,
        changeQuantity: 25,
        balanceAfter: 25,
        eventType: 'INWARD',
        notes: 'Opening stock intake from master weavers',
        createdById: ownerUserT2?.id,
      },
    });
  }

  const product2T2 = await prisma.product.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'handcrafted-tanchoi-silk-dupatta' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      categoryId: dupattasCategoryT2.id,
      title: 'Handcrafted Tanchoi Silk Dupatta',
      slug: 'handcrafted-tanchoi-silk-dupatta',
      description: 'Soft woven Tanchoi silk dupatta with intricate floral motifs.',
      hsnCode: '5007',
      gstRate: 5.0,
      baseCost: 800.0,
      mrp: 1999.0,
      sellingPrice: 1299.0,
      isPublished: true,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'],
    },
  });

  const variant2T2 = await prisma.productVariant.upsert({
    where: { tenantId_sku: { tenantId: tenant2.id, sku: 'VAR-DUP-TANCH' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      productId: product2T2.id,
      sku: 'VAR-DUP-TANCH',
      barcode: '890987650002',
      variantName: 'Magenta / Standard',
      weightGrams: 350,
      currentStock: 40,
      lowStockAlert: 5,
    },
  });

  // Tenant 2 Customer & Sample Order
  const customerT2 = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant2.id, phone: '9822334455' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      name: 'Anjali Verma',
      phone: '9822334455',
      email: 'anjali.verma@example.com',
      creditLimit: 20000.0,
      currentBalance: 0,
      notes: 'VIP customer from New Delhi',
    },
  });

  const orderNumberT2 = 'BS-2026-0101';
  const existingOrderT2 = await prisma.order.findUnique({
    where: { tenantId_orderNumber: { tenantId: tenant2.id, orderNumber: orderNumberT2 } },
  });

  if (!existingOrderT2) {
    const createdOrder = await prisma.order.create({
      data: {
        tenantId: tenant2.id,
        orderNumber: orderNumberT2,
        customerId: customerT2.id,
        channel: 'STOREFRONT',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        subtotal: 6189.52,
        discountTotal: 0,
        taxTotal: 309.48,
        shippingTotal: 0,
        grandTotal: 6499.0,
        shippingAddress: { name: 'Anjali Verma', phone: '9822334455', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
        billingAddress: { name: 'Anjali Verma', phone: '9822334455', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
        items: {
          create: [
            {
              tenantId: tenant2.id,
              variantId: variant1T2.id,
              productTitle: product1T2.title,
              sku: variant1T2.sku,
              quantity: 1,
              unitPrice: 6499.0,
              hsnCode: '5007',
              gstRate: 5.0,
              cgstAmount: 154.74,
              sgstAmount: 154.74,
              igstAmount: 0,
              lineTotal: 6499.0,
            },
          ],
        },
        payments: {
          create: [
            {
              tenantId: tenant2.id,
              amount: 6499.0,
              gateway: 'RAZORPAY',
              status: 'SUCCESS',
              gatewayPaymentId: 'pay_RZP202609051001',
            },
          ],
        },
        invoices: {
          create: [
            {
              tenantId: tenant2.id,
              invoiceNumber: 'INV-2026-0101',
              invoiceType: 'TAX_INVOICE',
              supplierGstin: tenant2.gstin!,
              placeOfSupply: '09',
              totalCgst: 154.74,
              totalSgst: 154.74,
              totalIgst: 0,
              grandTotal: 6499.0,
            },
          ],
        },
      },
    });

    await prisma.inventoryLedger.create({
      data: {
        tenantId: tenant2.id,
        variantId: variant1T2.id,
        changeQuantity: -1,
        balanceAfter: 24,
        eventType: 'SALE',
        referenceId: createdOrder.id,
        notes: `Sold via Storefront Order #${orderNumberT2}`,
        createdById: ownerUserT2?.id,
      },
    });

    await prisma.productVariant.update({
      where: { id: variant1T2.id },
      data: { currentStock: 24 },
    });
  }

  await prisma.storefrontTheme.upsert({
    where: { tenantId: tenant2.id },
    update: {},
    create: {
      tenantId: tenant2.id,
      themeName: 'Varanasi Royal',
      primaryColor: '#1e1b4b',
      accentColor: '#eab308',
      heroTitle: 'Exquisite Varanasi Silk & Handloom Collections',
      heroSubtitle: 'Handwoven legacy crafted for modern celebrations.',
      publishedAt: new Date(),
    },
  });

  console.log('\n🎉 Multi-tenant database seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Common Password for all test users: Password@123 (Bcrypt Hash)\n');
  console.log('Tenant 1: rajesh-fabrics (Rajesh Fabrics)');
  console.log('  - Owner:   owner@rajeshfabrics.com');
  console.log('  - Admin:   admin@rajeshfabrics.com');
  console.log('  - Manager: manager@rajeshfabrics.com');
  console.log('  - Staff:   staff@rajeshfabrics.com');
  console.log('\nTenant 2: varanasi-sarees (Varanasi Sarees)');
  console.log('  - Owner:   owner@varanasisarees.com');
  console.log('  - Admin:   admin@varanasisarees.com');
  console.log('  - Manager: manager@varanasisarees.com');
  console.log('  - Staff:   staff@varanasisarees.com');
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
