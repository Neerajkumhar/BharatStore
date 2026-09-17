import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookup, findStorefrontTenant } from '@/lib/storefront-resolver';
import { CheckCircle2, ShoppingBag, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;

  const lookup = await getRequestStoreLookup(slug);
  const tenant = await findStorefrontTenant(lookup, {
    select: { id: true, tradeName: true, phone: true, email: true },
  });

  if (!tenant) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
    include: {
      customer: true,
      items: true,
      invoices: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Hero Badge */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-1">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500">
            Order <span className="font-bold text-slate-900 font-mono">{order.orderNumber}</span> has been confirmed.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/store/${slug}/orders/${order.id}`}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-xs"
          >
            <span>Track Order Status</span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </Link>

          {order.invoices[0] && (
            <Link
              href={`/invoices/${order.invoices[0].id}`}
              target="_blank"
              className="px-5 py-2.5 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-amber-600" />
              <span>View GST Tax Invoice</span>
            </Link>
          )}
        </div>
      </div>

      {/* Itemized Order Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order Items</h3>
            <p className="text-2xs text-slate-500">Fulfilling via {tenant.tradeName}</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
            {order.paymentStatus}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">{item.productTitle}</h4>
                <p className="text-2xs text-slate-500 font-mono">
                  SKU: {item.sku} • Quantity: {item.quantity}
                </p>
              </div>
              <span className="font-bold text-slate-900">
                ₹{Number(item.lineTotal).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>GST Tax</span>
            <span className="font-semibold text-slate-900">₹{Number(order.taxTotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total</span>
            <span className="text-amber-600 text-base">₹{Number(order.grandTotal).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Customer Address Details */}
        {order.customer && (
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-2xs">Delivery Customer</h4>
            <p className="font-semibold text-slate-800">{order.customer.name}</p>
            <p className="font-mono text-2xs">{order.customer.phone}</p>
            {order.notes && <p className="text-2xs text-slate-500 italic mt-1">{order.notes}</p>}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="text-center">
        <Link
          href={`/store/${slug}/products`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
        >
          <ShoppingBag className="h-4 w-4 text-amber-500" />
          <span>Continue Shopping in {tenant.tradeName} &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
