'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Building2, 
  Cpu, 
  Radio, 
  CheckCircle2 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function SuperAdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('ENTERPRISE');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const kpis = [
    { label: 'Registered Organisations', value: '3', change: '+1 this month', icon: Building2 },
    { label: 'Active Facilities', value: '8', change: 'Across 3 metros', icon: Layers },
    { label: 'Monitored Elevators', value: '28', change: '100% online telemetry', icon: Cpu },
    { label: 'Connected IoT Gateways', value: '28 / 28', change: 'Avg ping: 42ms', icon: Radio },
  ];

  const [tenants, setTenants] = useState([
    { name: 'Apex Commercial Properties', slug: 'apex-commercial', plan: 'ENTERPRISE', buildings: 4, elevators: 16, status: 'ACTIVE' },
    { name: 'Skyline Luxury Residences', slug: 'skyline-residences', plan: 'PROFESSIONAL', buildings: 2, elevators: 6, status: 'ACTIVE' },
    { name: 'Metro Healthcare Network', slug: 'metro-health', plan: 'ENTERPRISE', buildings: 2, elevators: 6, status: 'ACTIVE' },
  ]);

  const platformAlerts = [
    { id: 1, type: 'GATEWAY_FIRMWARE', desc: 'OTA firmware v2.2.1 available for Advantech Edge gateways', time: '10m ago', level: 'INFO' },
    { id: 2, type: 'SUBSCRIPTION_RENEWAL', desc: 'Skyline Residences tier renewed for 12 months', time: '2h ago', level: 'SUCCESS' },
    { id: 3, type: 'BACKUP_COMPLETED', desc: 'Encrypted daily PostgreSQL WAL snapshot verified', time: '4h ago', level: 'INFO' },
  ];

  const handleProvisionOrg = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newOrgName.toLowerCase().replace(/\s+/g, '-');
    const newTenant = {
      name: newOrgName,
      slug,
      plan: newOrgPlan,
      buildings: 1,
      elevators: 2,
      status: 'ACTIVE',
    };
    setTenants([...tenants, newTenant]);
    setIsModalOpen(false);
    setNewOrgName('');
    setSuccessBanner(`Tenant organization ${newTenant.name} provisioned with ${newOrgPlan} tier.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Platform Administration' }, { label: 'Global Overview' }]}
      title="Platform Operations Center"
      subtitle="Cross-tenant infrastructure health, subscription limits, and fleet gateway network"
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Building2 className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
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

      {/* 4-Column KPI Readout Card */}
      <Card className="mb-6 p-4 md:p-5" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DCDFEA]">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="p-4 md:p-5 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
                    {kpi.label}
                  </span>
                  <div className="text-2xl md:text-3xl font-bold font-mono text-[#1E2232] mt-1">
                    {kpi.value}
                  </div>
                  <span className="text-[10px] text-[#15804D] font-medium mt-1 block">
                    {kpi.change}
                  </span>
                </div>
                <div className="p-2.5 rounded-[6px] bg-[#EEF0F6] text-[#433690]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tenants Table */}
        <div className="lg:col-span-8">
          <Card title="Active Customer Tenants & Subscriptions">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Organisation</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Buildings</th>
                    <th className="py-2.5 px-3">Elevators</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDFEA]">
                  {tenants.map((t) => (
                    <tr key={t.slug} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#1E2232]">{t.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#E6E3F7] text-[#433690] font-mono font-semibold text-[10px]">
                          {t.plan}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#5D6375]">{t.buildings} Properties</td>
                      <td className="py-3 px-3 font-mono text-[#5D6375]">{t.elevators} Cars</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center space-x-1 text-[#15804D] font-medium text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>● Active</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link href="/admin/organisations">
                          <Button variant="outline" size="sm">Manage</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Platform Events & Health */}
        <div className="lg:col-span-4 space-y-5">
          <Card title="Infrastructure Health">
            <div className="space-y-3 text-xs divide-y divide-[#DCDFEA]">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[#5D6375]">EMQX MQTT 5.0 Cluster</span>
                <span className="text-[#15804D] font-mono font-bold">100% HEALTHY</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#5D6375]">TimescaleDB Telemetry</span>
                <span className="text-[#15804D] font-mono font-bold">4.8M chunks / day</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[#5D6375]">Redis BullMQ Command Queue</span>
                <span className="text-[#15804D] font-mono font-bold">0 Dead Letters</span>
              </div>
            </div>
          </Card>

          <Card title="System Activity Logs">
            <div className="space-y-2 text-xs font-mono">
              {platformAlerts.map((a) => (
                <div key={a.id} className="p-2.5 rounded-[6px] bg-[#EEF0F6]/60 border border-[#DCDFEA]">
                  <div className="flex justify-between items-center text-[10px] text-[#5D6375] mb-1">
                    <span className="font-bold text-[#433690]">{a.type}</span>
                    <span>{a.time}</span>
                  </div>
                  <div className="text-[#5D6375] text-[11px] font-sans">{a.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Provision Organisation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Customer Tenant Organisation"
        subtitle="Initialize isolated database partition, tenant administrator credentials, and SLA contract tier"
      >
        <form onSubmit={handleProvisionOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Organisation Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Prestige Estates Real Estate Ltd."
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Subscription License Tier</label>
            <select
              value={newOrgPlan}
              onChange={(e) => setNewOrgPlan(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="STARTER">Starter Tier (1 Building, up to 4 Cars)</option>
              <option value="PROFESSIONAL">Professional Tier (Up to 5 Buildings, 20 Cars)</option>
              <option value="ENTERPRISE">Enterprise Tier (Unlimited Buildings, Custom SLA, Predictive AI)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Provision Organisation
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
