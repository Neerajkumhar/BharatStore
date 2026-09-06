'use client';

import React, { useState, useEffect } from 'react';
import { X, Boxes, Loader2, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedVariantId?: string;
}

export function StockAdjustModal({ isOpen, onClose, onSuccess, preselectedVariantId }: StockAdjustModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState(preselectedVariantId || '');
  const [eventType, setEventType] = useState<'INWARD' | 'DAMAGE' | 'RETURN' | 'ADJUSTMENT'>('INWARD');
  const [changeQuantity, setChangeQuantity] = useState<number>(10);
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/products?limit=100')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setProducts(data.data);
            if (!selectedVariantId && data.data[0]?.variants?.length > 0) {
              setSelectedVariantId(data.data[0].variants[0].id);
            }
          }
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || changeQuantity === 0) return;

    setIsLoading(true);
    setError(null);

    // Ensure sign matches event type
    let finalQty = Math.abs(changeQuantity);
    if (eventType === 'DAMAGE') {
      finalQty = -finalQty;
    } else if (eventType === 'ADJUSTMENT' && changeQuantity < 0) {
      finalQty = changeQuantity;
    }

    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariantId,
          changeQuantity: finalQty,
          eventType,
          referenceId: referenceId || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record stock adjustment');
      }

      setNotes('');
      setReferenceId('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <Boxes className="h-5 w-5 text-amber-600" />
            <span>Perform Inventory Adjustment</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Variant Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Select SKU / Variant</label>
            <select
              className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              required
            >
              {products.map((product) =>
                product.variants?.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {product.title} - {v.variantName} (SKU: {v.sku} | Stock: {v.currentStock})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Event Type Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Adjustment Event Type</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEventType('INWARD');
                  setChangeQuantity(Math.abs(changeQuantity));
                }}
                className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  eventType === 'INWARD'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span>+ INWARD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEventType('DAMAGE');
                  setChangeQuantity(Math.abs(changeQuantity));
                }}
                className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  eventType === 'DAMAGE'
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <span>- DAMAGE</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('RETURN')}
                className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  eventType === 'RETURN'
                    ? 'bg-blue-50 border-blue-500 text-blue-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
                <span>+ RETURN</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('ADJUSTMENT')}
                className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  eventType === 'ADJUSTMENT'
                    ? 'bg-purple-50 border-purple-500 text-purple-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-purple-600" />
                <span>± AUDIT</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Quantity Change"
              type="number"
              value={changeQuantity}
              onChange={(e) => setChangeQuantity(Number(e.target.value))}
              required
              helperText={eventType === 'DAMAGE' ? 'Will be deducted from available stock' : 'Stock increment'}
            />
            <Input
              label="PO / Ref Number (Optional)"
              placeholder="PO-2026-09"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800">Reason / Audit Notes</label>
            <textarea
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={2}
              placeholder="e.g. Received shipment from Surat supplier #4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Confirm Stock Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
