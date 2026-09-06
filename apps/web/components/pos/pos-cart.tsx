'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Wallet,
  CreditCard,
  QrCode,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface CartItem {
  variantId: string;
  productTitle: string;
  variantName: string;
  sku: string;
  price: number;
  gstRate: number;
  quantity: number;
}

interface PosCartProps {
  cartItems: CartItem[];
  customers: any[];
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (orderData: any) => void;
}

export function PosCart({
  cartItems,
  customers,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
}: PosCartProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI_DIRECT' | 'KHATA_CREDIT'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Totals calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const estimatedTax = cartItems.reduce((acc, item) => acc + (item.price * item.quantity * item.gstRate) / 100, 0);
  const grandTotal = subtotal + estimatedTax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (paymentMethod === 'KHATA_CREDIT' && !selectedCustomerId) {
      setError('Please select a customer for Khata credit checkout');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId || undefined,
          channel: 'POS_COUNTER',
          items: cartItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          paymentMethod,
          paymentAmount: grandTotal,
          placeOfSupply: '09',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      onCheckoutSuccess(data.data);
      onClearCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-full min-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShoppingCart className="h-5 w-5 text-amber-400" />
          <span>Current Counter Order</span>
        </div>
        <span className="text-2xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full font-mono">
          {cartItems.length} SKUs
        </span>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border-b border-red-200 font-medium">
          {error}
        </div>
      )}

      {/* Customer Selector */}
      <div className="p-3 border-b border-slate-100 bg-slate-50">
        <label className="text-2xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1 mb-1">
          <User className="h-3 w-3 text-amber-600" />
          Customer (Optional for Cash / Mandatory for Khata)
        </label>
        <select
          className="w-full h-9 px-2 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">Walk-in Consumer (B2C Cash / UPI)</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone}) - Khata: ₹{Number(c.currentBalance).toLocaleString('en-IN')}
            </option>
          ))}
        </select>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
            <ShoppingCart className="h-8 w-8 stroke-1" />
            <p className="text-xs font-medium">Cart is empty</p>
            <p className="text-2xs text-slate-400">Click any product SKU from the left catalog grid to add</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.variantId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-bold text-slate-900 truncate">{item.productTitle}</div>
                <div className="text-2xs text-slate-500 font-mono">{item.variantName} ({item.sku})</div>
                <div className="font-bold font-tabular text-slate-800 mt-0.5">
                  ₹{item.price.toLocaleString('en-IN')} <span className="text-2xs text-slate-400">({item.gstRate}% GST)</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
                  className="h-6 w-6 rounded border border-slate-300 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="font-bold font-tabular w-5 text-center text-slate-900">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                  className="h-6 w-6 rounded border border-slate-300 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.variantId)}
                  className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Mode & Summary Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
        {/* Payment Method Selector */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setPaymentMethod('CASH')}
            className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
              paymentMethod === 'CASH'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>💵 CASH</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('UPI_DIRECT')}
            className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
              paymentMethod === 'UPI_DIRECT'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>📱 UPI QR</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('KHATA_CREDIT')}
            className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
              paymentMethod === 'KHATA_CREDIT'
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>📒 KHATA</span>
          </button>
        </div>

        {/* Amount Breakdown */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span className="font-tabular">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Estimated GST:</span>
            <span className="font-tabular">₹{estimatedTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total Payable:</span>
            <span className="font-tabular text-amber-600 text-base">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout CTA */}
        <Button
          variant="accent"
          size="lg"
          className="w-full h-12 text-base font-extrabold tracking-wide uppercase"
          disabled={cartItems.length === 0}
          isLoading={isSubmitting}
          onClick={handleCheckout}
          leftIcon={<CheckCircle2 className="h-5 w-5 stroke-[2.5]" />}
        >
          Complete Sale (₹{grandTotal.toFixed(0)})
        </Button>
      </div>
    </div>
  );
}
