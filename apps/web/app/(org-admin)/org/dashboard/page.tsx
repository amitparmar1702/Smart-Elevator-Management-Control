'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Activity, 
  Calendar, 
  Wrench, 
  ArrowRight, 
  Cpu 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPIStatCard } from '@/components/ui/KPIStatCard';

export default function OrgAdminDashboard() {
  const fleetKpis = [
    { title: 'Fleet Elevators', value: 4, unit: 'units', period: 'active fleet', delta: 0, deltaPeriod: 'vs last month', upIsGood: true },
    { title: 'Running in Motion', value: 2, unit: 'cars', period: 'peak hour', delta: 1, deltaPeriod: 'vs 1 hr ago', upIsGood: true },
    { title: 'Idle on Standby', value: 2, unit: 'cars', period: 'floor ready', delta: -1, deltaPeriod: 'vs 1 hr ago', upIsGood: true },
    { title: 'Fleet Availability', value: '99.85', unit: '%', period: 'last 30 days', delta: 0.35, deltaPeriod: 'vs target', upIsGood: true },
  ];

  const elevators = [
    { id: 'elv-a-01', code: 'ELV-A-01', name: 'Car 1 (High-Speed)', status: 'RUNNING', floor: 8, dir: 'UP', load: 45, mfr: 'KONE' },
    { id: 'elv-a-02', code: 'ELV-A-02', name: 'Car 2 (Standard)', status: 'IDLE', floor: 1, dir: 'STATIONARY', load: 0, mfr: 'Otis' },
    { id: 'elv-a-03', code: 'ELV-A-03', name: 'Car 3 (Freight / Service)', status: 'RUNNING', floor: 3, dir: 'DOWN', load: 68, mfr: 'Schindler' },
    { id: 'elv-a-04', code: 'ELV-A-04', name: 'Car 4 (Fire / Emergency)', status: 'IDLE', floor: 1, dir: 'STATIONARY', load: 0, mfr: 'TK Elevator' },
  ];

  const upcomingWorkOrders = [
    { id: 'WO-1092', elv: 'ELV-A-01', type: 'PREVENTIVE', priority: 'MEDIUM', dueDate: 'Tomorrow', tech: 'Arjun Rao' },
    { id: 'WO-1094', elv: 'ELV-A-03', type: 'INSPECTION', priority: 'LOW', dueDate: '12 Nov 2026', tech: 'Vikram Singh' },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Apex Commercial Properties' }, { label: 'Portfolio Dashboard' }]}
      title="Apex Portfolio Fleet Operations"
      subtitle="Comprehensive real-time telemetry, availability metrics, and service operations"
      actions={
        <div className="flex space-x-2">
          <Link href="/elevators/elv-a-01/live">
            <Button variant="primary" size="sm" icon={<Activity className="h-4 w-4" />}>
              Open live shaft visualizer
            </Button>
          </Link>
        </div>
      }
    >
      {/* Fleet KPI Readout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {fleetKpis.map((kpi) => (
          <KPIStatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            period={kpi.period}
            delta={kpi.delta}
            deltaPeriod={kpi.deltaPeriod}
            upIsGood={kpi.upIsGood}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Fleet Table */}
        <div className="lg:col-span-8">
          <Card
            title="Assigned Elevator Inventory (Live Status)"
            action={
              <Link href="/org/elevators" className="text-xs text-[#433690] hover:underline flex items-center space-x-1 font-medium">
                <span>View full inventory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Asset code</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Current floor</th>
                    <th className="py-2.5 px-3">Load</th>
                    <th className="py-2.5 px-3">OEM model</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDFEA]">
                  {elevators.map((elv) => (
                    <tr key={elv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#433690]">{elv.code}</td>
                      <td className="py-3 px-3 font-medium text-[#1E2232]">{elv.name}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={elv.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#1E2232]">
                        Floor {elv.floor} <span className="text-[10px] text-[#5D6375]">({elv.dir})</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#1E2232]">{elv.load}%</td>
                      <td className="py-3 px-3 text-[#5D6375] font-medium">{elv.mfr}</td>
                      <td className="py-3 px-3 text-right">
                        <Link href={`/elevators/${elv.id}/live`}>
                          <Button variant="outline" size="sm">Monitor</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Maintenance & Bookings Mini Widgets */}
        <div className="lg:col-span-4 space-y-5">
          <Card title="Upcoming Maintenance Work Orders">
            <div className="space-y-2.5">
              {upcomingWorkOrders.map((wo) => (
                <div key={wo.id} className="p-3 rounded-[6px] bg-[#EEF0F6]/50 border border-[#DCDFEA] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[#433690]">{wo.id}</span>
                    <span className="text-[10px] text-[#5D6375]">Due: {wo.dueDate}</span>
                  </div>
                  <div className="text-[#1E2232] font-medium">{wo.elv} - {wo.type}</div>
                  <div className="text-[11px] text-[#5D6375] mt-1">Technician: {wo.tech}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Active Service Elevator Bookings">
            <div className="text-xs space-y-2">
              <div className="p-3 rounded-[6px] bg-[#F6E9D2] border border-[#9C5C00]/30 text-[#9C5C00]">
                <div className="font-medium flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Furniture Delivery Reserved</span>
                </div>
                <div className="text-[11px] mt-1">Car 3 (Freight) | 14:00 - 16:30 | Resident: Apt 1204</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
