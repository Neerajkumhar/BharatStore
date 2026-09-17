'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { amountToWords, inr, stateName, formatDate } from '@/lib/invoice';
import { cn } from '@/lib/utils';
import { FeatureGate } from '@/components/entitlements/FeatureGate';
import { FEATURE_FLAGS } from '@bharatstore/shared/constants';

const INVOICE_TITLES: Record<string, string> = {
  TAX_INVOICE: 'Tax Invoice',
  BILL_OF_SUPPLY: 'Bill of Supply',
  CREDIT_NOTE: 'Credit Note',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  RAZORPAY: 'Razorpay / Online',
  CASHFREE: 'Cashfree / Online',
  UPI_DIRECT: 'UPI',
  CASH: 'Cash',
  MANUAL: 'Manual / Khata',
};

function getInitials(name?: string | null) {
  if (!name) return 'BS';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function TaxInvoicePageContent() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to load invoice', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Preparing official GST invoice...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <p>Invoice document not found.</p>
        <Link href="/invoices">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const { invoice, order, tenant } = data;
  const items: any[] = order?.items ?? [];
  const isInterstate = Number(invoice.totalIgst) > 0;

  const subtotal = Number(order?.subtotal ?? 0);
  const discount = Number(order?.discountTotal ?? 0);
  const totalCgst = Number(invoice.totalCgst ?? 0);
  const totalSgst = Number(invoice.totalSgst ?? 0);
  const totalIgst = Number(invoice.totalIgst ?? 0);
  const grandTotal = Number(invoice.grandTotal ?? 0);

  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = grandTotal + roundOff;

  const supplierName = tenant?.tradeName || 'Your Business';
  const supplierLegal = tenant?.legalName || '';
  const supplierAddress = tenant
    ? [tenant.addressLine1, tenant.city, tenant.pincode].filter(Boolean).join(', ')
    : '';
  const primaryPayment = order?.payments?.[0];

  const logoUrl = tenant?.logoUrl || tenant?.storefrontTheme?.logoUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[820px] mx-auto space-y-4 pb-12 print:m-0 print:p-0">
      {/* Action Bar (never prints) */}
      <div className="no-print flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <Link href="/invoices">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Invoices
          </Button>
        </Link>

        <Button variant="accent" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
          Print GST Invoice
        </Button>
      </div>

      {/* ─── A4 GST Invoice Document ─── */}
      <div
        id="invoice-print-area"
        className="bg-white border border-slate-300 text-slate-900 print:border-0 print:shadow-none print:rounded-none"
      >
        <div className="text-[9px] sm:text-[11px] print:text-[11px] leading-snug">
          {/* Letterhead */}
          <div className="border-t-4 border-slate-900">
            <div className="px-6 sm:px-10 py-6 flex justify-between gap-6">
              {/* Supplier block */}
              <div className="max-w-[60%]">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={supplierName}
                      className="h-14 w-14 object-contain rounded-sm border border-slate-200"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-sm border border-slate-300 flex items-center justify-center shrink-0">
                      <span className="text-lg font-extrabold tracking-tight text-slate-900">
                        {getInitials(supplierName)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                      {supplierName}
                    </h1>
                    {supplierLegal && (
                      <p className="text-[9px] text-slate-500 font-medium -mt-0.5">{supplierLegal}</p>
                    )}
                    <p className="text-[9px] text-slate-600 mt-0.5">{supplierAddress}</p>
                  </div>
                </div>

                <div className="mt-2.5 text-[10px] sm:text-[11px] text-slate-600 space-y-0.5">
                  <p>
                    State: {stateName(tenant?.stateCode)} ({tenant?.stateCode})
                  </p>
                  <p className="space-x-0.5">
                    {tenant?.phone && <span>Ph: {tenant.phone}</span>}
                    {tenant?.phone && tenant?.email && <span> | </span>}
                    {tenant?.email && <span>{tenant.email}</span>}
                  </p>
                </div>
              </div>

              {/* Document meta */}
              <div className="text-right shrink-0">
                <p className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-slate-900">
                  {INVOICE_TITLES[invoice.invoiceType] || 'Tax Invoice'}
                </p>
                <div className="mt-2 inline-block text-left border border-slate-300 px-3.5 py-2 rounded-sm space-y-0.5 font-mono text-[10px] sm:text-[11px]">
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">Invoice No.</span>
                    <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-900">{formatDate(invoice.invoiceDate)}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">Order Ref</span>
                    <span className="font-bold text-slate-900">{order.orderNumber}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax registration strip */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-0.5 px-6 sm:px-10 py-2 border-y border-slate-300 text-[10px] sm:text-[11px] text-slate-700">
            <span>
              GSTIN: <span className="font-bold text-slate-900">{invoice.supplierGstin}</span>
            </span>
            {tenant?.pan && <span>PAN: <span className="font-bold text-slate-900">{tenant.pan}</span></span>}
            <span>
              Place of Supply: <span className="font-bold text-slate-900">{invoice.placeOfSupply}</span>
            </span>
          </div>

          {/* Recipient block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-6 sm:px-10 py-5">
            <div>
              <p className="text-2xs uppercase tracking-widest font-bold text-slate-500 mb-1.5">
                Billed To
              </p>
              <p className="font-bold text-slate-900">{order.customer?.name || 'Cash Buyer'}</p>
              {order.customer?.phone && (
                <p className="text-slate-600 mt-0.5">Ph: {order.customer.phone}</p>
              )}
              {order.customer?.gstin && (
                <p className="font-mono font-bold text-slate-900 mt-1">
                  GSTIN: {order.customer.gstin}
                </p>
              )}
              {!order.customer?.gstin && (
                <p className="text-slate-500 mt-1 text-[10px]">Unregistered (B2C) Consumer</p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xs uppercase tracking-widest font-bold text-slate-500 mb-1.5">
                Payment & Supply
              </p>
              {primaryPayment && (
                <p className="text-slate-600">
                  Mode: {PAYMENT_METHOD_LABELS[primaryPayment.gateway] || primaryPayment.gateway}
                  <span
                    className={cn(
                      'ml-2 font-bold',
                      primaryPayment.status === 'SUCCESS' ? 'text-slate-900' : 'text-slate-700'
                    )}
                  >
                    {primaryPayment.status === 'SUCCESS' ? 'PAID' : primaryPayment.status}
                  </span>
                </p>
              )}
              <p className="text-slate-600">
                Channel: <span className="capitalize">{String(order.channel || 'POS').toLowerCase()}</span>
                {order.channel && order.channel !== 'POS' && (
                  <span className="ml-2 font-bold text-slate-900">ONLINE</span>
                )}
              </p>
              <p className="text-slate-600">
                Supply Type:{' '}
                <span className="font-bold">{isInterstate ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</span>
              </p>
            </div>
          </div>

          {/* Itemized table */}
          <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-t border-slate-400 min-w-[640px] print:min-w-0">
            <thead>
              <tr className="bg-slate-100 text-slate-900 text-[9px] sm:text-[10px] uppercase tracking-wide border-b-2 border-slate-400">
                <th className="py-2.5 px-3 text-center font-bold w-7">#</th>
                <th className="py-2.5 px-3 text-left font-bold">Description</th>
                <th className="py-2.5 px-3 text-center font-bold">HSN/SAC</th>
                <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                <th className="py-2.5 px-3 text-right font-bold">Rate</th>
                <th className="py-2.5 px-3 text-right font-bold">Taxable Value</th>
                {isInterstate ? (
                  <th className="py-2.5 px-3 text-right font-bold">IGST</th>
                ) : (
                  <>
                    <th className="py-2.5 px-3 text-right font-bold">CGST</th>
                    <th className="py-2.5 px-3 text-right font-bold">SGST</th>
                  </>
                )}
                <th className="py-2.5 px-3 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const taxable = item.unitPrice * item.quantity;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-200"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.productTitle}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">{item.hsnCode}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                      {inr(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                      {inr(taxable)}
                    </td>
                    {isInterstate ? (
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {inr(item.igstAmount)}
                      </td>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {inr(item.cgstAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {inr(item.sgstAmount)}
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      {inr(item.lineTotal)}
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={isInterstate ? 8 : 9} className="py-4 text-center text-slate-500">
                    No line items on this invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {/* Totals & signatory */}
          <div className="px-6 sm:px-10 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-8">
              {/* Amount in words */}
              <div className="sm:col-span-3">
                <p className="text-2xs uppercase tracking-widest font-bold text-slate-500 mb-1.5">
                  Amount in Words
                </p>
                <p className="text-slate-800 font-semibold leading-relaxed">
                  {amountToWords(grandTotal)}
                </p>

                {order.notes && (
                  <p className="mt-4">
                    <span className="text-2xs uppercase tracking-widest font-bold text-slate-500">
                      Notes:&nbsp;
                    </span>
                    <span className="text-slate-600">{order.notes}</span>
                  </p>
                )}

                <div className="mt-8 pt-4 text-[10px] text-slate-500 leading-relaxed">
                  <p className="font-bold uppercase tracking-widest text-slate-900">Terms &amp; Conditions</p>
                  <p className="mt-1">1. Goods once sold are not returnable without the original invoice.</p>
                  <p>2. E. &amp; O.E. Goods sold subject to supplier&apos;s terms and conditions.</p>
                  <p>3. Subject to {stateName(tenant?.stateCode)} jurisdiction.</p>
                  <p className="mt-2 font-mono text-[9px]">This is a computer generated invoice.</p>
                </div>
              </div>

              {/* Totals column */}
              <div className="sm:col-span-2 font-mono tabular-nums text-[11px]">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Total Taxable Value</span>
                    <span className="font-bold text-slate-900">{inr(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Discount ({order.couponCode || 'promo'})</span>
                      <span className="font-bold text-slate-900">- {inr(discount)}</span>
                    </div>
                  )}
                  {!isInterstate ? (
                    <>
                      <div className="flex justify-between text-slate-700">
                        <span>CGST</span>
                        <span className="font-bold text-slate-900">{inr(totalCgst)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>SGST</span>
                        <span className="font-bold text-slate-900">{inr(totalSgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-700">
                      <span>IGST</span>
                      <span className="font-bold text-slate-900">{inr(totalIgst)}</span>
                    </div>
                  )}
                  {Math.abs(roundOff) >= 0.005 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Round Off</span>
                      <span className="font-bold text-slate-900">{inr(roundOff)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2 mt-2 text-[13px]">
                    <span className="font-extrabold uppercase tracking-wide text-slate-900">Grand Total</span>
                    <span className="font-extrabold text-slate-900">{inr(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 text-right">
                  <p className="font-bold text-slate-900">For {supplierName}</p>
                  <div className="h-14" />
                  <p className="text-[10px] font-mono text-slate-500">
                    (Authorized Signatory)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}