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
