'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  DoorClosed, 
  DoorOpen, 
  Lock, 
  Siren, 
  Wrench, 
  Activity, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { audioService } from '@/lib/audioService';

export default function MobileHubPage() {
  const [pickupFloor, setPickupFloor] = useState<number>(1);
  const [destFloor, setDestFloor] = useState<number>(8);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);
  const [assignedCar, setAssignedCar] = useState<string>('ELV-A-01');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);

  // Live telemetry snapshot for active car
  const [carFloor, setCarFloor] = useState<number>(4);
  const [carDir, setCarDir] = useState<'UP' | 'DOWN' | 'STATIONARY'>('UP');
  const [carDoor, setCarDoor] = useState<'OPEN' | 'CLOSED'>('CLOSED');
  const [carLoad, setCarLoad] = useState<number>(34);

  // Periodic simulation loop for mobile live snapshot
  useEffect(() => {
    const timer = setInterval(() => {
      setCarFloor((prev) => {
        if (emergencyActive) {
          if (prev > 1) {
            setCarDir('DOWN');
            return prev - 1;
          }
          setCarDir('STATIONARY');
          setCarDoor('OPEN');
          return 1;
        }

        if (prev >= 12) {
          setCarDir('DOWN');
          return prev - 1;
        } else if (prev <= 1) {
          setCarDir('UP');
          return prev + 1;
        } else {
          return carDir === 'UP' ? prev + 1 : prev - 1;
        }
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [carDir, emergencyActive]);

  // ETA countdown
  useEffect(() => {
    if (callActive && etaSeconds > 0) {
      const countdown = setTimeout(() => {
        setEtaSeconds(etaSeconds - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    } else if (callActive && etaSeconds === 0) {
      audioService.playArrivalChime();
      setCarDoor('OPEN');
    }
  }, [callActive, etaSeconds]);

  const handleSummonElevator = (e: React.FormEvent) => {
    e.preventDefault();
    audioService.playCallRegistered();
    setCallActive(true);
    setEtaSeconds(10);
    setAssignedCar('ELV-A-01');
  };

  const handleTriggerEmergency = () => {
    audioService.playAlarmTone();
    setEmergencyActive(true);
    setIsEmergencyModalOpen(false);
  };

  const handleCancelEmergency = () => {
    audioService.playCallRegistered();
    setEmergencyActive(false);
  };

  const formatFloorName = (f: number): string => {
    if (f < 0) return `B${Math.abs(f)}`;
    if (f === 1) return 'G (Lobby)';
    return `Floor ${f}`;
  };

  return (
    <div className="min-h-screen bg-[#EEF0F6] text-[#1E2232] font-sans">
      {/* Top Mobile Application Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#DCDFEA] px-4 py-3 shadow-xs">
        <div className="max-w-[480px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#433690] text-white font-bold flex items-center justify-center text-sm shadow-xs">
              EO
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-[#1E2232] leading-tight flex items-center space-x-1.5">
                <span>ElevateOS Mobile</span>
                <span className="text-[9px] bg-[#E6E3F7] text-[#433690] font-bold px-1.5 py-0.5 rounded">
                  PWA
                </span>
              </div>
              <div className="text-[10px] text-[#5D6375] flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#15804D] inline-block animate-pulse"></span>
                <span>Apex Tower A &middot; Online</span>
              </div>
            </div>
          </div>

          <Link
            href="/org/dashboard"
            className="text-[11px] font-semibold text-[#433690] hover:underline flex items-center space-x-1 bg-[#EEF0F6] px-2.5 py-1.5 rounded-[6px]"
          >
            <span>Desktop</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Touch-Optimized Workspace */}
      <main className="max-w-[480px] mx-auto p-4 space-y-4 pb-20">
        
        {/* Emergency Active Banner (If triggered) */}
        {emergencyActive && (
          <div className="p-3.5 rounded-[8px] bg-red-100 border-l-4 border-red-600 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Siren className="h-5 w-5 text-red-600 animate-bounce flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-red-900 block">
                  PHASE 1 RECALL ACTIVE
                </span>
                <span className="text-[11px] text-red-800">
                  All hoistways returning to Lobby.
                </span>
              </div>
            </div>
            <button
              onClick={handleCancelEmergency}
              className="text-xs font-bold bg-white px-2.5 py-1 rounded border border-red-400 text-red-700 hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        )}

        {/* Live Active Elevator Status Widget */}
        <div className="bg-white rounded-[10px] border border-[#DCDFEA] p-4 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCDFEA]">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-[#15804D] animate-pulse" />
              <span className="text-xs font-bold text-[#1E2232]">Nearest Hoistway: {assignedCar}</span>
            </div>
            <StatusBadge status={emergencyActive ? 'Fault' : 'Running'} size="sm" />
          </div>

          <div className="py-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#5D6375] uppercase font-mono block">Current Location</span>
              <div className="text-3xl font-extrabold font-mono text-[#433690] flex items-center space-x-2">
                <span>{formatFloorName(carFloor)}</span>
                {carDir === 'UP' && <ArrowUp className="h-5 w-5 text-[#15804D] animate-bounce" />}
                {carDir === 'DOWN' && <ArrowDown className="h-5 w-5 text-[#15804D] animate-bounce" />}
                {carDir === 'STATIONARY' && <Minus className="h-5 w-5 text-slate-400" />}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#5D6375] uppercase font-mono block">Cabin Door</span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#EEF0F6] border border-[#DCDFEA] text-xs font-mono font-bold mt-1">
                {carDoor === 'OPEN' ? (
                  <>
                    <DoorOpen className="h-3.5 w-3.5 text-[#15804D]" />
                    <span className="text-[#15804D]">DOORS OPEN</span>
                  </>
                ) : (
                  <>
                    <DoorClosed className="h-3.5 w-3.5 text-[#5D6375]" />
                    <span className="text-[#5D6375]">CLOSED</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#DCDFEA] text-[11px] font-mono text-[#5D6375]">
            <div>Cabin Load: <strong className="text-[#1E2232]">{carLoad}%</strong></div>
            <div className="text-right">Safety Chain: <strong className="text-[#15804D]">INTERLOCKED</strong></div>
          </div>
        </div>

        {/* 1-Tap Passenger Dispatch Call */}
        <div className="bg-white rounded-[10px] border border-[#DCDFEA] p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E2232] flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-[#433690]" />
              <span>Request Elevator Ride</span>
            </h2>
            <span className="text-[10px] font-mono text-[#5D6375]">Group Dispatch AI</span>
          </div>

          <form onSubmit={handleSummonElevator} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pickup-floor" className="block text-[11px] font-semibold text-[#5D6375] mb-1">
                  Pickup Floor
                </label>
                <select
                  id="pickup-floor"
                  name="pickupFloor"
                  suppressHydrationWarning
                  value={pickupFloor}
                  onChange={(e) => setPickupFloor(Number(e.target.value))}
                  className="w-full text-xs h-11 px-3 bg-white border border-[#DCDFEA] rounded-[8px] text-[#1E2232] font-medium"
                >
                  <option value={-2}>Basement 2 (B2)</option>
                  <option value={-1}>Basement 1 (B1)</option>
                  <option value={1}>Ground Floor (G)</option>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((f) => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dest-floor" className="block text-[11px] font-semibold text-[#5D6375] mb-1">
                  Target Floor
                </label>
                <select
                  id="dest-floor"
                  name="destFloor"
                  suppressHydrationWarning
                  value={destFloor}
                  onChange={(e) => setDestFloor(Number(e.target.value))}
                  className="w-full text-xs h-11 px-3 bg-white border border-[#DCDFEA] rounded-[8px] text-[#1E2232] font-medium"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((f) => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                  <option value={1}>Ground Floor (G)</option>
                  <option value={-1}>Basement 1 (B1)</option>
                  <option value={-2}>Basement 2 (B2)</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-sm font-bold shadow-sm"
              icon={<ArrowUp className="h-4 w-4" />}
            >
              Summon Elevator to {formatFloorName(pickupFloor)}
            </Button>
          </form>

          {/* Active Call ETA Card */}
          {callActive && (
            <div className="mt-2 p-3 bg-[#DCEFE4] border border-[#15804D]/30 rounded-[8px] flex items-center justify-between text-xs text-[#15804D]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>
                  {etaSeconds > 0 ? (
                    <><strong>{assignedCar}</strong> arriving in <strong>{etaSeconds}s</strong></>
                  ) : (
                    <><strong>{assignedCar}</strong> arrived at {formatFloorName(pickupFloor)}! Doors opening.</>
                  )}
                </span>
              </div>
              <button
                onClick={() => setCallActive(false)}
                className="text-[11px] font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Quick Portal Switcher Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#5D6375] uppercase tracking-wider block px-1">
            Mobile Operations Modules
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/control-room/grid"
              className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] hover:border-[#433690]/50 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md bg-[#EEF0F6] text-[#433690]">
                  <Layers className="h-4 w-4" />
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1E2232] block">Control Room</span>
                <span className="text-[10px] text-[#5D6375]">4-Car Telemetry Grid</span>
              </div>
            </Link>

            <Link
              href="/elevators/elv-a-01/live"
              className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] hover:border-[#433690]/50 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md bg-[#EEF0F6] text-[#433690]">
                  <Activity className="h-4 w-4" />
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1E2232] block">Shaft Visualizer</span>
                <span className="text-[10px] text-[#5D6375]">3D Kinematic Twin</span>
              </div>
            </Link>

            <Link
              href="/technician/mobile"
              className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] hover:border-[#433690]/50 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md bg-[#EEF0F6] text-[#433690]">
                  <Wrench className="h-4 w-4" />
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1E2232] block">Field Tech App</span>
                <span className="text-[10px] text-[#5D6375]">Offline Work Orders</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="p-3 bg-red-50 rounded-[8px] border border-red-200 hover:border-red-400 transition-all flex flex-col justify-between shadow-2xs text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md bg-red-100 text-red-600">
                  <Siren className="h-4 w-4" />
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-700 block">Emergency P1</span>
                <span className="text-[10px] text-red-600">Phase 1 Safety Recall</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Emergency Confirmation Modal */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Trigger Phase 1 Emergency Recall"
        subtitle="Command autonomous elevator recall to lobby and sound statutory alarm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#5D6375]">
            This will recall all elevators to Ground Floor (Lobby) and open doors for passenger evacuation. Intercom communication will remain active.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEmergencyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleTriggerEmergency}
            >
              Execute Emergency Recall
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}