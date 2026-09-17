import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { getAnalyticsDateRange } from '@bharatstore/shared/utils';
import { authorizeRequest } from '@/lib/authorization';
import { requireFeature } from '@/lib/plan-enforcement';
import { PERMISSIONS, FEATURE_FLAGS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.SETTINGS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.ADVANCED_ANALYTICS);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { currentStart, currentEnd, periodLabel } = getAnalyticsDateRange(range, startDate, endDate);

    // Fetch order items in date range
    const orderItems = await tenantDb.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: currentStart, lte: currentEnd },
          status: { not: 'CANCELLED' },
        },
      },
      include: {
        variant: {
          include: { product: { include: { category: true } } },
        },
      },
    });

    // Product Performance Aggregation Map
    const productMap = new Map<string, { id: string; title: string; sku: string; categoryName: string; unitsSold: number; revenue: number; ordersCount: number }>();
    // Category Performance Aggregation Map
    const categoryMap = new Map<string, { categoryId: string; name: string; unitsSold: number; revenue: number; ordersCount: number }>();

    orderItems.forEach((item) => {
      const productId = item.variant?.productId || item.productTitle;
      const title = item.productTitle;
      const sku = item.sku;
      const categoryName = item.variant?.product?.category?.name || 'Uncategorized';
      const categoryId = item.variant?.product?.categoryId || 'uncategorized';
      const revenue = Number(item.lineTotal);

      // Product grouping
      const existingProd = productMap.get(productId) || { id: productId, title, sku, categoryName, unitsSold: 0, revenue: 0, ordersCount: 0 };
      productMap.set(productId, {
        ...existingProd,
        unitsSold: existingProd.unitsSold + item.quantity,
        revenue: existingProd.revenue + revenue,
        ordersCount: existingProd.ordersCount + 1,
      });

      // Category grouping
      const existingCat = categoryMap.get(categoryName) || { categoryId, name: categoryName, unitsSold: 0, revenue: 0, ordersCount: 0 };
      categoryMap.set(categoryName, {
        ...existingCat,
        unitsSold: existingCat.unitsSold + item.quantity,
        revenue: existingCat.revenue + revenue,
        ordersCount: existingCat.ordersCount + 1,
      });
    });

    const products = Array.from(productMap.values()).map((p) => ({
      ...p,
      revenue: Number(p.revenue.toFixed(2)),
      avgSellingPrice: Number((p.revenue / p.unitsSold).toFixed(2)),
    }));

    const topByRevenue = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const topByUnits = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);
    const lowPerformers = [...products].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 5);

    const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
      ...c,
      categoryId: c.categoryId || c.name,
      revenue: Number(c.revenue.toFixed(2)),
    })).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      data: {
        topByRevenue,
        topByUnits,
        lowPerformers,
        categoryBreakdown,
        periodLabel,
      },
    });
  } catch (error: any) {
    console.error('Fetch product analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product analytics' }, { status: 500 });
  }
}
