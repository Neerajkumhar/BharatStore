'use client';

import React, { useState } from 'react';
import { X, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KhataPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    currentBalance: number;
  } | null;
}

export function KhataPaymentModal({ isOpen, onClose, onSuccess, customer }: KhataPaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('UPI');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/khata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          type: 'CREDIT_PAYMENT_RECEIVED',
          amount,
          paymentMode,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record Khata payment');
      }

      setAmount(0);
      setNotes('');
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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <span>Receive Khata Balance Payment</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
            <div className="font-bold text-amber-900">{customer.name} ({customer.phone})</div>
            <div className="flex justify-between text-amber-800">
              <span>Outstanding Balance:</span>
              <span className="font-bold font-tabular text-sm text-amber-950">
                ₹{Number(customer.currentBalance).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Payment Amount Received (₹)"
            type="number"
            prefixSlot="₹"
            placeholder="Enter amount"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'CASH', 'BANK_TRANSFER'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`p-2 rounded-lg border text-xs font-bold transition ${
                    paymentMode === mode
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800">Notes / Transaction Ref</label>
            <textarea
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={2}
              placeholder="e.g. Received via PhonePe UPI / Cash collected at store counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
