'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Wallet,
  Phone,
  Mail,
  FileText,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KhataPaymentModal } from '@/components/customers/khata-payment-modal';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchCustomerDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success) setCustomer(data.data);
    } catch (err) {
      console.error('Failed to load customer details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Fetching customer profile & Khata ledger...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <p>Customer profile not found.</p>
        <Link href="/customers">
          <Button variant="outline">Back to Customer Directory</Button>
        </Link>
      </div>
    );
  }

  const balance = Number(customer.currentBalance);
  const limit = Number(customer.creditLimit);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <button className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{customer.name}</span>
              {customer.gstin && <Badge variant="info">B2B Buyer</Badge>}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Phone: {customer.phone} {customer.email ? `| Email: ${customer.email}` : ''}
            </p>
          </div>
        </div>

        {balance > 0 && (
          <div className="shrink-0">
            <Button
              variant="accent"
              onClick={() => setIsPaymentModalOpen(true)}
              leftIcon={<Wallet className="h-4 w-4" />}
            >
              Receive Khata Payment
            </Button>
          </div>
        )}
      </div>

      {/* Credit & Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Current Khata Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-amber-950">
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <p className="text-2xs text-amber-700 mt-1">Outstanding credit given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Credit Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900">
              ₹{limit.toLocaleString('en-IN')}
            </div>
            <p className="text-2xs text-slate-400 mt-1">Maximum allowed credit cap</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sales Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900">
              {customer.orders?.length || 0} Orders
            </div>
            <p className="text-2xs text-slate-400 mt-1">Omnichannel purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Khata Ledger Timeline Table */}
      <Card>
        <CardHeader>
          <CardTitle>Khata Transaction Ledger Audit</CardTitle>
          <CardDescription>Chronological list of credit extended and payments collected</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {customer.khataRecords?.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No Khata ledger entries logged for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Date & Time</th>
                    <th className="px-6 py-3">Transaction Type</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Balance After</th>
                    <th className="px-6 py-3">Notes & Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.khataRecords?.map((entry: any) => {
                    const isDebit = entry.type === 'DEBIT_CREDIT_GIVEN';
                    const amount = Number(entry.amount);

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3.5 font-mono text-2xs text-slate-500">
                          {new Date(entry.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>

                        <td className="px-6 py-3.5">
                          {isDebit ? (
                            <Badge variant="warning" className="flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3" />
                              <span>Credit Given (Debit)</span>
                            </Badge>
                          ) : (
                            <Badge variant="success" className="flex items-center gap-1">
                              <ArrowDownRight className="h-3 w-3" />
                              <span>Payment Received</span>
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-3.5 text-right font-bold font-tabular">
                          <span className={isDebit ? 'text-amber-900' : 'text-emerald-700'}>
                            {isDebit ? `+₹${amount.toLocaleString('en-IN')}` : `-₹${amount.toLocaleString('en-IN')}`}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-right font-extrabold font-tabular text-slate-900 bg-slate-50/50">
                          ₹{Number(entry.balanceAfter).toLocaleString('en-IN')}
                        </td>

                        <td className="px-6 py-3.5 text-xs text-slate-600">
                          {entry.notes || '—'}
                          {entry.paymentMode && (
                            <span className="ml-2 font-mono text-2xs font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {entry.paymentMode}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication & Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Customer Communication & Notification History</span>
          </CardTitle>
          <CardDescription>
            Chronological audit of notifications, alerts, and SMS/WhatsApp messages sent to this customer
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!customer.notifications || customer.notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No communication or notifications recorded for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Sent Time</th>
                    <th className="px-6 py-3">Channel & Type</th>
                    <th className="px-6 py-3">Title & Message</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.notifications.map((notif: any) => (
                    <tr key={notif.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3.5 font-mono text-2xs text-slate-500">
                        {new Date(notif.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-800">{notif.channel}</span>
                        <span className="block text-2xs text-slate-400">{notif.type}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900 block">{notif.title}</span>
                        <span className="text-2xs text-slate-600 font-sans">{notif.message}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-2xs px-2 py-0.5 rounded-full font-semibold ${
                            notif.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : notif.status === 'SENT'
                              ? 'bg-blue-100 text-blue-800'
                              : notif.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {notif.status}
                        </span>
                        {notif.failureReason && (
                          <span className="block text-2xs text-rose-500 mt-1 truncate max-w-[180px]">
                            {notif.failureReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <KhataPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={fetchCustomerDetails}
        customer={customer}
      />
    </div>
  );
}
