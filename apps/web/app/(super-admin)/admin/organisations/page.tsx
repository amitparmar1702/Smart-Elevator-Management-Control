'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Layers, 
  CheckCircle2, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function OrganisationsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orgs, setOrgs] = useState([
    {
      id: 'org-apex-01',
      name: 'Apex Commercial Properties',
      slug: 'apex-commercial',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      buildings: 4,
      elevators: 16,
      contact: 'operations@apexproperties.com',
    },
    {
      id: 'org-skyline-02',
      name: 'Skyline Luxury Residences',
      slug: 'skyline-residences',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      buildings: 2,
      elevators: 6,
      contact: 'management@skyline.org',
    },
    {
      id: 'org-metro-03',
      name: 'Metro Healthcare Network',
      slug: 'metro-health',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      buildings: 2,
      elevators: 6,
      contact: 'facilities@metrohealth.med',
    },
  ]);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [editingOrg, setEditingOrg] = useState<{ id: string; name: string; plan: string; contact: string } | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setOrgs((prev) =>
      prev.map((o) => (o.id === editingOrg.id ? { ...o, plan: editingOrg.plan, contact: editingOrg.contact } : o))
    );
    setSuccessBanner(`Tenant ${editingOrg.name} updated.`);
    setEditingOrg(null);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg = {
      id: 'org-' + Date.now().toString().slice(-4),
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      buildings: 1,
      elevators: 2,
      contact: formEmail,
    };
    setOrgs([...orgs, newOrg]);
    setIsModalOpen(false);
    setFormName('');
    setFormSlug('');
    setFormEmail('');
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Platform Administration' }, { label: 'Organisations' }]}
      title="Customer Organisations & Multi-Tenancy"
      subtitle="Provision tenant spaces, assign subscription quotas and manage enterprise contracts"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Provision Organisation
        </Button>
      }
    >
      {successBanner && (
        <div className="mb-4 p-3 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-[#15804D] hover:underline font-bold">Dismiss</button>
        </div>
      )}

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[880px]">
            <thead className="bg-page/60 border-b border-card-border text-muted font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Organisation Name</th>
                <th className="py-3 px-4">Slug Identifier</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Properties</th>
                <th className="py-3 px-4">Elevator Fleet</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-page/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-main">{org.name}</td>
                  <td className="px-4 font-mono text-muted">{org.slug}</td>
                  <td className="px-4">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-4 font-mono text-main">{org.buildings}</td>
                  <td className="px-4 font-mono font-bold text-main">{org.elevators} Cars</td>
                  <td className="px-4 text-muted font-mono text-[11px]">{org.contact}</td>
                  <td className="px-4">
                    <StatusBadge status="ACTIVE" />
                  </td>
                  <td className="px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrg(org)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Provision Organisation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Customer Tenant Organisation"
        subtitle="Creates an isolated tenant partition with dedicated database schema scoping"
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Organisation Name:
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Horizon Commercial Towers"
              className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Tenant Slug:
            </label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="e.g. horizon-commercial"
              className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1.5">
              Primary Administrator Email:
            </label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="admin@horizon.com"
              className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Provision Tenant
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit/Manage Organisation Modal */}
      <Modal
        isOpen={Boolean(editingOrg)}
        onClose={() => setEditingOrg(null)}
        title={editingOrg ? `Manage ${editingOrg.name}` : 'Manage Tenant'}
        subtitle="Update subscription tier, contact representative, or status"
      >
        {editingOrg && (
          <form onSubmit={handleUpdateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1.5">
                Subscription Plan:
              </label>
              <select
                value={editingOrg.plan}
                onChange={(e) => setEditingOrg({ ...editingOrg, plan: e.target.value })}
                className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="STARTER">STARTER</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1.5">
                Primary Contact Email:
              </label>
              <input
                type="email"
                value={editingOrg.contact}
                onChange={(e) => setEditingOrg({ ...editingOrg, contact: e.target.value })}
                className="w-full text-xs h-10 px-3 border border-card-border rounded-lg bg-page text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setEditingOrg(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
