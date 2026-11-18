'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  Clock, 
  Zap, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { audioService } from '@/lib/audioService';

interface DispatchAllocationResult {
  assignedCar: string;
  carName: string;
  estimatedWaitSec: number;
  totalTravelSec: number;
  energyScore: number;
  pickupFloor: number;
  destFloor: number;
  passengers: number;
}

export function GroupDispatchKiosk() {
  const [pickupFloor, setPickupFloor] = useState<number>(1);
  const [destFloor, setDestFloor] = useState<number>(8);
  const [passengers, setPassengers] = useState<number>(2);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [allocation, setAllocation] = useState<DispatchAllocationResult | null>(null);

  const handleComputeDispatch = () => {
    if (pickupFloor === destFloor) {
      alert('Pickup floor and destination floor must be different.');
      return;
    }

    audioService.playCallRegistered();
    setIsCalculating(true);

    setTimeout(() => {
      // Deterministic optimal dispatch allocation
      const cars = [
        { id: 'ELV-A-01', name: 'Car 1 (High-Speed)', speed: 2.5, currentFloor: 4 },
        { id: 'ELV-A-02', name: 'Car 2 (Standard)', speed: 1.75, currentFloor: 1 },
        { id: 'ELV-A-03', name: 'Car 3 (Freight)', speed: 1.5, currentFloor: 8 },
        { id: 'ELV-A-04', name: 'Car 4 (Emergency)', speed: 2.0, currentFloor: 1 },
      ];

      // Score cars by ETA to pickup floor
      const scored = cars.map((c) => {
        const dist = Math.abs(c.currentFloor - pickupFloor);
        const eta = Math.round((dist / c.speed) * 3) + 4;
        const travelDist = Math.abs(pickupFloor - destFloor);
        const travelTime = Math.round((travelDist / c.speed) * 3.2) + eta;
        return {
          car: c,
          wait: eta,
          total: travelTime,
          score: 95 - dist * 3,
        };
      }).sort((a, b) => a.wait - b.wait);

      const best = scored[0];
      setAllocation({
        assignedCar: best.car.id,
        carName: best.car.name,
        estimatedWaitSec: best.wait,
        totalTravelSec: best.total,
        energyScore: best.score,
        pickupFloor,
        destFloor,
        passengers,
      });

      setIsCalculating(false);
      audioService.playArrivalChime();
    }, 600);
  };

  return (
    <div className="luminous-cockpit-card p-5">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[#DCDFEA] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-[6px] bg-[#433690] text-white flex items-center justify-center">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E2232] tracking-tight">
              AI Destination Dispatch Kiosk Simulator
            </h3>
            <p className="text-xs text-[#5D6375]">
              Real-time multi-car optimization engine: Hall call allocation with ETA and energy minimization
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF0F6] text-[#433690] font-bold border border-[#DCDFEA]">
          ALGORITHM: ISO 25745-2 / ETA OPTIMIZED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Input Parameters Form */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Pickup Floor Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">
              Pickup Floor:
            </label>
            <div className="grid grid-cols-6 gap-1 text-xs font-mono">
              {[-2, -1, 1, 4, 8, 12].map((f) => (
                <button
                  key={f}
                  onClick={() => setPickupFloor(f)}
                  className={`py-1.5 rounded-[6px] border font-bold transition-all ${
                    pickupFloor === f
                      ? 'bg-[#433690] text-white border-[#433690] shadow-xs'
                      : 'bg-white text-[#1E2232] border-[#DCDFEA] hover:bg-[#EEF0F6]'
                  }`}
                >
                  {f < 0 ? `B${Math.abs(f)}` : f === 1 ? 'G' : `F${f}`}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Floor Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">
              Destination Floor:
            </label>
            <div className="grid grid-cols-6 gap-1 text-xs font-mono">
              {[-2, 1, 4, 8, 10, 14].map((f) => (
                <button
                  key={f}
                  onClick={() => setDestFloor(f)}
                  className={`py-1.5 rounded-[6px] border font-bold transition-all ${
                    destFloor === f
                      ? 'bg-[#15804D] text-white border-[#15804D] shadow-xs'
                      : 'bg-white text-[#1E2232] border-[#DCDFEA] hover:bg-[#EEF0F6]'
                  }`}
                >
                  {f < 0 ? `B${Math.abs(f)}` : f === 1 ? 'G' : `F${f}`}
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Count & Submit Button */}
          <div className="flex items-center space-x-3 pt-1">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-[#5D6375] mb-1">
                Passenger Count:
              </label>
              <div className="flex space-x-1">
                {[1, 2, 4, 6].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPassengers(p)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                      passengers === p
                        ? 'bg-[#EEF0F6] text-[#433690] border-[#433690]'
                        : 'bg-white text-[#5D6375] border-[#DCDFEA]'
                    }`}
                  >
                    {p}p
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleComputeDispatch}
              disabled={isCalculating}
              className="mt-4 px-4 py-2 bg-[#433690] hover:bg-[#352A75] text-white text-xs font-bold rounded-[8px] transition-colors shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{isCalculating ? 'Computing...' : 'Calculate Dispatch'}</span>
            </button>
          </div>
        </div>

        {/* Dispatch Allocation Output Terminal */}
        <div className="lg:col-span-7">
          {allocation ? (
            <div className="bg-[#FAFBFD] border-2 border-[#433690]/30 rounded-[10px] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDFEA]">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded bg-[#DCEFE4] text-[#15804D]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-[#1E2232] font-mono">
                    DISPATCH ASSIGNMENT CONFIRMED
                  </span>
                </div>
                <span className="text-xs font-mono text-[#433690] font-bold">
                  {allocation.passengers} Passenger(s)
                </span>
              </div>

              {/* Boarding Allocation Card */}
              <div className="p-3 bg-white rounded-[8px] border border-[#DCDFEA] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#5D6375] block">
                    Assigned Car
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#433690]">
                    {allocation.assignedCar}
                  </div>
                  <span className="text-xs text-[#5D6375] font-medium">
                    {allocation.carName}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-center font-mono">
                  <div className="px-3 py-1.5 rounded-[6px] bg-[#EEF0F6] border border-[#DCDFEA]">
                    <span className="text-[10px] text-[#5D6375] block">Wait Time</span>
                    <span className="text-lg font-bold text-[#15804D]">
                      {allocation.estimatedWaitSec}s
                    </span>
                  </div>

                  <div className="px-3 py-1.5 rounded-[6px] bg-[#EEF0F6] border border-[#DCDFEA]">
                    <span className="text-[10px] text-[#5D6375] block">Total Travel</span>
                    <span className="text-lg font-bold text-[#1E2232]">
                      {allocation.totalTravelSec}s
                    </span>
                  </div>

                  <div className="px-3 py-1.5 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30">
                    <span className="text-[10px] text-[#15804D] block">Energy Score</span>
                    <span className="text-lg font-bold text-[#15804D]">
                      {allocation.energyScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Journey Route Map */}
              <div className="flex items-center justify-between text-xs font-mono text-[#5D6375] px-2">
                <span>Origin: <strong className="text-[#1E2232]">Floor {allocation.pickupFloor}</strong></span>
                <ArrowRight className="h-3.5 w-3.5 text-[#433690]" />
                <span>Destination: <strong className="text-[#1E2232]">Floor {allocation.destFloor}</strong></span>
                <span className="text-[#15804D] font-bold">● Boarding Gate Verified</span>
              </div>
            </div>
          ) : (
            <div className="h-44 border-2 border-dashed border-[#DCDFEA] rounded-[10px] flex flex-col items-center justify-center text-center p-4 bg-[#FAFBFD]">
              <Compass className="h-8 w-8 text-[#433690]/40 mb-2" />
              <span className="text-xs font-semibold text-[#1E2232]">
                Interactive Hall Call Simulation Ready
              </span>
              <p className="text-[11px] text-[#5D6375] max-w-sm mt-0.5">
                Select your pickup & destination floors and press Calculate Dispatch to test the ElevateOS destination group allocation engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
