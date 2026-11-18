'use client';

import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Key,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function GatewaysManagementPage() {
  const [isPinging, setIsPinging] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [gateways, setGateways] = useState([
    {
      id: 'GW-ELV-A-01',
      elevator: 'ELV-A-01 (Apex Car 1)',
      org: 'Apex Commercial Properties',
      ip: '192.168.10.101',
      mac: '00:1B:44:11:3A:B7',
      firmware: 'gw-rtos-v2.2.0',
      ping: '38ms',
      status: 'ONLINE',
      tlsCertExpiry: '284 days',
      lastHeartbeat: '3s ago',
    },
    {
      id: 'GW-ELV-A-02',
      elevator: 'ELV-A-02 (Apex Car 2)',
      org: 'Apex Commercial Properties',
      ip: '192.168.10.102',
      mac: '00:1B:44:11:3A:B8',
      firmware: 'gw-rtos-v2.2.0',
      ping: '41ms',
      status: 'ONLINE',
      tlsCertExpiry: '284 days',
      lastHeartbeat: '2s ago',
    },
    {
      id: 'GW-ELV-A-03',
      elevator: 'ELV-A-03 (Apex Car 3)',
      org: 'Apex Commercial Properties',
      ip: '192.168.10.103',
      mac: '00:1B:44:11:3A:B9',
      firmware: 'gw-rtos-v2.2.0',
      ping: '45ms',
      status: 'ONLINE',
      tlsCertExpiry: '284 days',
      lastHeartbeat: '1s ago',
    },
    {
      id: 'GW-ELV-A-04',
      elevator: 'ELV-A-04 (Apex Car 4)',
      org: 'Apex Commercial Properties',
      ip: '192.168.10.104',
      mac: '00:1B:44:11:3A:BA',
      firmware: 'gw-rtos-v2.2.0',
      ping: '39ms',
      status: 'ONLINE',
      tlsCertExpiry: '284 days',
      lastHeartbeat: '4s ago',
    },
  ]);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setGateways((prev) =>
        prev.map((g) => ({
          ...g,
          ping: `${Math.floor(32 + Math.random() * 15)}ms`,
          lastHeartbeat: '1s ago',
        }))
      );
      setIsPinging(false);
      setSuccessBanner('Ping broadcast sent: All 28 IoT gateways responded over MQTT TLS within 42ms.');
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 700);
  };

  const handleRotateKey = (gwId: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === gwId ? { ...g, tlsCertExpiry: '365 days' } : g))
    );
    setSuccessBanner(`x.509 TLS certificate renewed and deployed to gateway ${gwId}.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Infrastructure & Edge' }, { label: 'Gateway Registry' }]}
      title="Global Edge IoT Gateway Registry"
      subtitle="Hardware device identity, mutual TLS certificates, EMQX broker latency and heartbeat watchdog"
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className={`h-4 w-4 ${isPinging ? 'animate-spin' : ''}`} />}
          onClick={handlePingAll}
          disabled={isPinging}
        >
          {isPinging ? 'Pinging Fleet...' : 'Ping All Gateways'}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">Fleet Connectivity</span>
          <div className="text-2xl font-bold text-st-running font-mono mt-1">100% ONLINE</div>
          <span className="text-[11px] text-muted block mt-1">28 of 28 Gateways connected</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">Average Ingestion Latency</span>
          <div className="text-2xl font-bold text-main font-mono mt-1">40.8 ms</div>
          <span className="text-[11px] text-st-running block mt-1">Well below 2000ms SLA target</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">TLS Client Certificates</span>
          <div className="text-2xl font-bold text-main font-mono mt-1">Valid (x.509)</div>
          <span className="text-[11px] text-muted block mt-1">Zero certificates expired</span>
        </Card>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[880px]">
            <thead className="bg-page/60 border-b border-card-border text-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-sans">Gateway Device ID</th>
                <th className="py-3 px-4 font-sans">Elevator Mapping</th>
                <th className="py-3 px-4 font-sans">Local IP Address</th>
                <th className="py-3 px-4 font-sans">Firmware RTOS</th>
                <th className="py-3 px-4 font-sans">MQTT Ping</th>
                <th className="py-3 px-4 font-sans">TLS Cert</th>
                <th className="py-3 px-4 font-sans">Health Status</th>
                <th className="py-3 px-4 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA]">
              {gateways.map((gw) => (
                <tr key={gw.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#433690]">{gw.id}</td>
                  <td className="px-4 text-[#1E2232] font-sans font-semibold">{gw.elevator}</td>
                  <td className="px-4 text-[#5D6375]">{gw.ip}</td>
                  <td className="px-4 text-[#5D6375]">{gw.firmware}</td>
                  <td className="px-4 text-[#15804D] font-bold">{gw.ping}</td>
                  <td className="px-4 text-[#5D6375] text-[11px]">{gw.tlsCertExpiry}</td>
                  <td className="px-4">
                    <StatusBadge status="ONLINE" />
                  </td>
                  <td className="px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Key className="h-3 w-3" />}
                      onClick={() => handleRotateKey(gw.id)}
                    >
                      Rotate Key
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
