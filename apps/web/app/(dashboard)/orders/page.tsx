'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedChannel) params.set('channel', selectedChannel);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedChannel]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="h-6 w-6 text-amber-600" />
            <span>Omnichannel Orders</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Order processing & fulfillment from Counter POS, Online Storefront & WhatsApp sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/pos">
            <Button variant="accent" leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}>
              New POS Counter Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { label: 'All Orders', value: '' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Packed', value: 'PACKED' },
              { label: 'Dispatched', value: 'DISPATCHED' },
              { label: 'Delivered', value: 'DELIVERED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  selectedStatus === tab.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Channel:</span>
            <select
              className="h-8 px-2 text-xs border border-slate-300 rounded bg-white text-slate-800 font-semibold focus:outline-none"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="">All Channels</option>
              <option value="POS_COUNTER">POS Counter</option>
              <option value="STOREFRONT">Online Storefront</option>
              <option value="WHATSAPP">WhatsApp Sales</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="text-sm font-medium">Loading sales orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm space-y-2">
              <ShoppingCart className="h-8 w-8 mx-auto text-slate-300" />
              <p>No orders found for active filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Order Number</th>
                    <th className="px-6 py-3.5">Channel</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Grand Total</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                        <div className="text-2xs text-slate-400 font-sans font-normal">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-2xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded uppercase border border-slate-200">
                          {order.channel}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {order.customer?.name || 'Walk-in Customer'}
                        </div>
                        {order.customer?.phone && (
                          <div className="text-2xs text-slate-400 font-mono">{order.customer.phone}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {order.items?.length || 0} Line Items
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold font-tabular text-slate-900">
                          ₹{Number(order.grandTotal).toLocaleString('en-IN')}
                        </div>
                        <Badge
                          variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="default" size="sm">
                          {order.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.invoices && order.invoices[0] && (
                            <Link href={`/invoices/${order.invoices[0].id}`}>
                              <button
                                className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                title="View Tax Invoice"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          <Link href={`/orders/${order.id}`}>
                            <button
                              className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="View Order Details"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
