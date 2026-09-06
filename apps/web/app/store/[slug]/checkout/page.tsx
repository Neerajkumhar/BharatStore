'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Tag,
  XCircle,
} from 'lucide-react';
import { useCart } from '@/components/storefront/cart-context';

const indianStates = [
  { code: '09', name: 'Uttar Pradesh' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '19', name: 'West Bengal' },
  { code: '24', name: 'Gujarat' },
  { code: '08', name: 'Rajasthan' },
  { code: '06', name: 'Haryana' },
  { code: '10', name: 'Bihar' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '32', name: 'Kerala' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
];

export default function StorefrontCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { items, totalItems, totalAmount, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    city: '',
    stateCode: '09',
    pincode: '',
    gstin: '',
    paymentMethod: 'CASH',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch('/api/marketing/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          tenantSlug: slug,
          customerPhone: form.customerPhone,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.valid) {
        throw new Error(json.reason || 'Invalid coupon code');
      }

      setAppliedCoupon(json.coupon);
      setDiscountAmount(json.discountAmount);
      setCouponSuccess(`Coupon "${json.coupon.code}" applied! You saved ₹${json.discountAmount}`);
    } catch (err: any) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError('');
    setCouponSuccess('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/store/${slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process checkout');
      }

      // Clear local cart state
      clearCart();

      // Navigate to order confirmation
      router.push(`/store/${slug}/order-confirmation/${json.data.orderId}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Error processing order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 stroke-1" />
        <h2 className="text-2xl font-extrabold text-slate-900">Your cart is currently empty</h2>
        <p className="text-xs text-slate-500">Add products to your cart before proceeding to checkout.</p>
        <Link
          href={`/store/${slug}/products`}
          className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          Browse Store Catalog
        </Link>
      </div>
    );
  }

  const finalPayable = Math.max(0, totalAmount - discountAmount);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Express Checkout</h1>
          <p className="text-xs text-slate-500 mt-0.5">Secure direct order placement</p>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
          <Lock className="h-3.5 w-3.5" />
          <span>Server Verified</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Contact Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Customer Contact Info
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Optional)</label>
              <input
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="For digital invoice copy..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Step 2: Shipping / Delivery Address */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Shipping & Delivery Address
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / House No. *</label>
              <input
                type="text"
                name="shippingAddress"
                value={form.shippingAddress}
                onChange={handleChange}
                placeholder="Building, street, landmark..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                <select
                  name="stateCode"
                  value={form.stateCode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                >
                  {indianStates.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (Optional B2B Claim)</label>
              <input
                type="text"
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                placeholder="15-digit Buyer GSTIN..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Step 3: Payment Method Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 border rounded-xl cursor-pointer flex flex-col justify-between space-y-2 transition ${form.paymentMethod === 'CASH' ? 'border-amber-500 bg-amber-50/50 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={form.paymentMethod === 'CASH'}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <p className="text-2xs text-slate-500">Pay cash upon store delivery</p>
              </label>

              <label
                className={`p-4 border rounded-xl cursor-pointer flex flex-col justify-between space-y-2 transition ${form.paymentMethod === 'UPI_DIRECT' ? 'border-amber-500 bg-amber-50/50 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">UPI Direct Pay</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI_DIRECT"
                    checked={form.paymentMethod === 'UPI_DIRECT'}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <p className="text-2xs text-slate-500">Google Pay, PhonePe, Paytm</p>
              </label>

              <label
                className={`p-4 border rounded-xl cursor-pointer flex flex-col justify-between space-y-2 transition ${form.paymentMethod === 'KHATA_CREDIT' ? 'border-amber-500 bg-amber-50/50 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Khata Store Credit</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="KHATA_CREDIT"
                    checked={form.paymentMethod === 'KHATA_CREDIT'}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <p className="text-2xs text-slate-500">Record in merchant customer ledger</p>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Total Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="h-5 w-5 text-slate-900" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Order Summary ({totalItems})
              </h2>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.variantId} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 truncate max-w-[160px]">{item.productTitle}</h4>
                    <p className="text-2xs text-slate-500">{item.variantName} × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Promo Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-500" />
                <span>Promo Coupon Code</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  disabled={Boolean(appliedCoupon)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 border border-rose-200 transition shrink-0"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 shrink-0"
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                )}
              </div>

              {couponError && <p className="text-2xs font-bold text-rose-600">{couponError}</p>}
              {couponSuccess && <p className="text-2xs font-bold text-emerald-600">{couponSuccess}</p>}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Subtotal</span>
                <span className="font-semibold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated GST Tax</span>
                <span className="font-semibold text-slate-900">Calculated on Server</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Store Delivery</span>
                <span className="text-emerald-700 font-semibold text-2xs">FREE</span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Amount Payable</span>
                <span className="text-amber-600 text-lg">₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <span>{loading ? 'Processing Order...' : 'Place Order Now'}</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>

            <div className="flex items-center justify-center gap-1 text-2xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct fulfillment by {slug}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
