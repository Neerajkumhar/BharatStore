import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Creates a scoped database client instance that enforces tenant isolation.
 * Automatically injects the tenant_id into queries and prevents cross-tenant access.
 */
export function getTenantDb(tenantId: string) {
  if (!tenantId) {
    throw new Error('[Security Exception] Attempted to query database without valid tenant context');
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          // Verify model has tenantId field before enforcing
          const tenantModels = [
            'Product', 'ProductVariant', 'Category', 'InventoryLedger',
            'Customer', 'KhataLedger', 'Order', 'OrderItem', 'Payment',
            'Invoice', 'StorefrontTheme', 'Coupon', 'AuditLog', 'SecurityEvent'
          ];

          if (tenantModels.includes(model)) {
            if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(operation)) {
              args.where = { ...args.where, tenantId };
            } else if (['create', 'createMany'].includes(operation)) {
              if (operation === 'create') {
                args.data = { ...args.data, tenantId };
              } else if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => ({ ...item, tenantId }));
              }
            } else if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              args.where = { ...args.where, tenantId };
            }
          }

          return query(args);
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof getTenantDb>;
