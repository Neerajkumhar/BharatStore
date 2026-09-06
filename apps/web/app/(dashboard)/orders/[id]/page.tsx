'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  PackageCheck,
  Truck,
  FileText,
  Loader2,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } catch (err) {
      console.error('Failed to load order details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const updateOrderStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchOrderDetails();
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <p>Order not found.</p>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const invoice = order.invoices && order.invoices[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <button className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="font-mono">{order.orderNumber}</span>
              <Badge variant="default">{order.status}</Badge>
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Channel: {order.channel} | Placed on: {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {invoice && (
          <Link href={`/invoices/${invoice.id}`}>
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4 text-blue-600" />}>
              View Tax Invoice ({invoice.invoiceNumber})
            </Button>
          </Link>
        )}
      </div>

      {/* Fulfillment Status Workflow Stepper Bar */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-amber-400 font-bold uppercase">Fulfillment Status:</span>
            <span className="font-bold text-sm text-white">{order.status}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.status === 'CONFIRMED' && (
              <Button
                variant="accent"
                size="sm"
                isLoading={isUpdating}
                onClick={() => updateOrderStatus('PACKED')}
                leftIcon={<PackageCheck className="h-4 w-4" />}
              >
                Mark Packed
              </Button>
            )}
            {order.status === 'PACKED' && (
              <Button
                variant="accent"
                size="sm"
                isLoading={isUpdating}
                onClick={() => updateOrderStatus('DISPATCHED')}
                leftIcon={<Truck className="h-4 w-4" />}
              >
                Dispatch Order
              </Button>
            )}
            {order.status === 'DISPATCHED' && (
              <Button
                variant="accent"
                size="sm"
                isLoading={isUpdating}
                onClick={() => updateOrderStatus('DELIVERED')}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Mark Delivered
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itemized Order Table (Span 2) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ordered Items ({order.items?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Product Title & SKU</th>
                    <th className="px-6 py-3">HSN Code</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900">{item.productTitle}</div>
                        <div className="font-mono text-2xs text-slate-500">SKU: {item.sku}</div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs">
                        {item.hsnCode} ({Number(item.gstRate)}%)
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold font-tabular">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3.5 text-right font-tabular">
                        ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold font-tabular text-slate-900">
                        ₹{Number(item.lineTotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. Tax):</span>
                <span className="font-tabular">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST Tax:</span>
                <span className="font-tabular">₹{Number(order.taxTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                <span>GRAND TOTAL:</span>
                <span className="font-tabular text-amber-600 text-base">₹{Number(order.grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Payment Meta */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                {order.customer?.name || 'Walk-in Customer'}
              </div>
              {order.customer?.phone && (
                <div className="text-slate-600 font-mono">Phone: {order.customer.phone}</div>
              )}
              {order.customer?.gstin && (
                <div className="font-mono text-2xs bg-blue-50 text-blue-800 px-2 py-1 rounded inline-block">
                  GSTIN: {order.customer.gstin}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.payments && order.payments[0] && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="font-mono text-2xs text-slate-500">Gateway: {order.payments[0].gateway}</div>
                  <div className="font-bold font-tabular text-slate-900">₹{Number(order.payments[0].amount).toLocaleString('en-IN')}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
