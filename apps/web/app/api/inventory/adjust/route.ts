import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { adjustInventorySchema } from '@bharatstore/shared/schemas';

async function getActiveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) return headerTenantId;

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant.id;
}

export async function POST(request: Request) {
  try {
    const tenantId = await getActiveTenantId(request);
    const userId = request.headers.get('x-user-id') || null;

    const body = await request.json();
    const parsed = adjustInventorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { variantId, changeQuantity, eventType, referenceId, notes } = parsed.data;

    // Atomic transaction for double-entry stock update and ledger logging
    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { id: variantId, tenantId },
      });

      if (!variant) {
        throw new Error('Product variant not found or access denied');
      }

      const newStock = variant.currentStock + changeQuantity;
      if (newStock < 0) {
        throw new Error(`Insufficient stock available. Current stock: ${variant.currentStock}, requested change: ${changeQuantity}`);
      }

      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { currentStock: newStock },
      });

      const ledgerEntry = await tx.inventoryLedger.create({
        data: {
          tenantId,
          variantId,
          changeQuantity,
          balanceAfter: newStock,
          eventType,
          referenceId: referenceId || null,
          notes: notes || null,
          createdById: userId,
        },
      });

      return { variant: updatedVariant, ledgerEntry };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Inventory adjustment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to adjust inventory' }, { status: 400 });
  }
}
