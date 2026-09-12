'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  MessageSquare,
  Smartphone,
  Sliders,
  FileText,
  TrendingUp,
  CheckCheck,
  User,
  Trash2,
  Edit2,
  ShieldAlert,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  tenantId: string;
  customerId?: string | null;
  type: string;
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';
  title: string;
  message: string;
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  } | null;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channel: string;
  subject?: string | null;
  body: string;
  variables: string[];
  isEnabled: boolean;
}

interface NotificationAnalytics {
  overview: {
    totalCount: number;
    deliveredCount: number;
    sentCount: number;
    pendingCount: number;
    failedCount: number;
    unreadCount: number;
    deliveryRate: number;
  };
  channelDistribution: { channel: string; count: number }[];
  typeDistribution: { type: string; count: number }[];
}

export default function NotificationsDashboardPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'templates' | 'analytics'>('feed');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<NotificationItem | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Send form state
  const [sendType, setSendType] = useState('SYSTEM');
  const [sendChannel, setSendChannel] = useState<'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP'>('IN_APP');
  const [sendTitle, setSendTitle] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('ORDER_CONFIRMED');
  const [templateChannel, setTemplateChannel] = useState('IN_APP');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (typeFilter) queryParams.set('type', typeFilter);
      if (channelFilter) queryParams.set('channel', channelFilter);
      if (statusFilter) queryParams.set('status', statusFilter);
      if (search) queryParams.set('search', search);

      const [nRes, tRes, aRes] = await Promise.all([
        fetch(`/api/notifications?${queryParams.toString()}`),
        fetch('/api/notifications/templates'),
        fetch('/api/notifications/analytics'),
      ]);

      const [nJson, tJson, aJson] = await Promise.all([nRes.json(), tRes.json(), aRes.json()]);

      if (nJson.success) setNotifications(nJson.data || []);
      if (tJson.success) setTemplates(tJson.data || []);
      if (aJson.success) setAnalytics(aJson.data || null);
    } catch (err) {
      console.error('Failed to load notification data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, channelFilter, statusFilter]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error marking all read', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      fetchData();
    } catch (err) {
      console.error('Error marking read', err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId || undefined,
          type: sendType,
          channel: sendChannel,
          title: sendTitle,
          body: sendMessage,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || 'Notification dispatched!');
        setSendModalOpen(false);
        setSendTitle('');
        setSendMessage('');
        setSelectedTemplateId('');
        fetchData();
      } else {
        setErrorMsg(json.error || 'Failed to dispatch notification');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: templateName,
        type: templateType,
        channel: templateChannel,
        subject: templateSubject || undefined,
        body: templateBody,
      };

      const url = editingTemplate
        ? `/api/notifications/templates/${editingTemplate.id}`
        : '/api/notifications/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setTemplateModalOpen(false);
        setEditingTemplate(null);
        setTemplateName('');
        setTemplateBody('');
        fetchData();
      } else {
        setErrorMsg(json.error || 'Failed to save template');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving template');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`/api/notifications/templates/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || 'Failed to delete template');
      }
    } catch (err) {
      alert('Error deleting template');
    }
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'EMAIL':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'SMS':
        return <Smartphone className="h-4 w-4 text-emerald-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4 text-emerald-600" />;
      default:
        return <Bell className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
            <Send className="h-3 w-3" /> Sent
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800">
            <XCircle className="h-3 w-3" /> Failed / Not Configured
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-500" />
            Notifications & Engagement Center
          </h1>
          <p className="text-sm text-slate-500">
            Omnichannel customer notifications, order lifecycle updates, and business alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            Mark All Read
          </button>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setTemplateName('');
              setTemplateBody('');
              setTemplateModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            New Template
          </button>
          <button
            onClick={() => setSendModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition flex items-center gap-1.5 shadow-xs"
          >
            <Send className="h-4 w-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Total Sent</span>
            <Bell className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics?.overview.totalCount ?? 0}</div>
          <span className="text-2xs text-slate-500">Across all channels</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{analytics?.overview.deliveredCount ?? 0}</div>
          <span className="text-2xs text-slate-500">Successful customer receipts</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics?.overview.pendingCount ?? 0}</div>
          <span className="text-2xs text-slate-500">Awaiting dispatch</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Failed / Not Config</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{analytics?.overview.failedCount ?? 0}</div>
          <span className="text-2xs text-slate-500">Provider credential gaps</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Unread Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{analytics?.overview.unreadCount ?? 0}</div>
          <span className="text-2xs text-slate-500">In-app notifications</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Delivery Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {analytics?.overview.deliveryRate ?? 100}%
          </div>
          <span className="text-2xs text-slate-500">Real verified rate</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'feed'
              ? 'border-amber-600 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Notifications Feed ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-amber-600 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Notification Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-amber-600 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Channel Distribution Analytics
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="">All Types</option>
            <option value="ORDER_CONFIRMED">Order Confirmed</option>
            <option value="ORDER_PACKED">Order Packed</option>
            <option value="ORDER_DISPATCHED">Order Dispatched</option>
            <option value="ORDER_DELIVERED">Order Delivered</option>
            <option value="PAYMENT_RECEIVED">Payment Received</option>
            <option value="KHATA_PAYMENT_DUE">Khata Payment Due</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="CAMPAIGN">Campaign</option>
            <option value="SYSTEM">System</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="p-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="">All Channels</option>
            <option value="IN_APP">In-App</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="SENT">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-slate-800 border border-slate-300 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 1: FEED & ACTIVITY LOG */}
      {activeTab === 'feed' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Channel & Type</th>
                  <th className="px-6 py-3">Title & Message</th>
                  <th className="px-6 py-3">Recipient Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created / Sent At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading notifications...
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No notifications recorded yet. Trigger an order or send a test notification above.
                    </td>
                  </tr>
                ) : (
                  notifications.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition ${!item.isRead ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(item.channel)}
                          <span className="font-semibold text-xs text-slate-800">
                            {item.channel}
                          </span>
                        </div>
                        <span className="block text-2xs text-slate-400 mt-0.5">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" title="Unread" />
                          )}
                          {item.title}
                        </div>
                        <p className="text-2xs text-slate-500 truncate max-w-xs">{item.message}</p>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {item.customer ? (
                          <div>
                            <span className="font-semibold text-slate-800">{item.customer.name}</span>
                            <span className="block text-2xs text-slate-400">{item.customer.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-2xs">System / Merchant Alert</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                        {item.failureReason && (
                          <span className="block text-2xs text-rose-500 mt-1 truncate max-w-[160px]" title={item.failureReason}>
                            {item.failureReason}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setDetailModalItem(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition text-xs font-semibold"
                        >
                          Details
                        </button>
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkSingleRead(item.id)}
                            className="p-1 text-amber-600 hover:text-amber-800 transition text-xs font-semibold"
                          >
                            Mark Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Template Name</th>
                  <th className="px-6 py-3">Type & Channel</th>
                  <th className="px-6 py-3">Body Template</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No custom notification templates created yet.
                    </td>
                  </tr>
                ) : (
                  templates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{tpl.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700">{tpl.type}</span>
                        <span className="block text-2xs text-slate-400">{tpl.channel}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600 max-w-sm truncate">
                        {tpl.body}
                      </td>
                      <td className="px-6 py-4">
                        {tpl.isEnabled ? (
                          <span className="text-2xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                            Enabled
                          </span>
                        ) : (
                          <span className="text-2xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingTemplate(tpl);
                            setTemplateName(tpl.name);
                            setTemplateType(tpl.type);
                            setTemplateChannel(tpl.channel);
                            setTemplateSubject(tpl.subject || '');
                            setTemplateBody(tpl.body);
                            setTemplateModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition"
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

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-amber-500" />
              Channel Volume Breakdown
            </h3>
            <div className="space-y-3">
              {analytics?.channelDistribution && analytics.channelDistribution.length > 0 ? (
                analytics.channelDistribution.map((ch) => (
                  <div key={ch.channel} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{ch.channel}</span>
                    <span className="font-bold text-slate-900">{ch.count} sent</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs">No channel data available.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Notification Type Breakdown
            </h3>
            <div className="space-y-3">
              {analytics?.typeDistribution && analytics.typeDistribution.length > 0 ? (
                analytics.typeDistribution.map((tp) => (
                  <div key={tp.type} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{tp.type}</span>
                    <span className="font-bold text-slate-900">{tp.count} sent</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs">No type data available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEND NOTIFICATION MODAL */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-5 w-5 text-amber-600" />
                Dispatch Customer Notification
              </h3>
              <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Channel</label>
                  <select
                    value={sendChannel}
                    onChange={(e: any) => setSendChannel(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="IN_APP">In-App Notification</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS Gateway</option>
                    <option value="WHATSAPP">WhatsApp Business</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Notification Type</label>
                  <select
                    value={sendType}
                    onChange={(e) => setSendType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="SYSTEM">System Alert</option>
                    <option value="CAMPAIGN">Campaign Promotion</option>
                    <option value="COUPON">Coupon Announcement</option>
                    <option value="ORDER_CONFIRMED">Order Update</option>
                    <option value="KHATA_PAYMENT_DUE">Khata Payment Due</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Festive Offer for You"
                  value={sendTitle}
                  onChange={(e) => setSendTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Use {{customerName}}, {{orderNumber}}, etc..."
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSendModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Dispatching...' : 'Dispatch Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {templateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTemplate ? 'Edit Template' : 'Create Notification Template'}
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Confirmation SMS"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="ORDER_CONFIRMED">Order Confirmed</option>
                    <option value="ORDER_PACKED">Order Packed</option>
                    <option value="ORDER_DISPATCHED">Order Dispatched</option>
                    <option value="ORDER_DELIVERED">Order Delivered</option>
                    <option value="PAYMENT_RECEIVED">Payment Received</option>
                    <option value="KHATA_PAYMENT_DUE">Khata Payment Due</option>
                    <option value="LOW_STOCK">Low Stock Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Channel</label>
                  <select
                    value={templateChannel}
                    onChange={(e) => setTemplateChannel(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="IN_APP">In-App</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject (optional)</label>
                <input
                  type="text"
                  placeholder="Email subject..."
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Body Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Dear {{customerName}}, your order {{orderNumber}} is confirmed."
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Notification Details</h3>
              <button onClick={() => setDetailModalItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">ID:</span>
                <span className="font-mono text-2xs">{detailModalItem.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">Type / Channel:</span>
                <span>{detailModalItem.type} ({detailModalItem.channel})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">Status:</span>
                <div>{getStatusBadge(detailModalItem.status)}</div>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500 block mb-1">Title:</span>
                <span className="font-bold text-slate-900">{detailModalItem.title}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500 block mb-1">Message:</span>
                <p className="text-slate-800 font-sans whitespace-pre-wrap">{detailModalItem.message}</p>
              </div>
              {detailModalItem.failureReason && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  <span className="font-bold block">Delivery Note:</span>
                  {detailModalItem.failureReason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
