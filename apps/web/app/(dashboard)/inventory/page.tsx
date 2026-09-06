'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  History,
  AlertTriangle,
  Loader2,
  TrendingDown,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockAdjustModal } from '@/components/inventory/stock-adjust-modal';

export default function InventoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const fetchLedgerLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory/ledger');
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (err) {
      console.error('Failed to load inventory logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchLedgerLogs();
    fetchProducts();
  }, []);

  // Compute metrics
  const totalStockUnits = products.reduce((acc, p) => acc + (p.totalStock || 0), 0);
  const lowStockProducts = products.filter((p) => p.isLowStock);
  const outOfStockProducts = products.filter((p) => p.isOutOfStock);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="h-6 w-6 text-amber-600" />
            <span>Double-Entry Inventory Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time stock movement ledger tracking Inward, POS Sales, Returns & Damage audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="accent"
            onClick={() => setIsAdjustModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}
          >
            Inward Stock / Adjust
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Units
            </CardTitle>
            <Boxes className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900">
              {totalStockUnits.toLocaleString()} <span className="text-xs font-normal text-slate-400">Units</span>
            </div>
            <p className="text-2xs text-slate-400 mt-1">Across all product variants</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-amber-950">
              {lowStockProducts.length} <span className="text-xs font-normal text-amber-700">SKUs</span>
            </div>
            <p className="text-2xs text-amber-700 mt-1">Requires replenishment soon</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-red-800 uppercase tracking-wider">
              Out of Stock
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-red-950">
              {outOfStockProducts.length} <span className="text-xs font-normal text-red-700">SKUs</span>
            </div>
            <p className="text-2xs text-red-700 mt-1">Currently zero available stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ledger Events Logged
            </CardTitle>
            <History className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900">
              {logs.length} <span className="text-xs font-normal text-slate-400">Entries</span>
            </div>
            <p className="text-2xs text-slate-400 mt-1">Immutable audit trail</p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger History Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Movement Audit Log</CardTitle>
            <CardDescription>Double-entry record of every stock balance change</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="text-sm font-medium">Fetching inventory ledger history...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm space-y-2">
              <p>No inventory ledger entries logged yet.</p>
              <Button variant="accent" size="sm" onClick={() => setIsAdjustModalOpen(true)}>
                Log First Inward Shipment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Product & SKU</th>
                    <th className="px-6 py-3.5">Event Type</th>
                    <th className="px-6 py-3.5 text-center">Change Qty</th>
                    <th className="px-6 py-3.5 text-center">Balance After</th>
                    <th className="px-6 py-3.5">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono text-2xs text-slate-500">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {log.variant?.product?.title || 'Unknown Product'}
                        </div>
                        <div className="font-mono text-2xs text-slate-500">
                          {log.variant?.variantName} ({log.variant?.sku})
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {log.eventType === 'INWARD' && <Badge variant="success">+ INWARD</Badge>}
                        {log.eventType === 'SALE' && <Badge variant="info">- SALE</Badge>}
                        {log.eventType === 'RETURN' && <Badge variant="warning">+ RETURN</Badge>}
                        {log.eventType === 'DAMAGE' && <Badge variant="destructive">- DAMAGE</Badge>}
                        {log.eventType === 'ADJUSTMENT' && <Badge variant="outline">± AUDIT</Badge>}
                      </td>

                      <td className="px-6 py-4 text-center font-bold font-tabular">
                        <span className={log.changeQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-extrabold font-tabular text-slate-900 bg-slate-50/50">
                        {log.balanceAfter}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {log.referenceId && (
                          <div className="font-mono font-semibold text-slate-800">{log.referenceId}</div>
                        )}
                        <div className="text-2xs text-slate-500">{log.notes || '—'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSuccess={() => {
          fetchLedgerLogs();
          fetchProducts();
        }}
      />
    </div>
  );
}
