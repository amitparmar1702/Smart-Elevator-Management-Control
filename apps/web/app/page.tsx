'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Activity, 
  ArrowRight, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowUp, 
  Minus, 
  Sparkles, 
  Compass 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TelemetryGaugeCluster } from '@/components/ui/TelemetryGaugeCluster';
import { MultiShaftFleetVisualizer } from '@/components/shaft/MultiShaftFleetVisualizer';
import { GroupDispatchKiosk } from '@/components/dispatch/GroupDispatchKiosk';

export default function HomePage() {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'SHAFTS' | 'DISPATCH' | 'INVENTORY'>('SHAFTS');

  const fleetCars = [
    { id: 'elv-a-01', code: 'ELV-A-01', name: 'Car 1 (High-Speed Passenger)', floor: 4, dir: 'UP', load: 34, status: 'RUNNING', mfr: 'KONE' },
    { id: 'elv-a-02', code: 'ELV-A-02', name: 'Car 2 (Standard Passenger)', floor: 1, dir: 'STATIONARY', load: 12, status: 'IDLE', mfr: 'Otis' },
    { id: 'elv-a-03', code: 'ELV-A-03', name: 'Car 3 (Freight & Service)', floor: 8, dir: 'STATIONARY', load: 68, status: 'RUNNING', mfr: 'Schindler' },
    { id: 'elv-a-04', code: 'ELV-A-04', name: 'Car 4 (Fire & Emergency)', floor: 1, dir: 'STATIONARY', load: 0, status: 'IDLE', mfr: 'TK Elevator' },
  ];

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

        {/* 3. INDUSTRIAL TELEMETRY & STATUTORY SYSTEM HEALTH STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] shadow-xs flex items-center space-x-3">
            <div className="h-8 w-8 rounded-[6px] bg-[#DCEFE4] text-[#15804D] flex items-center justify-center flex-shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-[#5D6375] font-semibold">IoT Edge Link</div>
              <div className="text-xs font-bold text-[#1E2232] truncate">EMQX MQTT 5.0 (TLS 1.3)</div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] shadow-xs flex items-center space-x-3">
            <div className="h-8 w-8 rounded-[6px] bg-[#DCEFE4] text-[#15804D] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-[#5D6375] font-semibold">Safety Circuit</div>
              <div className="text-xs font-bold text-[#1E2232] truncate">100% Interlocked (EN 81-20)</div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] shadow-xs flex items-center space-x-3">
            <div className="h-8 w-8 rounded-[6px] bg-[#E6E3F7] text-[#433690] flex items-center justify-center flex-shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-[#5D6375] font-semibold">Ride Quality</div>
              <div className="text-xs font-bold text-[#1E2232] truncate">ISO 18738 Class A (0.042 m/s²)</div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] shadow-xs flex items-center space-x-3">
            <div className="h-8 w-8 rounded-[6px] bg-[#DCEFE4] text-[#15804D] flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-[#5D6375] font-semibold">Microgrid Offset</div>
              <div className="text-xs font-bold text-[#1E2232] truncate">+148.5 kWh Regenerated</div>
            </div>
          </div>
        </div>

        {/* 4. STATUTORY MANDATE FOOTNOTE */}
        <div className="p-3 rounded-[8px] bg-white border border-[#DCDFEA] flex items-center justify-between text-[11px] text-[#5D6375] shadow-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-[#15804D] flex-shrink-0" />
            <span><strong>EN 81-20/50 & IS 17900 Compliant:</strong> Cloud commands execute through 12-state verified telemetry lifecycle.</span>
          </div>
          <Link href="/audit/logs" className="text-[#433690] hover:underline font-semibold flex-shrink-0 hidden sm:inline">
            View Compliance Trail &rarr;
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
