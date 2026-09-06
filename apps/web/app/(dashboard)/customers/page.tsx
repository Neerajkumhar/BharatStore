'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  FileText,
  Loader2,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CustomerModal } from '@/components/customers/customer-modal';
import { KhataPaymentModal } from '@/components/customers/khata-payment-modal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<any>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Aggregate metrics
  const totalReceivable = customers.reduce((acc, c) => acc + Math.max(0, Number(c.currentBalance)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-amber-600" />
            <span>Customer Directory & Khata Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage customer credit limits, track outstanding balances, and collect Khata payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="accent"
            onClick={() => setIsCustomerModalOpen(true)}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Add New Customer
          </Button>
        </div>
      </div>

      {/* KPI Receivables Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Total Khata Receivable
            </CardTitle>
            <Wallet className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-amber-950">
              ₹{totalReceivable.toLocaleString('en-IN')}
            </div>
            <p className="text-2xs text-amber-700 mt-1">Outstanding credit balance owed by customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Customers
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900">
              {customers.length}
            </div>
            <p className="text-2xs text-slate-400 mt-1">Total active customer profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              B2B Registered (GSTIN)
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900">
              {customers.filter((c) => c.gstin).length}
            </div>
            <p className="text-2xs text-slate-400 mt-1">Eligible for B2B Tax Invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Customer Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>Customer Directory</CardTitle>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name, phone, or GSTIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefixSlot={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="text-sm font-medium">Fetching customer directory...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm space-y-2">
              <p>No customers found matching search.</p>
              <Button variant="accent" size="sm" onClick={() => setIsCustomerModalOpen(true)}>
                Add First Customer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Customer Name</th>
                    <th className="px-6 py-3.5">Contact Phone & Email</th>
                    <th className="px-6 py-3.5">GSTIN</th>
                    <th className="px-6 py-3.5">Total Orders</th>
                    <th className="px-6 py-3.5">Khata Outstanding</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const balance = Number(c.currentBalance);
                    const limit = Number(c.creditLimit);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-2xs text-slate-400">Limit: ₹{limit.toLocaleString('en-IN')}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-mono text-slate-800 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                          {c.email && <div className="text-2xs text-slate-400">{c.email}</div>}
                        </td>

                        <td className="px-6 py-4">
                          {c.gstin ? (
                            <span className="font-mono text-2xs font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                              {c.gstin}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-2xs">Consumer (B2C)</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                          {c._count?.orders || 0} Orders
                        </td>

                        <td className="px-6 py-4">
                          {balance > 0 ? (
                            <span className="font-bold font-tabular text-amber-900 bg-amber-100 px-2.5 py-1 rounded text-xs">
                              ₹{balance.toLocaleString('en-IN')} Owed
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Clear Balance
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {balance > 0 && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedCustomerForPayment(c)}
                                leftIcon={<Wallet className="h-3.5 w-3.5 text-emerald-600" />}
                              >
                                Receive Payment
                              </Button>
                            )}
                            <Link href={`/customers/${c.id}`}>
                              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                                View Ledger
                              </Button>
                            </Link>
                          </div>
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchCustomers}
      />

      {/* Khata Payment Collection Modal */}
      <KhataPaymentModal
        isOpen={Boolean(selectedCustomerForPayment)}
        onClose={() => setSelectedCustomerForPayment(null)}
        onSuccess={fetchCustomers}
        customer={selectedCustomerForPayment}
      />
    </div>
  );
}
