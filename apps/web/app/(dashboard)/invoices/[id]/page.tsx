'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaxInvoicePage() {
  const params = useParams();
  const id = params.id as string;

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch invoice and associated order
    fetch(`/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const foundOrder = data.data.find((o: any) => o.invoices?.some((inv: any) => inv.id === id));
          if (foundOrder) {
            const inv = foundOrder.invoices.find((i: any) => i.id === id);
            setInvoiceData({ order: foundOrder, invoice: inv });
          }
        }
      })
      .catch((err) => console.error('Failed to load invoice', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Generating official GST tax invoice...</span>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <p>Invoice document not found.</p>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const { order, invoice } = invoiceData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Print Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs print:hidden">
        <Link href={`/orders/${order.id}`}>
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Order
          </Button>
        </Link>

        <Button variant="accent" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
          Print Official GST Invoice
        </Button>
      </div>

      {/* Printable A4 GST Tax Invoice Document */}
      <div className="bg-white p-8 sm:p-12 border border-slate-300 rounded-xl shadow-sm text-slate-900 font-sans space-y-6">
        {/* Invoice Title Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight uppercase">Rajesh Saree Emporium</h1>
            <p className="text-xs text-slate-600 mt-1">Main Market, Chowk, Varanasi, UP - 221001</p>
            <p className="text-xs font-mono font-bold mt-1 text-slate-900">GSTIN: 09AAECR1234F1Z5</p>
            <p className="text-xs text-slate-600">State: Uttar Pradesh (State Code: 09)</p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold uppercase rounded">
              {invoice.invoiceType || 'TAX INVOICE'}
            </div>
            <p className="text-sm font-mono font-bold text-slate-900 pt-2">
              Invoice #: {invoice.invoiceNumber}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {/* Billed To / Recipient Info */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-slate-400 mb-1">Details of Recipient (Billed To):</p>
            <p className="font-bold text-slate-900 text-sm">{order.customer?.name || 'B2C Cash Buyer'}</p>
            {order.customer?.phone && <p className="text-slate-600 font-mono mt-0.5">Phone: {order.customer.phone}</p>}
            {order.customer?.gstin && (
              <p className="font-mono font-bold text-blue-900 mt-1">GSTIN: {order.customer.gstin}</p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xs uppercase tracking-wider font-bold text-slate-400 mb-1">Place of Supply:</p>
            <p className="font-mono font-bold text-slate-900">State Code: {invoice.placeOfSupply || '09'}</p>
            <p className="text-slate-600 mt-1 font-mono">Order Ref: {order.orderNumber}</p>
          </div>
        </div>

        {/* HSN Itemized Tax Table */}
        <table className="w-full text-left text-xs border border-slate-300">
          <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700 text-2xs">
            <tr>
              <th className="p-2.5 border-r border-slate-300">#</th>
              <th className="p-2.5 border-r border-slate-300">Product Description</th>
              <th className="p-2.5 border-r border-slate-300">HSN/SAC</th>
              <th className="p-2.5 border-r border-slate-300 text-center">Qty</th>
              <th className="p-2.5 border-r border-slate-300 text-right">Rate (₹)</th>
              <th className="p-2.5 border-r border-slate-300 text-right">Taxable Value</th>
              <th className="p-2.5 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items?.map((item: any, idx: number) => {
              const taxable = item.unitPrice * item.quantity;
              return (
                <tr key={item.id}>
                  <td className="p-2.5 border-r border-slate-200 font-mono text-center">{idx + 1}</td>
                  <td className="p-2.5 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{item.productTitle}</div>
                    <div className="text-2xs text-slate-500 font-mono">SKU: {item.sku}</div>
                  </td>
                  <td className="p-2.5 border-r border-slate-200 font-mono text-center">{item.hsnCode}</td>
                  <td className="p-2.5 border-r border-slate-200 text-center font-bold">{item.quantity}</td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-tabular">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-tabular font-semibold">₹{taxable.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-tabular font-bold">₹{Number(item.lineTotal).toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* GST Tax Summary Table */}
        <div className="flex justify-end pt-2">
          <div className="w-80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value Total:</span>
              <span className="font-tabular">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            {Number(invoice.totalIgst) > 0 ? (
              <div className="flex justify-between text-slate-600">
                <span>Integrated Tax (IGST):</span>
                <span className="font-tabular">₹{Number(invoice.totalIgst).toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Central Tax (CGST):</span>
                  <span className="font-tabular">₹{Number(invoice.totalCgst).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State Tax (SGST):</span>
                  <span className="font-tabular">₹{Number(invoice.totalSgst).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t-2 border-slate-900">
              <span>Invoice Total:</span>
              <span className="font-tabular">₹{Number(invoice.grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Signatory Footer */}
        <div className="flex justify-between items-end pt-12 border-t border-slate-200 text-xs">
          <div className="space-y-1">
            <p className="font-bold">Terms & Conditions:</p>
            <p className="text-2xs text-slate-500">1. Goods once sold are not returnable without original bill.</p>
            <p className="text-2xs text-slate-500">2. Subject to Varanasi Jurisdiction.</p>
          </div>

          <div className="text-right space-y-8">
            <p className="font-bold">For Rajesh Saree Emporium</p>
            <p className="text-2xs text-slate-400 font-mono">(Authorized Signatory)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
