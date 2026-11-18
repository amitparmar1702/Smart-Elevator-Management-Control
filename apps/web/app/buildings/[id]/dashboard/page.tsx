'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { audioService } from '@/lib/audioService';

export default function BuildingManagerDashboard({ params }: { params?: { id: string } }) {
  const buildingId = params?.id || 'bldg-apex-tower';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [hostTenant, setHostTenant] = useState('Acme Corporation (Floor 12)');
  const [destFloor, setDestFloor] = useState(12);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const cars = [
    { id: 'elv-a-01', name: 'Car 1 (High-Speed)', status: 'RUNNING', floor: 8, load: 45 },
    { id: 'elv-a-02', name: 'Car 2 (Standard)', status: 'IDLE', floor: 1, load: 0 },
    { id: 'elv-a-03', name: 'Car 3 (Freight)', status: 'RUNNING', floor: 3, load: 68 },
    { id: 'elv-a-04', name: 'Car 4 (Fire / Emergency)', status: 'IDLE', floor: 1, load: 0 },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Assigned Properties' }, { label: 'Apex Financial Tower A' }]}
      title="Apex Financial Tower A Operations"
      subtitle="Dedicated building manager operations, elevator availability, tenant requests and visitor dispatch"
      actions={
        <Link href="/elevators/elv-a-01/live">
          <Button variant="primary" size="sm" icon={<Activity className="h-4 w-4" />}>
            Shaft View
          </Button>
        </Link>
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

      {/* 3-Column Readout Card with Thin Dividers */}
      <Card className="mb-6" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DCDFEA]">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
              Building Availability
            </span>
            <div className="text-2xl font-bold text-[#1E2232] font-mono mt-1">99.85%</div>
            <span className="text-[10px] text-[#15804D] font-medium block mt-1">All 4 shafts operational</span>
          </div>
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
              Today's Reservations
            </span>
            <div className="text-2xl font-bold text-[#433690] font-mono mt-1">2 Bookings</div>
            <span className="text-[10px] text-[#5D6375] font-medium block mt-1">1 Approved, 1 Pending</span>
          </div>
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-normal text-[#5D6375] uppercase tracking-wider block">
              Active Alarms
            </span>
            <div className="text-2xl font-bold text-[#15804D] font-mono mt-1">0 Critical</div>
            <span className="text-[10px] text-[#5D6375] font-medium block mt-1">Safety circuits closed</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Elevators Grid */}
        <Card title="Live Elevator Banks (North Core)">
          <div className="space-y-3">
            {cars.map((car) => (
              <div
                key={car.id}
                className="p-3.5 rounded-[6px] border border-[#DCDFEA] bg-white flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
              >
                <div>
                  <div className="font-medium text-[#1E2232]">{car.name}</div>
                  <div className="text-[#5D6375] text-[11px] font-mono mt-0.5">
                    Position: Floor {car.floor} | Cabin Load: {car.load}%
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={car.status} size="sm" />
                  <Link href={`/elevators/${car.id}/live`}>
                    <Button variant="outline" size="sm">Monitor</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Operations Station */}
        <Card title="Facility Access & Visitor Coordination">
          <div className="space-y-3 text-xs text-[#5D6375]">
            <div className="p-4 bg-[#EEF0F6]/60 rounded-[6px] border border-[#DCDFEA]">
              <span className="font-medium text-[#1E2232] block mb-1">Visitor Landing Call Assist</span>
              <p className="text-[11px] text-[#5D6375] mb-3">
                Issue temporary destination dispatch authorization for pre-registered corporate visitors.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Issue Visitor Pass & Dispatch
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Issue Visitor Pass Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Temporary Visitor Pass & Dispatch"
        subtitle="Authorize turnstile access and schedule elevator landing call for visiting personnel"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            audioService.playCallRegistered();
            setIsModalOpen(false);
            setSuccessBanner(`Visitor pass issued for ${visitorName}. Destination call assigned for Floor ${destFloor}.`);
            setVisitorName('');
            audioService.playArrivalChime();
            setTimeout(() => setSuccessBanner(null), 5000);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Visitor Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Host Tenant</label>
              <select
                value={hostTenant}
                onChange={(e) => setHostTenant(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                <option value="Acme Corporation (Floor 12)">Acme Corporation (Floor 12)</option>
                <option value="Nexus Financial (Floor 8)">Nexus Financial (Floor 8)</option>
                <option value="Apex Executive Suites (Floor 19)">Apex Executive Suites (Floor 19)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Destination Floor</label>
              <select
                value={destFloor}
                onChange={(e) => setDestFloor(Number(e.target.value))}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20].map((f) => (
                  <option key={f} value={f}>Floor {f}</option>
                ))}
              </select>
            </div>
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
              Authorize Pass & Dispatch Car
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
