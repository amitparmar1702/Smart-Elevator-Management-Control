'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Activity, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Users, 
  HardHat, 
  PhoneCall, 
  Sliders,
  ShieldCheck,
  Zap,
  ArrowUp,
  Minus,
  Sparkles,
  Compass
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@elevateos/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TelemetryGaugeCluster } from '@/components/ui/TelemetryGaugeCluster';
import { MultiShaftFleetVisualizer } from '@/components/shaft/MultiShaftFleetVisualizer';
import { GroupDispatchKiosk } from '@/components/dispatch/GroupDispatchKiosk';

export default function HomePage() {
  const router = useRouter();
  const { switchRole } = useAuthStore();
  const [activeConsoleTab, setActiveConsoleTab] = useState<'SHAFTS' | 'DISPATCH' | 'INVENTORY'>('SHAFTS');

  const fleetCars = [
    { id: 'elv-a-01', code: 'ELV-A-01', name: 'Car 1 (High-Speed Passenger)', floor: 4, dir: 'UP', load: 34, status: 'RUNNING', mfr: 'KONE' },
    { id: 'elv-a-02', code: 'ELV-A-02', name: 'Car 2 (Standard Passenger)', floor: 1, dir: 'STATIONARY', load: 12, status: 'IDLE', mfr: 'Otis' },
    { id: 'elv-a-03', code: 'ELV-A-03', name: 'Car 3 (Freight & Service)', floor: 8, dir: 'STATIONARY', load: 68, status: 'RUNNING', mfr: 'Schindler' },
    { id: 'elv-a-04', code: 'ELV-A-04', name: 'Car 4 (Fire & Emergency)', floor: 1, dir: 'STATIONARY', load: 0, status: 'IDLE', mfr: 'TK Elevator' },
  ];

  const primaryWorkspaces = [
    {
      title: 'Digital Twin & Blackbox Replay',
      description: 'Single-car telemetry cockpit, historical blackbox scrubber, and multi-angle CCTV feeds.',
      icon: Activity,
      href: '/elevators/elv-a-01/live',
      badge: 'Cockpit',
      role: 'ORGANISATION_ADMIN' as UserRole,
    },
    {
      title: 'Control Room Surveillance Grid',
      description: 'Continuous 4-car live monitoring grid, alarm detection, and emergency coordination.',
      icon: ShieldAlert,
      href: '/control-room/grid',
      badge: 'Real-Time',
      role: 'SECURITY_OPERATOR' as UserRole,
    },
    {
      title: 'Field Technician & Work Orders',
      description: 'IS 17900 inspection signoff, QR code placard generator, motor diagnostics, and offline sync.',
      icon: HardHat,
      href: '/technician/mobile',
      badge: 'Maintenance',
      role: 'TECHNICIAN' as UserRole,
    },
    {
      title: 'Active Safety Alarms Console',
      description: 'Audited 3-state alarm lifecycle management with 1-click work order creation.',
      icon: ShieldCheck,
      href: '/safety/alarms',
      badge: 'Safety',
      role: 'SECURITY_OPERATOR' as UserRole,
    },
    {
      title: 'Predictive Health AI & FFT',
      description: 'Motor vibration harmonics, component wear RUL estimation, and anomaly detection.',
      icon: Cpu,
      href: '/analytics/predictive',
      badge: 'AI Diagnostic',
      role: 'ORGANISATION_ADMIN' as UserRole,
    },
    {
      title: 'Regenerative Grid & Parking Eco',
      description: 'ISO 50001 regenerative power telemetry, building base load offset, and eco-parking.',
      icon: Zap,
      href: '/operations/parking',
      badge: 'Energy',
      role: 'FACILITY_MANAGER' as UserRole,
    },
  ];

  const quickTools = [
    { label: 'Resident Portal', href: '/resident/dashboard', icon: PhoneCall, role: 'RESIDENT' as UserRole },
    { label: 'Statutory Reports', href: '/reports', icon: FileText, role: 'AUDITOR' as UserRole },
    { label: 'Compliance Audit Trail', href: '/audit/logs', icon: Sliders, role: 'AUDITOR' as UserRole },
    { label: 'Emergency Intercom', href: '/safety/incidents', icon: ShieldAlert, role: 'EMERGENCY_OPERATOR' as UserRole },
    { label: 'Fleet Compare', href: '/elevators/comparison', icon: Layers, role: 'ORGANISATION_ADMIN' as UserRole },
    { label: 'Platform Super Admin', href: '/admin/dashboard', icon: Users, role: 'SUPER_ADMIN' as UserRole },
  ];

  const handleLaunch = (href: string, role: UserRole) => {
    switchRole(role);
    router.push(href);
  };

  return (
    <DashboardLayout
      title="Fleet Operations Command Workstation"
      subtitle="Enterprise Smart Elevator Monitoring, Live Multi-Shaft Kinematics & Dispatch Cockpit"
      actions={
        <div className="flex items-center space-x-2">
          <Link
            href="/elevators/comparison"
            className="text-xs bg-white border border-[#DCDFEA] hover:bg-slate-50 text-[#1E2232] font-semibold px-3 py-1.5 rounded-[6px] transition-colors shadow-xs"
          >
            Compare Fleet
          </Link>
          <Link
            href="/elevators/elv-a-01/live"
            className="text-xs bg-[#433690] hover:bg-[#352A75] text-white font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Launch Live Digital Twin</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 1. REAL-TIME TELEMETRY HUD GAUGE CLUSTER (Zero-overlap semi-circular dials) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold font-mono uppercase text-[#433690] tracking-wider flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#15804D] inline-block animate-ping"></span>
              <span>Real-Time Fleet Dynamics & Telemetry HUD</span>
            </h2>
            <span className="text-[11px] font-mono text-[#5D6375]">
              EMQX MQTT 5.0 (TLS 1.3) &middot; 12ms Latency
            </span>
          </div>
          <TelemetryGaugeCluster
            velocity={2.25}
            direction="UP"
            powerKw={-14.8}
            vibrationRms={0.042}
            availabilityPct={99.85}
            safetyChainClosed={true}
          />
        </div>

        {/* 2. CORE OPERATIONS DECK SWITCHER (Eliminates vertical clutter / over-content) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCDFEA] pb-2">
            <div className="flex items-center space-x-1 bg-[#EEF0F6] p-1 rounded-[8px] border border-[#DCDFEA] text-xs font-mono">
              <button
                onClick={() => setActiveConsoleTab('SHAFTS')}
                className={`px-3 py-1.5 rounded-[6px] font-bold transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'SHAFTS'
                    ? 'bg-white text-[#433690] shadow-xs'
                    : 'text-[#5D6375] hover:text-[#1E2232]'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>4-Shaft Kinematic Matrix</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab('DISPATCH')}
                className={`px-3 py-1.5 rounded-[6px] font-bold transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'DISPATCH'
                    ? 'bg-white text-[#433690] shadow-xs'
                    : 'text-[#5D6375] hover:text-[#1E2232]'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>AI Destination Dispatch Kiosk</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab('INVENTORY')}
                className={`px-3 py-1.5 rounded-[6px] font-bold transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'INVENTORY'
                    ? 'bg-white text-[#433690] shadow-xs'
                    : 'text-[#5D6375] hover:text-[#1E2232]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Fleet Asset Inventory</span>
              </button>
            </div>

            <span className="text-[11px] text-[#5D6375] font-mono">
              Apex Financial Tower A &middot; Bank North (4 Cars Active)
            </span>
          </div>

          {/* TAB 1: 4-Shaft Kinematic Hoistway Matrix */}
          {activeConsoleTab === 'SHAFTS' && <MultiShaftFleetVisualizer />}

          {/* TAB 2: AI Destination Dispatch Kiosk Simulator */}
          {activeConsoleTab === 'DISPATCH' && <GroupDispatchKiosk />}

          {/* TAB 3: Fleet Asset Directory Table */}
          {activeConsoleTab === 'INVENTORY' && (
            <Card
              title="Assigned Fleet Asset Directory (Apex Financial Tower A)"
              action={
                <Link
                  href="/org/elevators"
                  className="text-xs text-[#433690] hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>View full fleet inventory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Asset Code</th>
                      <th className="py-2.5 px-3">Car Identification</th>
                      <th className="py-2.5 px-3">Current Level</th>
                      <th className="py-2.5 px-3">Kinematics</th>
                      <th className="py-2.5 px-3">Car Payload</th>
                      <th className="py-2.5 px-3">OEM Controller</th>
                      <th className="py-2.5 px-3">Operating State</th>
                      <th className="py-2.5 px-3 text-right">Cockpit View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCDFEA]">
                    {fleetCars.map((car) => (
                      <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#433690]">{car.code}</td>
                        <td className="py-3 px-3 font-medium text-[#1E2232]">{car.name}</td>
                        <td className="py-3 px-3 font-mono font-bold">Floor {car.floor}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#5D6375]">
                            {car.dir === 'UP' && <ArrowUp className="h-3.5 w-3.5 text-[#15804D]" />}
                            {car.dir === 'DOWN' && <ArrowUp className="h-3.5 w-3.5 text-[#15804D] rotate-180" />}
                            {car.dir === 'STATIONARY' && <Minus className="h-3.5 w-3.5 text-slate-400" />}
                            <span>{car.dir}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">{car.load}%</td>
                        <td className="py-3 px-3 font-mono text-[#5D6375]">{car.mfr}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={car.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/elevators/${car.id}/live`}>
                            <Button variant="outline" size="sm">Launch Cockpit</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* 3. PRIMARY ROLE WORKSPACES & MANAGEMENT HUBS */}
        <div>
          <div className="mb-2.5">
            <h3 className="text-sm font-bold text-[#433690] tracking-tight">
              Operational Command Hubs & Role Portals
            </h3>
            <p className="text-xs text-[#5D6375]">
              Dedicated workstations for real-time fleet operations, dispatch, field maintenance, and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {primaryWorkspaces.map((ws) => {
              const Icon = ws.icon;
              return (
                <div
                  key={ws.title}
                  onClick={() => handleLaunch(ws.href, ws.role)}
                  className="group cursor-pointer flex flex-col justify-between p-3.5 rounded-[10px] border border-[#DCDFEA] bg-white shadow-card hover:shadow-md hover:border-[#433690]/40 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-8 w-8 rounded-[6px] bg-[#E6E3F7] text-[#433690] flex items-center justify-center group-hover:bg-[#433690] group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EEF0F6] text-[#5D6375]">
                        {ws.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1E2232] group-hover:text-[#433690] transition-colors">
                      {ws.title}
                    </h4>
                    <p className="text-[11px] text-[#5D6375] mt-0.5 leading-relaxed">
                      {ws.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#DCDFEA] flex items-center justify-between text-[11px] font-medium text-[#5D6375] group-hover:text-[#433690]">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{ws.role}</span>
                    <div className="flex items-center space-x-1 font-semibold">
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. SPECIALIZED QUICK-LAUNCH TOOLKIT */}
        <Card title="Quick-Access Specialized Modules">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.label}
                  onClick={() => handleLaunch(tool.href, tool.role)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-[6px] border border-[#DCDFEA] bg-[#EEF0F6]/50 hover:bg-[#E6E3F7] hover:border-[#433690]/30 transition-colors text-center group"
                >
                  <Icon className="h-3.5 w-3.5 text-[#433690] mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-[#1E2232] group-hover:text-[#433690]">
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 5. STATUTORY SAFETY & COMPLIANCE DIRECTIVE */}
        <div className="p-3.5 rounded-[8px] bg-white border border-[#DCDFEA] flex items-start space-x-3 shadow-xs">
          <ShieldCheck className="h-4 w-4 text-[#15804D] mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-[#5D6375] leading-relaxed">
            <span className="font-bold text-[#1E2232]">STATUTORY SAFETY & COMPLIANCE MANDATE:</span> ElevateOS strictly complies with EN 81-20/50 and IS 17900 international elevator standards. Remote operations require multi-sensor state verification. Local elevator safety interlocks, overspeed governors, and machine-room lockouts operate with 100% fail-safe autonomous priority.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
