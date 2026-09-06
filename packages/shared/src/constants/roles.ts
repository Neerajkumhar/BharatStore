export const SYSTEM_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const;

export type SystemRole = keyof typeof SYSTEM_ROLES;

export const PERMISSIONS = {
  // Business & Settings
  BUSINESS_DELETE: 'business:delete',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  BILLING_MANAGE: 'billing:manage',

  // Staff & RBAC
  STAFF_READ: 'staff:read',
  STAFF_MANAGE: 'staff:manage',
  ROLES_MANAGE: 'roles:manage',

  // Security & Audit
  SECURITY_READ: 'security:read',
  SECURITY_MANAGE: 'security:manage',
  AUDIT_READ: 'audit:read',

  // Products & Categories
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  PRODUCTS_DELETE: 'products:delete',
  CATEGORIES_MANAGE: 'categories:manage',

  // Inventory
  INVENTORY_READ: 'inventory:read',
  INVENTORY_ADJUST: 'inventory:adjust',

  // Orders & POS
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_MANAGE: 'orders:manage',
  ORDERS_CANCEL: 'orders:cancel',
  ORDERS_REFUND: 'orders:refund',

  // Customers & Khata
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  KHATA_READ: 'customers:khata:read',
  KHATA_WRITE: 'customers:khata:write',

  // Invoices & Finances
  INVOICES_READ: 'invoices:read',
  INVOICES_PRINT: 'invoices:print',
  INVOICES_CREATE: 'invoices:create',
  FINANCES_EXPORT: 'finances:export',
  FINANCES_VIEW_MARGINS: 'finances:view_margins',

  // Storefront & Marketing
  STOREFRONT_MANAGE: 'storefront:manage',
  MARKETING_MANAGE: 'marketing:manage',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<SystemRole, PermissionCode[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.BUSINESS_DELETE),
  MANAGER: [
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.KHATA_READ,
    PERMISSIONS.KHATA_WRITE,
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_PRINT,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.STOREFRONT_MANAGE,
    PERMISSIONS.MARKETING_MANAGE,
  ],
  STAFF: [
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_PRINT,
  ],
};
