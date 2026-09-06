import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { adjustInventorySchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.INVENTORY_ADJUST);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const userId = auth.userId || null;

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

      if (changeQuantity < 0) {
        const updateRes = await tx.productVariant.updateMany({
          where: {
            id: variantId,
            tenantId,
            currentStock: { gte: Math.abs(changeQuantity) },
          },
          data: {
            currentStock: { decrement: Math.abs(changeQuantity) },
          },
        });
        if (updateRes.count === 0) {
          throw new Error(`Insufficient stock available. Current stock: ${variant.currentStock}, requested change: ${changeQuantity}`);
        }
      } else {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { currentStock: { increment: changeQuantity } },
        });
      }

      const updatedVariant = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });

      const ledgerEntry = await tx.inventoryLedger.create({
        data: {
          tenantId,
          variantId,
          changeQuantity,
          balanceAfter: updatedVariant.currentStock,
          eventType,
          referenceId: referenceId || null,
          notes: notes || null,
          createdById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          actorEmail: auth.userEmail || 'unknown',
          action: 'inventory:adjust',
          resourceType: 'product_variant',
          resourceId: variantId,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          beforeState: { currentStock: variant.currentStock },
          afterState: { currentStock: updatedVariant.currentStock, changeQuantity, eventType },
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
