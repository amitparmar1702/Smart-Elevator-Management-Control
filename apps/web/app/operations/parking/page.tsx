'use client';

import React, { useState } from 'react';
import { 
  Leaf, 
  Clock, 
  CheckCircle2, 
  Save, 
  Moon, 
  Zap,
  Activity,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeekStripDatePicker } from '@/components/ui/WeekStripDatePicker';

interface ParkingZonePolicy {
  id: string;
  name: string;
  timeWindow: string;
  description: string;
  activeCarsCount: number;
  standbyCarsCount: number;
  homeFloors: { elevator: string; returnFloor: number; delaySeconds: number }[];
  ecoStandbyTimeoutMinutes: number;
  cabinLightingAutoOffSeconds: number;
  regenDriveActive: boolean;
  status: 'ACTIVE' | 'SCHEDULED' | 'STANDBY';
}

export default function ParkingOptimizationPage() {
  const [savedNotification, setSavedNotification] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState('2026-11-20');

  // Default parking policies
  const [policies] = useState<ParkingZonePolicy[]>([
    {
      id: 'p-1',
      name: 'Morning Up-Peak (Lobby Return Priority)',
      timeWindow: '07:30 - 10:00 (Mon - Fri)',
      description: 'Dispatches idle cars back to Ground/Lobby floor within 15 seconds to minimize lobby queues.',
      activeCarsCount: 4,
      standbyCarsCount: 0,
      homeFloors: [
        { elevator: 'Car A1 (High-Speed)', returnFloor: 1, delaySeconds: 15 },
        { elevator: 'Car A2 (Standard)', returnFloor: 1, delaySeconds: 15 },
        { elevator: 'Car A3 (Freight)', returnFloor: 0, delaySeconds: 30 },
        { elevator: 'Car A4 (VIP / Service)', returnFloor: 1, delaySeconds: 20 },
      ],
      ecoStandbyTimeoutMinutes: 15,
      cabinLightingAutoOffSeconds: 120,
      regenDriveActive: true,
      status: 'SCHEDULED',
    },
    {
      id: 'p-2',
      name: 'Mid-Day Inter-Floor Balanced Dispersion',
      timeWindow: '10:00 - 16:30 (Mon - Fri)',
      description: 'Parks idle cars across High, Mid, and Low sectors to ensure uniform 15-second ETA across all floors.',
      activeCarsCount: 3,
      standbyCarsCount: 1,
      homeFloors: [
        { elevator: 'Car A1 (High-Speed)', returnFloor: 15, delaySeconds: 45 },
        { elevator: 'Car A2 (Standard)', returnFloor: 8, delaySeconds: 45 },
        { elevator: 'Car A3 (Freight)', returnFloor: -1, delaySeconds: 60 },
        { elevator: 'Car A4 (VIP / Service)', returnFloor: 1, delaySeconds: 45 },
      ],
      ecoStandbyTimeoutMinutes: 10,
      cabinLightingAutoOffSeconds: 60,
      regenDriveActive: true,
      status: 'ACTIVE',
    },
    {
      id: 'p-3',
      name: 'Evening Down-Peak (High-Rise Staging)',
      timeWindow: '16:30 - 19:30 (Mon - Fri)',
      description: 'Parks idle passenger cars on floors 15 & 20 ready for mass evening departures.',
      activeCarsCount: 4,
      standbyCarsCount: 0,
      homeFloors: [
        { elevator: 'Car A1 (High-Speed)', returnFloor: 18, delaySeconds: 20 },
        { elevator: 'Car A2 (Standard)', returnFloor: 12, delaySeconds: 20 },
        { elevator: 'Car A3 (Freight)', returnFloor: 10, delaySeconds: 30 },
        { elevator: 'Car A4 (VIP / Service)', returnFloor: 1, delaySeconds: 20 },
      ],
      ecoStandbyTimeoutMinutes: 15,
      cabinLightingAutoOffSeconds: 90,
      regenDriveActive: true,
      status: 'SCHEDULED',
    },
    {
      id: 'p-4',
      name: 'Night Eco-Standby & Sleep Mode',
      timeWindow: '21:00 - 06:00 Daily',
      description: 'Deactivates 3 hoistway drives, puts car cabins in zero-power sleep, parks 1 active car at Floor 1.',
      activeCarsCount: 1,
      standbyCarsCount: 3,
      homeFloors: [
        { elevator: 'Car A1 (High-Speed)', returnFloor: 1, delaySeconds: 60 },
        { elevator: 'Car A2 (Standard)', returnFloor: 1, delaySeconds: 120 },
        { elevator: 'Car A3 (Freight)', returnFloor: -2, delaySeconds: 120 },
        { elevator: 'Car A4 (VIP / Service)', returnFloor: 1, delaySeconds: 60 },
      ],
      ecoStandbyTimeoutMinutes: 3,
      cabinLightingAutoOffSeconds: 30,
      regenDriveActive: true,
      status: 'STANDBY',
    },
  ]);

  const handleApply = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Fleet Operations' }, { label: 'Parking & Energy Optimization' }]}
      title="Intelligent Parking & Energy Optimization"
      subtitle="Configure dynamic home-floor recall algorithms, sector dispersion, and regenerative braking sleep cycles"
      actions={
        <Button size="sm" onClick={handleApply} icon={<Save className="w-4 h-4" />}>
          Deploy Policies to Edge Gateways
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Saved Alert Banner */}
        {savedNotification && (
          <div className="p-3 bg-[#DCEFE4] text-[#15804D] border border-[#15804D]/30 rounded-[8px] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15804D]" />
            Parking configuration dispatched via MQTT 5.0 to local controller memory registers.
          </div>
        )}

        {/* 4 Energy KPI Summary Cards */}
        <Card noPadding>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DCDFEA]">
            <div className="p-4 md:p-5">
              <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
                Fleet Energy Efficiency
              </span>
              <div className="text-2xl font-bold font-mono text-[#15804D] mt-1">24.8% Saved</div>
              <span className="text-[10px] text-[#5D6375] block mt-1">vs unmanaged dispatch</span>
            </div>

            <div className="p-4 md:p-5">
              <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
                Regenerative Power
              </span>
              <div className="text-2xl font-bold font-mono text-[#433690] mt-1">148.5 kWh</div>
              <span className="text-[10px] text-[#5D6375] block mt-1">Fed back to building grid</span>
            </div>

            <div className="p-4 md:p-5">
              <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
                Average Peak ETA
              </span>
              <div className="text-2xl font-bold font-mono text-[#433690] mt-1">14.2s</div>
              <span className="text-[10px] text-[#15804D] block mt-1">-3.8s with sector parking</span>
            </div>

            <div className="p-4 md:p-5">
              <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
                Night Sleep Savings
              </span>
              <div className="text-2xl font-bold font-mono text-[#1E2232] mt-1">68% Standby</div>
              <span className="text-[10px] text-[#5D6375] block mt-1">Drives in low power</span>
            </div>
          </div>
        </Card>

        {/* Live Regenerative Energy Flow & Building Microgrid Card */}
        <Card title="Building Microgrid & Regenerative Braking Telemetry">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-[8px] bg-[#F4F2FC] border border-[#433690]/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#433690] font-bold block mb-1">
                  Active Hoistway Drive Generation
                </span>
                <div className="text-xl font-bold font-mono text-[#433690]">
                  18.4 kW &middot; Peak Regen
                </div>
                <p className="text-[11px] text-[#5D6375] mt-1">
                  Car 1 (down with 68% payload) driving motor as generator.
                </p>
              </div>
              <div className="mt-3 flex items-center space-x-1.5 text-xs text-[#15804D] font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#15804D] animate-ping inline-block"></span>
                <span>Active Bus Feed (415V AC 3-Phase)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#EEF0F6] border border-[#DCDFEA] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#5D6375] font-bold block mb-1">
                  HVAC & Lighting Offset Ratio
                </span>
                <div className="text-xl font-bold font-mono text-[#1E2232]">
                  12.6% Building Base
                </div>
                <p className="text-[11px] text-[#5D6375] mt-1">
                  Direct microgrid bus powering common area lighting & ventilation fans.
                </p>
              </div>
              <div className="mt-3 text-[11px] font-mono text-[#433690] font-medium">
                Net Cumulative Today: +148.5 kWh
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#DCEFE4]/60 border border-[#15804D]/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#15804D] font-bold block mb-1">
                  Statutory Carbon Credits Earned
                </span>
                <div className="text-xl font-bold font-mono text-[#15804D]">
                  1.84 Tons CO₂
                </div>
                <p className="text-[11px] text-[#5D6375] mt-1">
                  Certified ISO 50001 Energy Management standard compliance.
                </p>
              </div>
              <div className="mt-3 flex items-center space-x-1 text-xs text-[#15804D] font-semibold">
                <Leaf className="h-3.5 w-3.5 text-[#15804D]" />
                <span>Green Building Certified (IGBC Platinum)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Sector Parking Cards */}
        <div>
          {/* Week Calendar Profile Scheduler */}
          <div className="mb-5">
            <WeekStripDatePicker
              initialDate={selectedScheduleDate}
              onDateChange={(d) => setSelectedScheduleDate(d)}
            />
          </div>

          <h3 className="text-sm font-medium text-[#433690] uppercase tracking-wider mb-4">
            Automated Time-Window Parking Profiles
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {policies.map((policy) => (
              <Card
                key={policy.id}
                className={
                  policy.status === 'ACTIVE'
                    ? 'border-2 border-[#433690] shadow-card ring-1 ring-[#433690]/20'
                    : ''
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#1E2232] text-sm">{policy.name}</h4>
                      {policy.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#DCEFE4] text-[#15804D] rounded-full">
                          ● ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#433690] font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {policy.timeWindow}
                    </span>
                  </div>

                  <span className="text-xs font-mono bg-[#EEF0F6] text-[#5D6375] px-2.5 py-1 rounded-[6px] border border-[#DCDFEA]">
                    {policy.activeCarsCount} Active / {policy.standbyCarsCount} Standby
                  </span>
                </div>

                <p className="text-xs text-[#5D6375] mb-4 leading-relaxed">
                  {policy.description}
                </p>

                {/* Staging Table */}
                <div className="bg-[#EEF0F6]/60 rounded-[6px] p-3 mb-4 border border-[#DCDFEA]">
                  <span className="text-[11px] font-semibold text-[#5D6375] uppercase tracking-wider block mb-2">
                    Car Parking Positions & Recall Delay:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {policy.homeFloors.map((hf, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-medium text-[#1E2232]">{hf.elevator}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#1E2232] bg-white px-2 py-0.5 rounded-[4px] border border-[#DCDFEA]">
                            Park at Floor {hf.returnFloor > 0 ? `+${hf.returnFloor}` : hf.returnFloor}
                          </span>
                          <span className="text-[#5D6375] font-mono text-[11px]">
                            after {hf.delaySeconds}s idle
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eco Controls */}
                <div className="flex items-center justify-between text-xs text-[#5D6375] pt-2 border-t border-[#DCDFEA]">
                  <span>Drive Sleep: <strong>{policy.ecoStandbyTimeoutMinutes} mins</strong></span>
                  <span>Cabin Lights: <strong>{policy.cabinLightingAutoOffSeconds}s</strong></span>
                  <span className="text-[#15804D] font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Regen Active
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
