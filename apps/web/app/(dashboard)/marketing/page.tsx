'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  Megaphone,
  TrendingUp,
  Percent,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  startAt: string;
  endAt: string;
  budget?: number | null;
  usageLimit?: number | null;
  _count?: {
    coupons: number;
    promotionRules: number;
  };
}

interface Coupon {
  id: string;
  campaignId?: string | null;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT';
  discountValue: number;
  targetType: 'ALL_PRODUCTS' | 'SELECTED_PRODUCTS' | 'SELECTED_CATEGORIES';
  targetIds: string[];
  minOrderValue: number;
  maxDiscount?: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit?: number | null;
  usageCount: number;
  perCustomerLimit?: number | null;
  isActive: boolean;
  campaign?: {
    name: string;
  } | null;
}

interface MarketingAnalytics {
  summary: {
    activeCampaignsCount: number;
    activeCouponsCount: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
    attributedRevenue: number;
    attributedOrdersCount: number;
  };
  topCoupons: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    usageCount: number;
    usageLimit?: number | null;
    isActive: boolean;
  }[];
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'campaigns' | 'analytics'>('coupons');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Coupon form state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FLAT_AMOUNT'>('PERCENTAGE');
  const [couponValue, setCouponValue] = useState<number>(10);
  const [couponTarget, setCouponTarget] = useState<'ALL_PRODUCTS' | 'SELECTED_PRODUCTS' | 'SELECTED_CATEGORIES'>('ALL_PRODUCTS');
  const [minOrderVal, setMinOrderVal] = useState<number>(0);
  const [maxDiscountVal, setMaxDiscountVal] = useState<number | ''>('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [usageLimitVal, setUsageLimitVal] = useState<number | ''>('');
  const [perCustomerVal, setPerCustomerVal] = useState<number | ''>(1);
  const [campaignIdSelect, setCampaignIdSelect] = useState<string>('');

  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('ACTIVE');
  const [campStartAt, setCampStartAt] = useState(new Date().toISOString().split('T')[0]);
  const [campEndAt, setCampEndAt] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [campBudget, setCampBudget] = useState<number | ''>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, kRes, aRes] = await Promise.all([
        fetch('/api/marketing/coupons'),
        fetch('/api/marketing/campaigns'),
        fetch('/api/marketing/analytics'),
      ]);

      const [cJson, kJson, aJson] = await Promise.all([cRes.json(), kRes.json(), aRes.json()]);

      if (cJson.success) setCoupons(cJson.data || []);
      if (kJson.success) setCampaigns(kJson.data || []);
      if (aJson.success) setAnalytics(aJson.data || null);
    } catch (err) {
      console.error('Failed to load marketing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetCouponForm = () => {
    setEditingCoupon(null);
    setCouponCode('');
    setCouponType('PERCENTAGE');
    setCouponValue(10);
    setCouponTarget('ALL_PRODUCTS');
    setMinOrderVal(0);
    setMaxDiscountVal('');
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setUsageLimitVal('');
    setPerCustomerVal(1);
    setCampaignIdSelect('');
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponCode(coupon.code);
    setCouponType(coupon.discountType);
    setCouponValue(coupon.discountValue);
    setCouponTarget(coupon.targetType);
    setMinOrderVal(coupon.minOrderValue);
    setMaxDiscountVal(coupon.maxDiscount ?? '');
    setValidFrom(new Date(coupon.validFrom).toISOString().split('T')[0]);
    setValidUntil(new Date(coupon.validUntil).toISOString().split('T')[0]);
    setUsageLimitVal(coupon.usageLimit ?? '');
    setPerCustomerVal(coupon.perCustomerLimit ?? '');
    setCampaignIdSelect(coupon.campaignId || '');
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        code: couponCode,
        discountType: couponType,
        discountValue: Number(couponValue),
        targetType: couponTarget,
        minOrderValue: Number(minOrderVal),
        maxDiscount: maxDiscountVal !== '' ? Number(maxDiscountVal) : null,
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        usageLimit: usageLimitVal !== '' ? Number(usageLimitVal) : null,
        perCustomerLimit: perCustomerVal !== '' ? Number(perCustomerVal) : null,
        campaignId: campaignIdSelect ? campaignIdSelect : null,
      };

      const url = editingCoupon ? `/api/marketing/coupons/${editingCoupon.id}` : '/api/marketing/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        setCouponModalOpen(false);
        resetCouponForm();
        fetchData();
      } else {
        setErrorMsg(json.error || 'Failed to save coupon');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/marketing/coupons/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || 'Failed to delete coupon');
      }
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  const resetCampaignForm = () => {
    setEditingCampaign(null);
    setCampaignName('');
    setCampaignDesc('');
    setCampaignStatus('ACTIVE');
    setCampStartAt(new Date().toISOString().split('T')[0]);
    setCampEndAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setCampBudget('');
  };

  const handleOpenEditCampaign = (camp: Campaign) => {
    setEditingCampaign(camp);
    setCampaignName(camp.name);
    setCampaignDesc(camp.description || '');
    setCampaignStatus(camp.status);
    setCampStartAt(new Date(camp.startAt).toISOString().split('T')[0]);
    setCampEndAt(new Date(camp.endAt).toISOString().split('T')[0]);
    setCampBudget(camp.budget ?? '');
    setCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: campaignName,
        description: campaignDesc,
        status: campaignStatus,
        startAt: new Date(campStartAt).toISOString(),
        endAt: new Date(campEndAt).toISOString(),
        budget: campBudget !== '' ? Number(campBudget) : undefined,
      };

      const url = editingCampaign ? `/api/marketing/campaigns/${editingCampaign.id}` : '/api/marketing/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(editingCampaign ? 'Campaign updated!' : 'Campaign created!');
        setCampaignModalOpen(false);
        resetCampaignForm();
        fetchData();
      } else {
        setErrorMsg(json.error || 'Failed to save campaign');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || 'Failed to delete campaign');
      }
    } catch (err) {
      alert('Error deleting campaign');
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.campaign?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-amber-500" />
            Marketing & Promotions
          </h1>
          <p className="text-sm text-slate-500">
            Create promotional coupons, track discount redemptions, and measure campaign ROI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetCampaignForm();
              setCampaignModalOpen(true);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Megaphone className="h-4 w-4 text-slate-500" />
            New Campaign
          </button>
          <button
            onClick={() => {
              resetCouponForm();
              setCouponModalOpen(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            New Promo Coupon
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
            <Megaphone className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analytics?.summary.activeCampaignsCount ?? 0}
          </div>
          <span className="text-2xs text-slate-500">Live promotion streams</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Coupons</span>
            <Tag className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analytics?.summary.activeCouponsCount ?? 0}
          </div>
          <span className="text-2xs text-slate-500">Available at storefront</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Redemptions</span>
            <Percent className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analytics?.summary.totalRedemptions ?? 0}
          </div>
          <span className="text-2xs text-slate-500">Checkout applications</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Discounts</span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{(analytics?.summary.totalDiscountGiven ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500">Trade discounts granted</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Attributed Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            ₹{(analytics?.summary.attributedRevenue ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500">
            Across {analytics?.summary.attributedOrdersCount ?? 0} orders
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'coupons'
              ? 'border-amber-600 text-amber-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Coupons & Promo Codes ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'campaigns'
              ? 'border-amber-600 text-amber-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-amber-600 text-amber-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Performance Analytics
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupon or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-slate-800 border border-slate-300 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'coupons' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Target & Min Order</th>
                  <th className="px-6 py-3">Validity</th>
                  <th className="px-6 py-3">Usage</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No promo coupons found. Click <strong>+ New Promo Coupon</strong> to launch one.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded border border-amber-300">
                          {coupon.code}
                        </span>
                        {coupon.campaign && (
                          <span className="block text-2xs font-normal font-sans text-slate-400 mt-1">
                            {coupon.campaign.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                        {coupon.maxDiscount && (
                          <span className="block text-2xs font-normal text-slate-400">
                            Max ₹{coupon.maxDiscount}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {coupon.targetType.replace('_', ' ')}
                        </span>
                        <span className="block text-2xs text-slate-500 mt-1">
                          Min order: ₹{coupon.minOrderValue}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div>
                          {new Date(coupon.validFrom).toLocaleDateString('en-IN')} -{' '}
                          {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{coupon.usageCount}</span>
                        <span className="text-slate-400">
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (Unlimited)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditCoupon(coupon)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 transition"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Campaign Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3">Associated Coupons</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading campaigns...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No campaigns found. Click <strong>+ New Campaign</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{camp.name}</div>
                        {camp.description && (
                          <div className="text-2xs text-slate-500">{camp.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            camp.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : camp.status === 'PAUSED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(camp.startAt).toLocaleDateString('en-IN')} -{' '}
                        {new Date(camp.endAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {camp.budget ? `₹${camp.budget.toLocaleString('en-IN')}` : 'Flexible'}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {camp._count?.coupons || 0} coupons
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditCampaign(camp)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 transition"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Top Performing Coupons by Redemptions
            </h3>
            {analytics?.topCoupons && analytics.topCoupons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Coupon Code</th>
                      <th className="px-4 py-2.5">Discount Offer</th>
                      <th className="px-4 py-2.5">Redemptions</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {analytics.topCoupons.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.code}</td>
                        <td className="px-4 py-3 text-slate-800">
                          {c.discountType === 'PERCENTAGE'
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} OFF`}
                        </td>
                        <td className="px-4 py-3 font-bold text-amber-600">{c.usageCount}</td>
                        <td className="px-4 py-3">
                          {c.isActive ? (
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-4">
                No redemption activity recorded yet. Promos will display metrics here once customers redeem coupons at storefront checkout.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCoupon ? 'Edit Promo Coupon' : 'Create Promo Coupon'}
              </h3>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e: any) => setCouponType(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Discount Value ({couponType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponValue}
                    onChange={(e) => setCouponValue(Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderVal}
                    onChange={(e) => setMinOrderVal(Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Max Discount Limit (₹ optional)</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={maxDiscountVal}
                    onChange={(e) => setMaxDiscountVal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Valid From</label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Total Usage Limit (optional)</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={usageLimitVal}
                    onChange={(e) => setUsageLimitVal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Per Customer Limit</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={perCustomerVal}
                    onChange={(e) => setPerCustomerVal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Link to Campaign (optional)</label>
                <select
                  value={campaignIdSelect}
                  onChange={(e) => setCampaignIdSelect(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                >
                  <option value="">-- Standalone Coupon --</option>
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CAMPAIGN MODAL */}
      {campaignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCampaign ? 'Edit Marketing Campaign' : 'Create Marketing Campaign'}
              </h3>
              <button
                onClick={() => setCampaignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Sale 2026"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief objective or notes..."
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={campaignStatus}
                    onChange={(e) => setCampaignStatus(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ENDED">ENDED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Budget (₹ optional)</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={campBudget}
                    onChange={(e) => setCampBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={campStartAt}
                    onChange={(e) => setCampStartAt(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={campEndAt}
                    onChange={(e) => setCampEndAt(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
