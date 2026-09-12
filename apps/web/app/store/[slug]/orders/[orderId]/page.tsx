import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@bharatstore/database';
import { CheckCircle2, Clock, PackageCheck, Truck, Home, FileText, ArrowLeft } from 'lucide-react';

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
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

  const statusSteps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'PACKED', label: 'Packed & Ready', icon: PackageCheck },
    { key: 'DISPATCHED', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.status);
  const activeStep = currentStatusIndex !== -1 ? currentStatusIndex : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/store/${slug}`}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Order Status Tracking</h1>
            <p className="text-xs text-slate-500 font-mono">
              Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {order.invoices[0] && (
          <Link
            href={`/invoices/${order.invoices[0].id}`}
            target="_blank"
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Tax Invoice</span>
          </Link>
        )}
      </div>

      {/* Lifecycle Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fulfillment Lifecycle</h3>
          <span className="px-2.5 py-1 text-2xs font-extrabold rounded-full bg-amber-100 text-amber-900 uppercase">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative pt-2">
          {statusSteps.map((step, idx) => {
            const isDone = idx <= activeStep;
            const isCurrent = idx === activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`p-4 border rounded-2xl flex flex-col items-center text-center space-y-2 transition ${isCurrent ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs' : isDone ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <div
                  className={`p-2.5 rounded-xl ${isCurrent ? 'bg-amber-500 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold leading-tight">{step.label}</span>
                {isCurrent && <span className="text-2xs font-bold text-amber-700">In Progress</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Itemization & Payment Summary */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Order Items</h3>
          <span className="text-xs font-bold text-slate-700">Payment: {order.paymentStatus}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">{item.productTitle}</h4>
                <p className="text-2xs text-slate-500 font-mono">
                  SKU: {item.sku} • Qty: {item.quantity}
                </p>
              </div>
              <span className="font-bold text-slate-900">
                ₹{Number(item.lineTotal).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
}
