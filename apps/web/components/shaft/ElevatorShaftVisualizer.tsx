'use client';

import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Cpu, 
  DoorOpen, 
  DoorClosed, 
  Lock, 
  ShieldAlert, 
  Zap,
  Compass,
  Layers,
  Volume2
} from 'lucide-react';
import { ElevatorTelemetry } from '@elevateos/types';
import { audioService } from '@/lib/audioService';

interface ShaftVisualizerProps {
  telemetry: ElevatorTelemetry;
  minFloor?: number;
  maxFloor?: number;
  floors?: { floorNumber: number; displayName: string }[];
  onFloorCall?: (floor: number) => void;
}

export function ElevatorShaftVisualizer({
  telemetry,
  minFloor = 1,
  maxFloor = 10,
  floors,
  onFloorCall,
}: ShaftVisualizerProps) {
  const [viewMode, setViewMode] = useState<'ISOMETRIC' | 'FACADE'>('ISOMETRIC');

  // Generate list of floors from top to bottom based on actual data
  const floorList = floors && floors.length > 0
    ? [...floors].sort((a, b) => b.floorNumber - a.floorNumber)
    : (() => {
        const list = [];
        for (let f = maxFloor; f >= minFloor; f--) {
          if (f === 0) continue;
          list.push({
            floorNumber: f,
            displayName: f < 0 ? `B${Math.abs(f)}` : f === 1 ? 'G' : `F${f}`,
          });
        }
        return list;
      })();

  const numFloors = floorList.length;
  const currentFloorRound = Math.round(telemetry.floor);

  // Vertical position calculation (percentage from bottom of shaft)
  const effectiveMin = floorList[floorList.length - 1]?.floorNumber ?? minFloor;
  const effectiveMax = floorList[0]?.floorNumber ?? maxFloor;
  const clampedFloor = Math.max(effectiveMin, Math.min(effectiveMax, telemetry.floor));
  const floorSpan = effectiveMax - effectiveMin || 1;
  const carBottomPct = ((clampedFloor - effectiveMin) / floorSpan) * 80 + 3;
  // Counterweight position is mathematically inverted
  const counterweightBottomPct = 84 - ((clampedFloor - effectiveMin) / floorSpan) * 80;

  // Door opening state
  const isDoorOpen = telemetry.doorState === 'OPEN' || telemetry.doorState === 'OPENING';
  const doorWidthPct = telemetry.doorState === 'OPEN' ? 0 : telemetry.doorState === 'CLOSING' ? 35 : telemetry.doorState === 'OPENING' ? 15 : 50;

  const handleFloorClick = (floorNumber: number) => {
    audioService.playCallRegistered();
    if (onFloorCall) {
      onFloorCall(floorNumber);
    }
  };

  return (
    <div className="luminous-cockpit-card p-4 flex flex-col select-none">
      {/* Visualizer Top Bar & Telemetry Status */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#DCDFEA] text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-[6px] bg-[#433690] flex items-center justify-center text-white shadow-xs">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#1E2232] tracking-tight">
                Architectural Shaft &middot; {telemetry.elevatorId.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EEF0F6] text-[#433690] font-bold border border-[#DCDFEA]">
                {viewMode === 'ISOMETRIC' ? '3D CUTAWAY' : 'FACADE'}
              </span>
            </div>
            <span className="text-[11px] text-[#5D6375]">
              Real-time hoistway kinematics, counterweight dynamics & interlocks
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Sensor Status Tiles */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0 flex-wrap gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-[6px] border border-[#DCDFEA] bg-[#EEF0F6] p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('ISOMETRIC')}
              className={`px-2 py-1 rounded-[4px] transition-colors ${
                viewMode === 'ISOMETRIC' ? 'bg-white text-[#433690] font-bold shadow-xs' : 'text-[#5D6375]'
              }`}
            >
              3D Cutaway
            </button>
            <button
              onClick={() => setViewMode('FACADE')}
              className={`px-2 py-1 rounded-[4px] transition-colors ${
                viewMode === 'FACADE' ? 'bg-white text-[#433690] font-bold shadow-xs' : 'text-[#5D6375]'
              }`}
            >
              2D Facade
            </button>
          </div>

          {/* Sensor Tiles */}
          <div className="flex items-center space-x-1.5">
            {/* Door Status */}
            <div
              className={`h-9 px-2.5 rounded-[6px] border flex items-center space-x-1 text-xs font-mono font-bold ${
                isDoorOpen ? 'bg-[#E6E3F7] text-[#433690] border-[#433690]/30' : 'bg-[#EEF0F6] text-[#5D6375] border-[#DCDFEA]'
              }`}
            >
              {isDoorOpen ? <DoorOpen className="h-3.5 w-3.5 text-[#433690]" /> : <DoorClosed className="h-3.5 w-3.5" />}
              <span className="text-[10px] uppercase">{telemetry.doorState}</span>
            </div>

            {/* Safety Interlock */}
            <div
              className={`h-9 px-2.5 rounded-[6px] border flex items-center space-x-1 text-xs font-mono font-bold ${
                telemetry.safetyChainClosed
                  ? 'bg-[#DCEFE4] text-[#15804D] border-[#15804D]/30'
                  : 'bg-[#F8DDDC] text-[#C92D29] border-[#C92D29]'
              }`}
            >
              {telemetry.safetyChainClosed ? (
                <Lock className="h-3.5 w-3.5 text-[#15804D]" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 text-[#C92D29]" />
              )}
              <span className="text-[10px]">{telemetry.safetyChainClosed ? 'INTERLOCKED' : 'CIRCUIT OPEN'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Architectural Building Cross-Section */}
      <div className="relative w-full h-[580px] bg-[#FAFBFD] rounded-[8px] border border-[#DCDFEA] p-3 flex overflow-hidden">
        {/* Left Building Side Column (#7E8BAB) with Floor Chips */}
        <div className="w-14 sm:w-16 bg-[#7E8BAB] rounded-l flex flex-col justify-between py-2 px-1.5 z-20 shadow-sm border-r border-[#8D9AB8]">
          {floorList.map((f) => {
            const isCarHere = currentFloorRound === f.floorNumber;
            const isTarget = telemetry.targetFloor === f.floorNumber;

            return (
              <button
                key={f.floorNumber}
                onClick={() => handleFloorClick(f.floorNumber)}
                title={`Call elevator to Floor ${f.displayName}`}
                className={`w-full h-7 rounded flex items-center justify-center font-mono text-xs transition-all ${
                  isCarHere
                    ? 'bg-[#433690] text-white shadow-sm ring-2 ring-white/50 font-bold scale-105'
                    : isTarget
                    ? 'bg-white text-[#433690] border-2 border-[#433690] font-bold'
                    : 'bg-[#4E69B4] hover:bg-[#3D5699] text-white font-medium'
                }`}
              >
                {f.displayName}
              </button>
            );
          })}
        </div>

        {/* Central Building Facade & Hoistway */}
        <div className="relative flex-1 bg-[#F8F5EC] border-y border-[#8D9AB8] flex flex-col justify-between overflow-hidden">
          {/* Overhead Machine Room Deck in Isometric mode */}
          {viewMode === 'ISOMETRIC' && (
            <div className="absolute top-0 left-0 right-0 h-10 bg-[#1E2232] border-b-2 border-[#433690] z-25 flex items-center justify-between px-4 text-[10px] font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                {/* Motorized Spinning Traction Sheave */}
                <div
                  className={`h-6 w-6 rounded-full border-2 border-slate-400 bg-slate-700 flex items-center justify-center ${
                    telemetry.direction !== 'STATIONARY' ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '0.8s' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                </div>
                <span className="font-bold text-white">MACHINE ROOM // TRACTION SHEAVE</span>
              </div>
              <span className="text-[#15804D] font-bold">STATOR: {telemetry.motorTempCelsius}°C</span>
            </div>
          )}

          {/* Repeated Floor Slabs, Windows & Steel Landing Doors */}
          {floorList.map((f) => (
            <div
              key={f.floorNumber}
              className="relative flex-1 w-full border-b border-[#8D9AB8] flex items-center justify-between px-3"
              style={{ minHeight: `${100 / numFloors}%` }}
            >
              {/* Left Window Bay */}
              <div className="flex-1 h-full flex items-center space-x-2 opacity-70">
                <div className="w-px h-3/4 bg-[#8D9AB8]"></div>
                <div className="w-px h-3/4 bg-[#8D9AB8]"></div>
                <div className="w-px h-3/4 bg-[#8D9AB8]"></div>
              </div>

              {/* Steel Landing Door in the Middle */}
              <div className="w-20 sm:w-28 h-4/5 bg-gradient-to-r from-[#CBD5E1] via-[#E2E8F0] to-[#CBD5E1] border border-[#94A3B8] rounded-[2px] shadow-xs flex items-center justify-center relative overflow-hidden z-10">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#64748B]/60 -translate-x-1/2"></div>
                <span className="text-[9px] font-mono font-bold text-[#475569] bg-white/70 px-1 rounded z-10">
                  {f.displayName}
                </span>
              </div>

              {/* Right Window Bay */}
              <div className="flex-1 h-full flex items-center justify-end space-x-2 opacity-70">
                <div className="w-px h-3/4 bg-[#8D9AB8]"></div>
                <div className="w-px h-3/4 bg-[#8D9AB8]"></div>
                <div className="w-px h-3/4 bg-[#8D9AB8]"></div>
              </div>
            </div>
          ))}

          {/* Steel Hoist Wire Ropes */}
          {viewMode === 'ISOMETRIC' && (
            <>
              {/* Car Hoist Cables */}
              <div
                className="absolute top-10 w-0.5 bg-slate-500 pointer-events-none z-15"
                style={{ left: '46%', bottom: `${carBottomPct + 10}%` }}
              ></div>
              <div
                className="absolute top-10 w-0.5 bg-slate-500 pointer-events-none z-15"
                style={{ left: '50%', bottom: `${carBottomPct + 10}%` }}
              ></div>

              {/* Counterweight Cables */}
              <div
                className="absolute top-10 w-0.5 bg-slate-500 pointer-events-none z-15"
                style={{ right: '24%', bottom: `${counterweightBottomPct + 8}%` }}
              ></div>

              {/* THE COUNTERWEIGHT (Moves vertically opposite to the car) */}
              <div
                className="absolute w-5 h-12 bg-gradient-to-b from-slate-500 to-slate-700 rounded-[2px] border border-slate-800 shadow-sm z-20 transition-all duration-700 ease-in-out flex flex-col justify-between p-0.5"
                style={{
                  right: '22%',
                  bottom: `${counterweightBottomPct}%`,
                }}
                title="Counterweight Assembly"
              >
                <div className="h-0.5 bg-slate-300 rounded"></div>
                <div className="h-0.5 bg-slate-300 rounded"></div>
                <div className="h-0.5 bg-slate-300 rounded"></div>
              </div>
            </>
          )}

          {/* Central Vertical Shaft Hoistway Guide Rails */}
          <div className="absolute top-0 bottom-0 left-1/2 w-28 sm:w-36 -translate-x-1/2 pointer-events-none z-10">
            <div className="absolute top-0 bottom-0 left-1 w-0.5 bg-[#64748B]/50"></div>
            <div className="absolute top-0 bottom-0 right-1 w-0.5 bg-[#64748B]/50"></div>
          </div>

          {/* THE ELEVATOR CAR (Warm Glowing Box #FFF2CF, Amber Border #F5A524) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-24 sm:w-32 h-16 sm:h-20 bg-[#FFF2CF] border-2 border-[#F5A524] rounded-[4px] shadow-[0_0_20px_rgba(245,165,36,0.35)] flex flex-col justify-between transition-all duration-1000 ease-in-out z-30"
            style={{ bottom: `${carBottomPct}%` }}
          >
            {/* Dark Roof Display showing Direction Arrow and Floor */}
            <div className="bg-[#1B2236] text-white px-2 py-0.5 flex items-center justify-between text-[10px] font-mono rounded-t-[2px] shadow-xs">
              <span className="font-bold text-[#F5A524] text-[9px]">
                {telemetry.elevatorId.toUpperCase()}
              </span>
              <div className="flex items-center space-x-1">
                {telemetry.direction === 'UP' && <ArrowUp className="h-3 w-3 text-[#15804D] animate-bounce" />}
                {telemetry.direction === 'DOWN' && <ArrowDown className="h-3 w-3 text-[#15804D] animate-bounce" />}
                {telemetry.direction === 'STATIONARY' && <Minus className="h-3 w-3 text-slate-400" />}
                <span className="font-bold text-white text-[10px]">
                  FL {Math.round(telemetry.floor)}
                </span>
              </div>
            </div>

            {/* Car Interior & Sliding Doors */}
            <div className="relative flex-1 bg-[#FFF9E6] border-y border-[#F5A524]/40 flex items-center justify-center overflow-hidden">
              {/* Left Sliding Door Panel */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#E2E8F0] border-r border-[#94A3B8] transition-all duration-700 ease-in-out shadow-xs"
                style={{ width: `${doorWidthPct}%` }}
              ></div>

              {/* Right Sliding Door Panel */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-[#E2E8F0] border-l border-[#94A3B8] transition-all duration-700 ease-in-out shadow-xs"
                style={{ width: `${doorWidthPct}%` }}
              ></div>

              {/* Passenger/Load Indicator inside car */}
              <div className="text-[10px] font-mono text-[#9C5C00] font-bold z-0">
                {telemetry.loadPercent}% LOAD
              </div>
            </div>

            {/* Car Floor / Toe Guard */}
            <div className="h-1.5 bg-[#D97706] rounded-b-[2px]"></div>
          </div>
        </div>

        {/* Right Building Side Column (#7E8BAB) */}
        <div className="w-14 sm:w-16 bg-[#7E8BAB] rounded-r flex flex-col justify-between py-3 px-2 z-20 shadow-sm border-l border-[#8D9AB8] text-center">
          <div className="text-[9px] font-bold text-white tracking-widest uppercase">
            SHAFT
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-white font-bold">
              {telemetry.velocityMps.toFixed(2)}
              <span className="block text-[8px] font-normal text-slate-200">m/s</span>
            </div>
            <div className="text-[10px] font-mono text-white font-bold">
              {telemetry.motorTempCelsius.toFixed(0)}&deg;C
              <span className="block text-[8px] font-normal text-slate-200">TEMP</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-white">
            ZONE 1
          </div>
        </div>
      </div>

      {/* Visualizer Footer Telemetry Summary */}
      <div className="mt-3 pt-2.5 border-t border-[#DCDFEA] flex flex-wrap items-center justify-between text-xs text-[#5D6375]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#15804D] inline-block animate-pulse"></span>
            <span className="font-medium text-[#1E2232]">Kinematic Tracking:</span>
            <strong className="text-[#433690] font-mono">
              Floor {telemetry.floor.toFixed(1)} / {effectiveMax}
            </strong>
          </span>
          <span>&middot;</span>
          <span>Velocity: <strong className="font-mono text-[#1E2232]">{telemetry.velocityMps.toFixed(2)} m/s</strong></span>
        </div>

        <div className="text-[11px] font-mono">
          Last Packet: {new Date(telemetry.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
