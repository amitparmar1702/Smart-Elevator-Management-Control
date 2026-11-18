'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Building2, 
  Activity 
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { audioService } from '@/lib/audioService';

export default function CallsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupFloor, setPickupFloor] = useState(1);
  const [destFloor, setDestFloor] = useState(8);
  const [priorityType, setPriorityType] = useState('STANDARD');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [kioskDestination, setKioskDestination] = useState<number | null>(null);
  const [kioskResult, setKioskResult] = useState<{
    callId: string;
    car: string;
    floor: number;
    etaSec: number;
    gate: string;
  } | null>(null);

  const handleKioskSelect = (floor: number) => {
    audioService.playCallRegistered();
    setKioskDestination(floor);
    const newId = `PORT-${Math.floor(1000 + Math.random() * 9000)}`;
    const assignedCar = floor >= 12 ? 'Car 1 (High-Speed)' : floor >= 6 ? 'Car 2 (Standard)' : 'Car 3 (Freight)';
    const etaSec = Math.floor(4 + Math.random() * 10);
    const gate = floor >= 12 ? 'Bay 1 (North Core)' : floor >= 6 ? 'Bay 2 (North Core)' : 'Bay 3 (Service Core)';

    setKioskResult({
      callId: newId,
      car: assignedCar,
      floor,
      etaSec,
      gate,
    });
    audioService.playArrivalChime();

    const newCall = {
      id: newId,
      building: 'Apex Financial Tower A',
      pickup: 1,
      dest: floor,
      type: 'KIOSK_DESTINATION',
      assignedCar,
      status: 'DISPATCHED',
      waitSec: etaSec,
    };
    setCalls((prev) => [newCall, ...prev]);
  };

  const [calls, setCalls] = useState([
    {
      id: 'CALL-8812',
      building: 'Apex Financial Tower A',
      pickup: 1,
      dest: 8,
      type: 'DESTINATION',
      assignedCar: 'Car 1 (High-Speed)',
      status: 'DISPATCHED',
      waitSec: 14,
    },
    {
      id: 'CALL-8813',
      building: 'Apex Financial Tower A',
      pickup: 4,
      dest: 1,
      type: 'LANDING',
      assignedCar: 'Car 3 (Freight)',
      status: 'ARRIVED',
      waitSec: 0,
    },
    {
      id: 'CALL-8809',
      building: 'Apex Financial Tower A',
      pickup: 12,
      dest: 1,
      type: 'DESTINATION',
      assignedCar: 'Car 1 (High-Speed)',
      status: 'COMPLETED',
      waitSec: 22,
    },
  ]);

  const handleDispatchCall = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CALL-${Math.floor(8820 + Math.random() * 900)}`;
    const assignedCar = destFloor > 10 ? 'Car 1 (High-Speed)' : 'Car 2 (Standard North)';
    const newCall = {
      id: newId,
      building: 'Apex Financial Tower A',
      pickup: Number(pickupFloor),
      dest: Number(destFloor),
      type: priorityType === 'VIP' ? 'VIP_PRIORITY' : 'DESTINATION',
      assignedCar,
      status: 'DISPATCHED',
      waitSec: Math.floor(8 + Math.random() * 12),
    };
    setCalls([newCall, ...calls]);
    setIsModalOpen(false);
    setSuccessBanner(`Destination call ${newId} dispatched: Assigned to ${assignedCar} (Floor ${pickupFloor} ➔ ${destFloor}).`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Facility Operations' }, { label: 'Elevator Calls & Dispatch' }]}
      title="Elevator Call Queue & Traffic Dispatch"
      subtitle="Landing calls, destination control assignments, and passenger wait-time metrics"
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Sparkles className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Issue Destination Call
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
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">Average Wait Time</span>
          <div className="text-2xl font-bold text-main font-mono mt-1">18.4s</div>
          <span className="text-[11px] text-st-running font-medium block mt-1">Optimized by ETA group logic</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">Calls Dispatched Today</span>
          <div className="text-2xl font-bold text-main font-mono mt-1">1,482</div>
          <span className="text-[11px] text-muted font-medium block mt-1">Apex Tower Bank A</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Active Hall Calls</span>
          <div className="text-2xl font-bold text-[#433690] font-mono mt-1">2</div>
          <span className="text-[11px] text-[#15804D] font-medium block mt-1">0 calls pending assignment</span>
        </Card>
      </div>

      {/* Interactive Destination Dispatch Kiosk Simulator */}
      <Card
        title="Lobby Destination Touch Kiosk (PORT / Compass 360 Simulator)"
        subtitle="Tap any destination floor to test automated multi-car group dispatch allocation in real time"
        className="mb-6 border-2 border-[#433690]/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          {/* Left: Floor Touch Panel (1 to 20, B1, B2) */}
          <div className="lg:col-span-7">
            <span className="text-[11px] font-semibold text-[#5D6375] uppercase tracking-wider block mb-2.5">
              Select Destination Floor
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((fl) => (
                <button
                  key={fl}
                  onClick={() => handleKioskSelect(fl)}
                  className={`h-11 rounded-[8px] font-mono font-bold text-xs border transition-all active:scale-95 flex items-center justify-center ${
                    kioskDestination === fl
                      ? 'bg-[#433690] text-white border-[#433690] shadow-sm ring-2 ring-[#433690]/30'
                      : 'bg-white text-[#1E2232] border-[#DCDFEA] hover:border-[#433690] hover:bg-[#EEF0F6]'
                  }`}
                >
                  {fl < 0 ? `B${Math.abs(fl)}` : `L${fl}`}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Simulated Passenger Instruction Screen */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-[10px] bg-gradient-to-br from-[#1E2232] to-[#0F172A] text-white shadow-md">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  ● KIOSK TERMINAL ONLINE
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Ground Lobby Bank A
                </span>
              </div>

              {kioskResult ? (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">TARGET DESTINATION</span>
                    <div className="text-2xl font-bold font-mono text-white">
                      Floor {kioskResult.floor < 0 ? `Basement ${Math.abs(kioskResult.floor)}` : kioskResult.floor}
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-white/10 border border-white/20">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">
                      ASSIGNED PASSENGER ELEVATOR
                    </span>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                      {kioskResult.car}
                    </div>
                    <span className="text-xs text-slate-300 block mt-1">
                      Proceed to: <strong>{kioskResult.gate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1">
                    <span>Estimated Boarding Wait:</span>
                    <span className="font-bold text-emerald-400">{kioskResult.etaSec} seconds</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-slate-300">
                    <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Awaiting Floor Selection</h4>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Touch any destination floor on the left pad to simulate real-time car dispatch assignment.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-700/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>ALGO: ETA Minimization</span>
              <span>ISO 18738 Ready</span>
            </div>
          </div>
        </div>
      </Card>

      <Card noPadding title="Active & Recent Call Lifecycle Log">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-[#EEF0F6] border-b border-[#DCDFEA] text-[#5D6375] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Call ID</th>
                <th className="py-3 px-4">Pickup Floor</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Call Type</th>
                <th className="py-3 px-4">Allocated Car</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">ETA Wait Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDFEA] font-mono">
              {calls.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#433690]">{c.id}</td>
                  <td className="px-4 font-bold text-[#1E2232]">Floor {c.pickup}</td>
                  <td className="px-4 font-bold text-[#1E2232]">
                    {c.dest ? `Floor ${c.dest}` : 'Unspecified'}
                  </td>
                  <td className="px-4 text-[11px] text-[#5D6375]">{c.type}</td>
                  <td className="px-4 text-[#1E2232] font-sans font-medium">{c.assignedCar}</td>
                  <td className="px-4">
                    <StatusBadge status={c.status === 'ARRIVED' ? 'RUNNING' : c.status === 'DISPATCHED' ? 'MAINTENANCE' : 'OFFLINE'} />
                  </td>
                  <td className="px-4 text-right font-bold text-main">
                    {c.status === 'COMPLETED' ? `${c.waitSec}s` : c.status === 'ARRIVED' ? 'Boarding' : `${c.waitSec}s`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Destination Call Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Destination Dispatch Call"
        subtitle="Transmit a targeted destination call to the elevator group controller with ETA scheduling"
      >
        <form onSubmit={handleDispatchCall} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Pickup Floor</label>
              <select
                value={pickupFloor}
                onChange={(e) => setPickupFloor(Number(e.target.value))}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                {[-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20].map((f) => (
                  <option key={f} value={f}>
                    {f < 0 ? `Basement ${Math.abs(f)}` : f === 1 ? 'Floor 1 (Ground Lobby)' : `Floor ${f}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Destination Floor</label>
              <select
                value={destFloor}
                onChange={(e) => setDestFloor(Number(e.target.value))}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                {[-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20].map((f) => (
                  <option key={f} value={f}>
                    {f < 0 ? `Basement ${Math.abs(f)}` : f === 1 ? 'Floor 1 (Ground Lobby)' : `Floor ${f}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Dispatch Priority</label>
            <select
              value={priorityType}
              onChange={(e) => setPriorityType(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="STANDARD">Standard Passenger (Group Allocation)</option>
              <option value="VIP">Executive / VIP Fast-Track</option>
              <option value="ACCESSIBILITY">Accessibility / Extended Door Dwell</option>
            </select>
          </div>

          <div className="p-3 bg-[#EEF0F6] rounded-[6px] text-[11px] text-[#5D6375]">
            Dynamic ETA optimization will automatically route the closest available car with minimum wait time.
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
              Dispatch Elevator Call
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

