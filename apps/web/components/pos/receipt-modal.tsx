'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export function ReceiptModal({ isOpen, onClose, orderData }: ReceiptModalProps) {
  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  const { order, invoice, taxCalc } = orderData;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Sale Completed Successfully</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="accent" size="sm" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
              Print Receipt
            </Button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal/A4 Receipt Layout */}
        <div id="printable-receipt" className="p-6 space-y-4 text-xs font-mono text-slate-900 bg-white">
          {/* Store Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-extrabold font-sans tracking-tight uppercase">Rajesh Saree Emporium</h2>
            <p className="text-2xs text-slate-600 font-sans">Main Market, Chowk, Varanasi, UP - 221001</p>
            <p className="text-2xs font-bold">GSTIN: 09AAECR1234F1Z5</p>
            <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-2xs font-bold uppercase rounded">
              {invoice?.invoiceType || 'TAX INVOICE'}
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="flex justify-between text-2xs py-1 border-b border-slate-200">
            <div>
              <p>Invoice #: <span className="font-bold">{invoice?.invoiceNumber || 'INV-2026-001'}</span></p>
              <p>Order #: <span className="font-bold">{order?.orderNumber}</span></p>
            </div>
            <div className="text-right">
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
              <p>Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left text-2xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase">
                <th className="py-1">Item SKU</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order?.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-1.5 font-semibold">
                    {item.productTitle || item.sku}
                    <div className="text-2xs text-slate-500 font-normal">HSN: {item.hsnCode} ({item.gstRate}%)</div>
                  </td>
                  <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-1.5 text-right font-tabular">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                  <td className="py-1.5 text-right font-bold font-tabular">₹{Number(item.lineTotal || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-2xs">
            <div className="flex justify-between">
              <span>Subtotal (Excl. Tax):</span>
              <span className="font-tabular">₹{Number(order?.subtotal || taxCalc?.subtotal).toLocaleString('en-IN')}</span>
            </div>
            {taxCalc?.isInterstate ? (
              <div className="flex justify-between">
                <span>IGST Total:</span>
                <span className="font-tabular">₹{Number(taxCalc?.igstTotal).toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>CGST Total:</span>
                  <span className="font-tabular">₹{Number(taxCalc?.cgstTotal || (order?.taxTotal / 2)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST Total:</span>
                  <span className="font-tabular">₹{Number(taxCalc?.sgstTotal || (order?.taxTotal / 2)).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-900 text-slate-900">
              <span>GRAND TOTAL:</span>
              <span className="font-tabular">₹{Number(order?.grandTotal || taxCalc?.grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 text-2xs text-slate-500 border-t border-slate-200">
            <p className="font-semibold text-slate-800">Thank you for shopping with us! 🙏</p>
            <p>Visit again: rajesh-sarees.bharatstore.in</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
