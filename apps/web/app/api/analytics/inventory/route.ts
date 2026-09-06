import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { getAnalyticsDateRange } from '@bharatstore/shared/utils';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.SETTINGS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { currentStart, currentEnd } = getAnalyticsDateRange(range, startDate, endDate);

    const [variants, ledgerLogs] = await Promise.all([
      tenantDb.productVariant.findMany({
        include: { product: true },
      }),
      tenantDb.inventoryLedger.findMany({
        where: {
          createdAt: { gte: currentStart, lte: currentEnd },
        },
      }),
    ]);

    const totalUnits = variants.reduce((acc, v) => acc + v.currentStock, 0);
    const totalValuationCost = variants.reduce((acc, v) => acc + v.currentStock * Number(v.product.baseCost), 0);
    const totalValuationMrp = variants.reduce((acc, v) => acc + v.currentStock * Number(v.product.mrp), 0);

    const lowStockVariants = variants.filter((v) => v.currentStock > 0 && v.currentStock <= v.lowStockAlert);
    const outOfStockVariants = variants.filter((v) => v.currentStock === 0);

    const movementByEvent = {
      INWARD: 0,
      SALE: 0,
      RETURN: 0,
      DAMAGE: 0,
      ADJUSTMENT: 0,
    };

    ledgerLogs.forEach((log) => {
      if (movementByEvent[log.eventType] !== undefined) {
        movementByEvent[log.eventType] += Math.abs(log.changeQuantity);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalUnits,
          totalValuationCost: Number(totalValuationCost.toFixed(2)),
          totalValuationMrp: Number(totalValuationMrp.toFixed(2)),
          lowStockCount: lowStockVariants.length,
          outOfStockCount: outOfStockVariants.length,
        },
        movementByEvent,
        lowStockList: lowStockVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          productTitle: v.product.title,
          variantName: v.variantName,
          currentStock: v.currentStock,
          lowStockAlert: v.lowStockAlert,
        })),
        outOfStockList: outOfStockVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          productTitle: v.product.title,
          variantName: v.variantName,
          currentStock: 0,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch inventory analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory analytics' }, { status: 500 });
  }
}
