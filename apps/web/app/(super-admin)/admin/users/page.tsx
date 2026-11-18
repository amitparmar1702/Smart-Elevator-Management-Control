'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Building2, 
  Key, 
  CheckCircle2, 
  XCircle,
  Lock,
  Edit2,
  Trash2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  organisation: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  mfaEnabled: boolean;
  lastLogin: string;
}

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([
    {
      id: 'usr-1',
      name: 'Alexander Wright',
      email: 'alex.wright@elevateos.io',
      role: 'SUPER_ADMIN',
      organisation: 'ElevateOS Platform',
      status: 'ACTIVE',
      mfaEnabled: true,
      lastLogin: '10 mins ago',
    },
    {
      id: 'usr-2',
      name: 'Sarah Jenkins',
      email: 's.jenkins@apexproperties.com',
      role: 'ORGANISATION_ADMIN',
      organisation: 'Apex Commercial Properties',
      status: 'ACTIVE',
      mfaEnabled: true,
      lastLogin: '25 mins ago',
    },
    {
      id: 'usr-3',
      name: 'Marcus Vance',
      email: 'm.vance@apexproperties.com',
      role: 'BUILDING_MANAGER',
      organisation: 'Apex Commercial Properties',
      status: 'ACTIVE',
      mfaEnabled: true,
      lastLogin: '1 hour ago',
    },
    {
      id: 'usr-4',
      name: 'David Chen',
      email: 'd.chen@apexservice.com',
      role: 'TECHNICIAN',
      organisation: 'Apex Maintenance Vendor',
      status: 'ACTIVE',
      mfaEnabled: false,
      lastLogin: '3 hours ago',
    },
    {
      id: 'usr-5',
      name: 'Elena Rostova',
      email: 'e.rostova@metrocontrol.com',
      role: 'SECURITY_OPERATOR',
      organisation: 'Metro Security Services',
      status: 'ACTIVE',
      mfaEnabled: true,
      lastLogin: '5 mins ago',
    },
    {
      id: 'usr-6',
      name: 'Dr. Rachel Adams',
      email: 'r.adams@penthouse20.com',
      role: 'RESIDENT',
      organisation: 'Apex Financial Tower A',
      status: 'ACTIVE',
      mfaEnabled: false,
      lastLogin: 'Yesterday',
    },
    {
      id: 'usr-7',
      name: 'Thomas K. Bradley',
      email: 't.bradley@complianceaudit.org',
      role: 'AUDITOR',
      organisation: 'Statutory Safety Bureau',
      status: 'ACTIVE',
      mfaEnabled: true,
      lastLogin: '2 days ago',
    },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organisation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Administration' }, { label: 'Users & Permissions' }]}
      title="User Management & Access Control (RBAC)"
      subtitle="Manage multi-tenant accounts, role delegations, multi-factor authentication (MFA), and building scoping"
      actions={
        <Button size="sm" onClick={() => setIsAddUserModalOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Provision New User
        </Button>
      }
    >
      <div className="space-y-6">
        {bannerMsg && (
          <div className="p-3 bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] rounded-[6px] text-xs font-medium flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{bannerMsg}</span>
            </div>
            <button onClick={() => setBannerMsg(null)} className="text-[#15804D] hover:underline font-bold">Dismiss</button>
          </div>
        )}

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Total Active Users</span>
            <div className="mt-1 text-2xl font-bold text-[#1E2232] font-mono">{users.length}</div>
            <span className="text-[11px] text-[#15804D] mt-1 block">100% Verified Identities</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Configured RBAC Roles</span>
            <div className="mt-1 text-2xl font-bold text-[#433690] font-mono">12 Roles</div>
            <span className="text-[11px] text-[#5D6375] mt-1 block">Platform to Resident scopes</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">MFA Adoption Rate</span>
            <div className="mt-1 text-2xl font-bold text-[#15804D] font-mono">71.4%</div>
            <span className="text-[11px] text-[#5D6375] mt-1 block">5 of 7 enforcing TOTP MFA</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Security Sessions</span>
            <div className="mt-1 text-2xl font-bold text-[#1E2232] font-mono">Active</div>
            <span className="text-[11px] text-[#5D6375] mt-1 block">JWT tokens + Argon2id hash</span>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search user by name, email, or tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-page border border-card-border rounded-lg h-10 px-3 w-full sm:w-80 text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-page border border-card-border rounded-lg h-10 px-3 text-main font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ORGANISATION_ADMIN">Organisation Admin</option>
                <option value="BUILDING_MANAGER">Building Manager</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="SECURITY_OPERATOR">Security Operator</option>
                <option value="RESIDENT">Resident</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[880px]">
              <thead className="bg-page/60 text-muted uppercase tracking-wider border-b border-card-border font-mono text-[11px]">
                <tr>
                  <th className="px-5 py-3">User Profile</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Organisation Scope</th>
                  <th className="px-5 py-3 text-center">MFA Status</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3">Account Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-page/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#433690] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-main">{user.name}</div>
                          <div className="text-[11px] text-muted flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] font-semibold bg-page text-main px-2 py-0.5 rounded border border-card-border">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="font-medium text-main flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted" />
                        {user.organisation}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      {user.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-st-running bg-st-running-bg px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted bg-page px-2 py-0.5 rounded-full border border-card-border">
                          <XCircle className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-xs text-muted font-mono">
                      {user.lastLogin}
                    </td>

                    <td className="px-5 py-3">
                      <StatusBadge status={user.status === 'ACTIVE' ? 'RUNNING' : 'WARNING'} />
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 hover:bg-page rounded text-muted hover:text-main transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUsers((prev) =>
                              prev.map((u) => (u.id === user.id ? { ...u, status: 'SUSPENDED' } : u))
                            );
                            setBannerMsg(`All active sessions and tokens revoked for ${user.name}. Status updated to SUSPENDED.`);
                            setTimeout(() => setBannerMsg(null), 5000);
                          }}
                          className="p-1.5 hover:bg-page rounded text-muted hover:text-st-alarm transition-colors"
                          title="Revoke Session"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal for Provisioning User */}
        <Modal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          title="Provision New Enterprise User"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-main mb-1.5">Full Legal Name</label>
              <input type="text" placeholder="e.g. Johnathan Doe" className="w-full h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block font-semibold text-main mb-1.5">Corporate Email</label>
              <input type="email" placeholder="john.doe@enterprise.com" className="w-full h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block font-semibold text-main mb-1.5">Assigned RBAC Role</label>
              <select className="w-full h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium">
                <option>ORGANISATION_ADMIN</option>
                <option>BUILDING_MANAGER</option>
                <option>FACILITY_MANAGER</option>
                <option>TECHNICIAN</option>
                <option>SECURITY_OPERATOR</option>
                <option>RESIDENT</option>
                <option>AUDITOR</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-main mb-1.5">Organisation Scope</label>
              <input type="text" defaultValue="Apex Commercial Properties" className="w-full h-10 px-3 border border-card-border rounded-lg bg-page text-muted" readOnly />
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddUserModalOpen(false)}>Send Activation Invite</Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Permissions Modal */}
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={editingUser ? `Edit Permissions: ${editingUser.name}` : 'Edit User Permissions'}
          subtitle="Modify RBAC scope, assign new operational privileges, or adjust account status"
        >
          {editingUser && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-main mb-1.5">Assigned Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ORGANISATION_ADMIN">ORGANISATION_ADMIN</option>
                  <option value="BUILDING_MANAGER">BUILDING_MANAGER</option>
                  <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
                  <option value="SECURITY_OPERATOR">SECURITY_OPERATOR</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="RESIDENT">RESIDENT</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-main mb-1.5">Account Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                  className="w-full h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button
                  onClick={() => {
                    setUsers((prev) =>
                      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
                    );
                    setBannerMsg(`Permissions and role updated for ${editingUser.name}.`);
                    setEditingUser(null);
                    setTimeout(() => setBannerMsg(null), 5000);
                  }}
                >
                  Save Permissions
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

