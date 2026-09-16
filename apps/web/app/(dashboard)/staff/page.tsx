'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Trash2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface StaffMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleId: string;
  status: string;
  isOwner: boolean;
  joinedAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('STAFF');
  const [inviting, setInviting] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const json = await res.json();
      if (json.success) {
        setStaff(json.data.staff || []);
        setPendingInvitations(json.data.pendingInvitations || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setErrorMsg('');
    setGeneratedInviteUrl('');

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, roleName: inviteRole }),
      });

      const json = await res.json();
      if (json.success) {
        setGeneratedInviteUrl(json.data.inviteUrl);
        setSuccessMsg(`Invitation created for ${inviteEmail}`);
        fetchStaff();
      } else {
        setErrorMsg(json.error || 'Failed to create invitation');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inviting staff member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/staff/${membershipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: newRole }),
      });

      const json = await res.json();
      if (json.success) {
        fetchStaff();
      } else {
        alert(json.error || 'Failed to update role');
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleToggleStatus = async (membershipId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/staff/${membershipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (json.success) {
        fetchStaff();
      } else {
        alert(json.error || 'Failed to toggle status');
      }
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleRemoveStaff = async (membershipId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this business?`)) return;

    try {
      const res = await fetch(`/api/admin/staff/${membershipId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (json.success) {
        fetchStaff();
      } else {
        alert(json.error || 'Failed to remove staff');
      }
    } catch (err) {
      console.error('Remove staff error:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredStaff = staff.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-amber-400" />
            <span className="bg-amber-500 text-white text-2xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Tenant RBAC Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Team Management</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Manage multi-user access levels, invite staff, and enforce least-privilege policies
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setInviteModalOpen(true);
              setGeneratedInviteUrl('');
              setErrorMsg('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite New Staff</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-80 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search staff by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter Role:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>
      </div>

      {/* Active Staff Members Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Team Members ({filteredStaff.length})
          </h3>
          <span className="text-2xs font-bold text-slate-400">Scoped to Active Tenant</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => (
                  <tr key={member.membershipId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.isOwner && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-2xs font-extrabold flex items-center gap-1">
                            <Lock className="h-3 w-3" /> OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-2xs text-slate-500 font-mono">{member.email} • {member.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {member.isOwner ? (
                        <span className="font-extrabold text-amber-700 uppercase">OWNER</span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.membershipId, e.target.value)}
                          className="px-2.5 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="STAFF">STAFF</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-2xs">
                      {new Date(member.joinedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!member.isOwner ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(member.membershipId, member.status)}
                            className="px-2.5 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            {member.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => handleRemoveStaff(member.membershipId, member.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Remove Staff"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xs text-slate-400 font-semibold italic">Protected Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Pending Staff Invitations ({pendingInvitations.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">{inv.email}</span>
                  </div>
                  <span className="text-2xs text-slate-500">
                    Role: {inv.role} • Expires: {new Date(inv.expiresAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <span className="text-2xs font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Invite Staff Member</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-lg text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {!generatedInviteUrl ? (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@business.com"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role *</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="STAFF">STAFF (Orders & Inventory Only)</option>
                    <option value="MANAGER">MANAGER (Catalog, Orders, Customers, Storefront)</option>
                    <option value="ADMIN">ADMIN (Full Admin Privileges)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {inviting ? 'Generating Invitation...' : 'Generate Secure Invitation Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Invitation Link Generated</span>
                  </div>
                  <p className="text-2xs text-slate-600">
                    Share this cryptographically secure single-use invitation link with {inviteEmail}:
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-slate-300 p-2 rounded-lg">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteUrl}
                      className="w-full text-2xs font-mono text-slate-800 bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedInviteUrl)}
                      className="p-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition shrink-0"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setInviteModalOpen(false);
                    setGeneratedInviteUrl('');
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
