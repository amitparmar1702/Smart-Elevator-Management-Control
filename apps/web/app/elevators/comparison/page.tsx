'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpDown, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Building2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ElevatorRow {
  id: string;
  code: string;
  building: string;
  availability: number;
  downtimeHours: number;
  faultsCount: number;
  doorObstructions: number;
  healthScore: number;
  lastService: string;
  status: string;
}

export default function FleetComparisonPage() {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof ElevatorRow>('healthScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fleetData: ElevatorRow[] = [
    {
      id: 'elv-a-03',
      code: 'ELV-A-03 (Freight / Service)',
      building: 'Apex Tower A',
      availability: 97.4,
      downtimeHours: 18.6,
      faultsCount: 6,
      doorObstructions: 14,
      healthScore: 78,
      lastService: '12 Oct 2026',
      status: 'Warning',
    },
    {
      id: 'elv-b-02',
      code: 'ELV-B-02 (Low-Rise North)',
      building: 'Apex Tower B',
      availability: 98.1,
      downtimeHours: 13.5,
      faultsCount: 4,
      doorObstructions: 9,
      healthScore: 82,
      lastService: '18 Oct 2026',
      status: 'Warning',
    },
    {
      id: 'elv-a-01',
      code: 'ELV-A-01 (High-Speed North)',
      building: 'Apex Tower A',
      availability: 99.4,
      downtimeHours: 4.2,
      faultsCount: 2,
      doorObstructions: 4,
      healthScore: 92,
      lastService: '28 Oct 2026',
      status: 'Running',
    },
    {
      id: 'elv-a-02',
      code: 'ELV-A-02 (Standard Passenger)',
      building: 'Apex Tower A',
      availability: 99.8,
      downtimeHours: 1.4,
      faultsCount: 1,
      doorObstructions: 2,
      healthScore: 96,
      lastService: '02 Nov 2026',
      status: 'Healthy',
    },
    {
      id: 'elv-a-04',
      code: 'ELV-A-04 (Emergency & Fire)',
      building: 'Apex Tower A',
      availability: 99.9,
      downtimeHours: 0.8,
      faultsCount: 0,
      doorObstructions: 1,
      healthScore: 98,
      lastService: '05 Nov 2026',
      status: 'Healthy',
    },
    {
      id: 'elv-b-01',
      code: 'ELV-B-01 (Passenger Shuttle)',
      building: 'Apex Tower B',
      availability: 99.6,
      downtimeHours: 2.9,
      faultsCount: 1,
      doorObstructions: 3,
      healthScore: 94,
      lastService: '01 Nov 2026',
      status: 'Running',
    },
  ];

  // Needs attention: 3 lowest health score elevators
  const needsAttention = [...fleetData]
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 3);

  const handleSort = (field: keyof ElevatorRow) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = [...fleetData].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return sortOrder === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Fleet Management' }, { label: 'Fleet Comparison' }]}
      title="Fleet Comparison & Performance Benchmark"
      subtitle="Comparative uptime, health score ranking, and critical maintenance priorities"
      actions={
        <div className="flex space-x-2">
          <Link href="/analytics/fleet">
            <Button variant="outline" size="sm">
              Fleet analytics
            </Button>
          </Link>
        </div>
      }
    >
      {/* Needs Attention Header Section (Worst 3 elevators) */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-[#9C5C00]" />
          <h2 className="text-sm font-bold text-[#1E2232] uppercase tracking-wider">
            Needs attention (priority maintenance)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {needsAttention.map((elv) => (
            <div
              key={elv.id}
              onClick={() => router.push(`/elevators/${elv.id}/live`)}
              className="cursor-pointer bg-white border-2 border-[#9C5C00]/30 hover:border-[#433690] rounded-[8px] p-4 shadow-card transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDFEA]">
                <span className="font-mono font-bold text-xs text-[#433690]">
                  {elv.code}
                </span>
                <StatusBadge status={elv.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-[#EEF0F6] p-2 rounded-[6px]">
                  <span className="text-[10px] text-[#5D6375] uppercase block">
                    Health score
                  </span>
                  <span className="text-lg font-bold font-mono text-[#C92D29]">
                    {elv.healthScore} / 100
                  </span>
                </div>
                <div className="bg-[#EEF0F6] p-2 rounded-[6px]">
                  <span className="text-[10px] text-[#5D6375] uppercase block">
                    Availability
                  </span>
                  <span className="text-lg font-bold font-mono text-[#1E2232]">
                    {elv.availability}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#5D6375] space-y-1">
                <div>Faults this month: <strong className="text-[#C92D29]">{elv.faultsCount}</strong></div>
                <div>Door obstructions: <strong className="text-[#9C5C00]">{elv.doorObstructions}</strong></div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#DCDFEA] flex items-center justify-between text-xs text-[#433690] font-medium">
                <span>Open dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sortable Fleet Comparison Table */}
      <Card title="All fleet elevator performance ranking">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase">
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#433690]"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Elevator & building</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#433690]"
                  onClick={() => handleSort('healthScore')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Health score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#433690]"
                  onClick={() => handleSort('availability')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Availability</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#433690]"
                  onClick={() => handleSort('downtimeHours')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Downtime</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#433690]"
                  onClick={() => handleSort('faultsCount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Faults</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#433690]"
                  onClick={() => handleSort('doorObstructions')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Door obstructions</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Last service</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA]">
              {sortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/elevators/${row.id}/live`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-[#433690]">
                      {row.code}
                    </div>
                    <div className="text-[11px] text-[#5D6375]">{row.building}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span
                      className={
                        row.healthScore < 85
                          ? 'text-[#C92D29]'
                          : row.healthScore < 95
                          ? 'text-[#9C5C00]'
                          : 'text-[#15804D]'
                      }
                    >
                      {row.healthScore} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#1E2232]">
                    {row.availability}%
                  </td>
                  <td className="py-3 px-3 font-mono text-[#5D6375]">
                    {row.downtimeHours} hrs
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#C92D29]">
                    {row.faultsCount}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#9C5C00]">
                    {row.doorObstructions}
                  </td>
                  <td className="py-3 px-3 text-[#5D6375]">
                    {row.lastService}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={row.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/elevators/${row.id}/live`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#433690] hover:underline font-medium text-xs inline-flex items-center space-x-1"
                    >
                      <span>Dashboard</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
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
