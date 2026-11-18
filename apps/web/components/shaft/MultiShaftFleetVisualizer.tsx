'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  DoorClosed, 
  DoorOpen, 
  Zap, 
  Radio, 
  Volume2, 
  VolumeX,
  Compass,
  FileCode,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { audioService } from '@/lib/audioService';

interface CarSimState {
  id: string;
  code: string;
  name: string;
  mfr: string;
  floor: number;
  targetFloor: number | null;
  direction: 'UP' | 'DOWN' | 'STATIONARY';
  velocityMps: number;
  doorState: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING';
  loadPercent: number;
  motorTempCelsius: number;
  maxSpeed: number;
}

const INITIAL_CARS: CarSimState[] = [
  {
    id: 'elv-a-01',
    code: 'ELV-A-01',
    name: 'Car 1 (High-Speed Passenger)',
    mfr: 'KONE MonoSpace',
    floor: 4.0,
    targetFloor: null,
    direction: 'STATIONARY',
    velocityMps: 0,
    doorState: 'CLOSED',
    loadPercent: 34,
    motorTempCelsius: 48.2,
    maxSpeed: 2.5,
  },
  {
    id: 'elv-a-02',
    code: 'ELV-A-02',
    name: 'Car 2 (Standard Passenger)',
    mfr: 'Otis SkyRise',
    floor: 1.0,
    targetFloor: null,
    direction: 'STATIONARY',
    velocityMps: 0,
    doorState: 'CLOSED',
    loadPercent: 12,
    motorTempCelsius: 42.1,
    maxSpeed: 1.75,
  },
  {
    id: 'elv-a-03',
    code: 'ELV-A-03',
    name: 'Car 3 (Freight & Heavy Goods)',
    mfr: 'Schindler 5500',
    floor: 8.0,
    targetFloor: null,
    direction: 'STATIONARY',
    velocityMps: 0,
    doorState: 'CLOSED',
    loadPercent: 68,
    motorTempCelsius: 52.4,
    maxSpeed: 1.5,
  },
  {
    id: 'elv-a-04',
    code: 'ELV-A-04',
    name: 'Car 4 (Fire & Emergency)',
    mfr: 'TK Elevator',
    floor: 1.0,
    targetFloor: null,
    direction: 'STATIONARY',
    velocityMps: 0,
    doorState: 'CLOSED',
    loadPercent: 0,
    motorTempCelsius: 38.0,
    maxSpeed: 2.0,
  },
];

const DISPLAY_FLOORS = [
  { floor: 14, label: 'L14' },
  { floor: 12, label: 'L12' },
  { floor: 10, label: 'L10' },
  { floor: 8, label: 'L8' },
  { floor: 6, label: 'L6' },
  { floor: 4, label: 'L4' },
  { floor: 2, label: 'L2' },
  { floor: 1, label: 'G' },
  { floor: -1, label: 'B1' },
  { floor: -2, label: 'B2' },
];

export function MultiShaftFleetVisualizer() {
  const [cars, setCars] = useState<CarSimState[]>(INITIAL_CARS);
  const [viewMode, setViewMode] = useState<'3D_ISO' | 'CAD_BLUEPRINT' | 'THERMAL'>('3D_ISO');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeDispatchPulse, setActiveDispatchPulse] = useState<string | null>(null);

  // Initialize audio state
  useEffect(() => {
    setIsAudioMuted(audioService.getIsMuted());
  }, []);

  const handleToggleAudio = () => {
    const next = audioService.toggleMute();
    setIsAudioMuted(next);
  };

  // Dispatch elevator to floor
  const handleCallCar = (carId: string, targetFloor: number) => {
    audioService.playCallRegistered();
    setActiveDispatchPulse(`Dispatching ${carId.toUpperCase()} to Floor ${targetFloor}`);
    setTimeout(() => setActiveDispatchPulse(null), 3000);

    setCars((prev) =>
      prev.map((c) => {
        if (c.id !== carId) return c;
        if (c.floor === targetFloor) {
          audioService.playArrivalChime();
          return { ...c, doorState: 'OPEN' };
        }
        return {
          ...c,
          targetFloor,
          direction: targetFloor > c.floor ? 'UP' : 'DOWN',
          velocityMps: c.maxSpeed,
          doorState: 'CLOSED',
        };
      })
    );
  };

  // Physics simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCars((prev) =>
        prev.map((car) => {
          if (car.targetFloor === null) return car;

          const isAtTarget = Math.abs(car.floor - car.targetFloor) < 0.2;
          if (isAtTarget) {
            audioService.playArrivalChime();
            return {
              ...car,
              floor: car.targetFloor,
              targetFloor: null,
              direction: 'STATIONARY',
              velocityMps: 0,
              doorState: 'OPEN',
            };
          }

          const isGoingUp = car.targetFloor > car.floor;
          const step = 0.35;
          const nextFloor = isGoingUp ? car.floor + step : car.floor - step;

          return {
            ...car,
            floor: nextFloor,
            direction: isGoingUp ? 'UP' : 'DOWN',
            velocityMps: car.maxSpeed,
            doorState: 'CLOSED',
          };
        })
      );
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Floor range calculation for vertical car positioning
  const minF = -2;
  const maxF = 14;
  const totalSpan = maxF - minF;

  return (
    <div className="luminous-cockpit-card overflow-hidden">
      {/* Visualizer Top Control Bar */}
      <div className="p-4 bg-white border-b border-[#DCDFEA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-[8px] bg-[#433690] flex items-center justify-center text-white shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#1E2232] tracking-tight">
                Apex Financial Tower A — 4-Shaft Kinematic Hoistway Matrix
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DCEFE4] text-[#15804D] border border-[#15804D]/20">
                ● DETERMINISTIC MULTI-CAR SYNC
              </span>
            </div>
            <span className="text-xs text-[#5D6375]">
              Real-time architectural cross-section with wire ropes, counterweight dynamics, and landing call lanterns
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Acoustic Audio Toggle */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* Mode Tabs */}
          <div className="flex rounded-[8px] border border-[#DCDFEA] bg-[#EEF0F6] p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('3D_ISO')}
              className={`px-3 py-1.5 rounded-[6px] transition-all flex items-center space-x-1.5 font-semibold ${
                viewMode === '3D_ISO'
                  ? 'bg-white text-[#433690] shadow-xs'
                  : 'text-[#5D6375] hover:text-[#1E2232]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>3D Isometric</span>
            </button>
            <button
              onClick={() => setViewMode('CAD_BLUEPRINT')}
              className={`px-3 py-1.5 rounded-[6px] transition-all flex items-center space-x-1.5 font-semibold ${
                viewMode === 'CAD_BLUEPRINT'
                  ? 'bg-white text-[#433690] shadow-xs'
                  : 'text-[#5D6375] hover:text-[#1E2232]'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>CAD Blueprint</span>
            </button>
            <button
              onClick={() => setViewMode('THERMAL')}
              className={`px-3 py-1.5 rounded-[6px] transition-all flex items-center space-x-1.5 font-semibold ${
                viewMode === 'THERMAL'
                  ? 'bg-white text-[#433690] shadow-xs'
                  : 'text-[#5D6375] hover:text-[#1E2232]'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Thermal IR</span>
            </button>
          </div>

          {/* Audio Chime Mute/Unmute Pill */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-mono font-semibold transition-all ${
              !isAudioMuted
                ? 'bg-[#E6E3F7] text-[#433690] border-[#433690]/40'
                : 'bg-white text-[#5D6375] border-[#DCDFEA]'
            }`}
            title="Toggle synthesized elevator arrival & call registration chimes"
          >
            {!isAudioMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{!isAudioMuted ? 'AUDIO FX: ON' : 'AUDIO: MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Active Dispatch Pulse Notification */}
      {activeDispatchPulse && (
        <div className="px-4 py-2 bg-[#E6E3F7] border-b border-[#433690]/30 text-xs font-mono font-bold text-[#433690] flex items-center space-x-2 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{activeDispatchPulse}</span>
        </div>
      )}

      {/* Main Architectural Stage */}
      <div className={`p-4 ${viewMode === 'CAD_BLUEPRINT' ? 'cad-blueprint-grid' : 'bg-[#F4F6FB]'}`}>
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[540px]">
          {/* Left Floor Elevator Call Sidebar */}
          <div className="md:col-span-2 bg-white rounded-[8px] border border-[#DCDFEA] p-2 flex flex-col justify-between shadow-xs select-none">
            <div className="text-[10px] font-mono font-bold uppercase text-[#5D6375] pb-1 border-b border-[#DCDFEA] text-center">
              Level Selectors
            </div>
            <div className="flex flex-col justify-between space-y-1 my-1">
              {DISPLAY_FLOORS.map((f) => (
                <div
                  key={f.floor}
                  className="flex items-center justify-between px-2 py-1 bg-[#EEF0F6] rounded-[6px] border border-[#DCDFEA] text-xs font-mono font-semibold text-[#1E2232]"
                >
                  <span className="text-[#433690] font-bold">{f.label}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCallCar('elv-a-01', f.floor)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-[#433690] hover:text-white border border-[#DCDFEA] text-[10px] transition-colors"
                      title={`Dispatch Car 1 to ${f.label}`}
                    >
                      C1
                    </button>
                    <button
                      onClick={() => handleCallCar('elv-a-02', f.floor)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-[#433690] hover:text-white border border-[#DCDFEA] text-[10px] transition-colors"
                      title={`Dispatch Car 2 to ${f.label}`}
                    >
                      C2
                    </button>
                    <button
                      onClick={() => handleCallCar('elv-a-03', f.floor)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-[#433690] hover:text-white border border-[#DCDFEA] text-[10px] transition-colors"
                      title={`Dispatch Car 3 to ${f.label}`}
                    >
                      C3
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-[#5D6375] text-center pt-1 border-t border-[#DCDFEA]">
              Click C1-C3 to dispatch
            </div>
          </div>

          {/* Central 4-Shaft Architectural Cross-Section Matrix */}
          <div className="md:col-span-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cars.map((car, idx) => {
              // Calculate bottom position % for car and counterweight
              const clampedFloor = Math.max(minF, Math.min(maxF, car.floor));
              const carBottomPct = ((clampedFloor - minF) / totalSpan) * 78 + 4;
              // Counterweight is mathematically inverted: when car is at top (100%), counterweight is at bottom (4%)
              const counterweightBottomPct = 82 - ((clampedFloor - minF) / totalSpan) * 78;

              const isMoving = car.direction !== 'STATIONARY';
              const isDoorOpen = car.doorState === 'OPEN' || car.doorState === 'OPENING';

              return (
                <div
                  key={car.id}
                  className={`relative flex flex-col justify-between bg-white rounded-[8px] border transition-all ${
                    car.id === 'elv-a-01'
                      ? 'border-[#433690]/40 shadow-sm ring-1 ring-[#433690]/20'
                      : 'border-[#DCDFEA]'
                  }`}
                >
                  {/* Shaft Machine-Room Header (Traction Motor & Sheave Deck) */}
                  <div className="p-2.5 bg-[#EEF0F6] border-b border-[#DCDFEA] rounded-t-[7px] text-xs select-none">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#1E2232] text-[11px]">
                        {car.code}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#DCDFEA] text-[#433690] font-semibold">
                        {car.mfr.split(' ')[0]}
                      </span>
                    </div>

                    {/* Machine Room Sheave Graphic */}
                    <div className="mt-2 pt-2 border-t border-[#DCDFEA] flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center space-x-1.5">
                        {/* Spinning Traction Sheave Circle */}
                        <div
                          className={`h-5 w-5 rounded-full border-2 border-slate-600 bg-slate-200 flex items-center justify-center ${
                            isMoving ? 'animate-spin' : ''
                          }`}
                          style={{ animationDuration: '1.2s' }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                        </div>
                        <span className="text-[#5D6375] font-semibold">Traction Sheave</span>
                      </div>
                      <span className="text-[#15804D] font-bold">
                        {car.motorTempCelsius}°C
                      </span>
                    </div>
                  </div>

                  {/* Main Hoistway Vertical Travel Shaft */}
                  <div className="relative flex-1 bg-[#FAFBFD] min-h-[420px] overflow-hidden border-x border-[#EEF0F6]">
                    {/* Vertical Floor Slab Guide Lines */}
                    {DISPLAY_FLOORS.map((f) => (
                      <div
                        key={f.floor}
                        className="absolute w-full border-b border-dashed border-[#E2E8F0] flex items-center justify-between px-2 text-[9px] font-mono text-slate-300 pointer-events-none"
                        style={{
                          bottom: `${((f.floor - minF) / totalSpan) * 78 + 4}%`,
                        }}
                      >
                        <span>{f.label}</span>
                        <span className="text-slate-300">───</span>
                      </div>
                    ))}

                    {/* Hoist Steel Wire Ropes (Top of shaft to Car Roof) */}
                    <div
                      className="absolute top-0 w-0.5 bg-slate-400 pointer-events-none z-10"
                      style={{
                        left: '42%',
                        bottom: `${carBottomPct + 12}%`,
                      }}
                    ></div>
                    <div
                      className="absolute top-0 w-0.5 bg-slate-400 pointer-events-none z-10"
                      style={{
                        left: '46%',
                        bottom: `${carBottomPct + 12}%`,
                      }}
                    ></div>

                    {/* Counterweight Ropes (Top of shaft to Counterweight) */}
                    <div
                      className="absolute top-0 w-0.5 bg-slate-400 pointer-events-none z-10"
                      style={{
                        right: '18%',
                        bottom: `${counterweightBottomPct + 8}%`,
                      }}
                    ></div>

                    {/* THE COUNTERWEIGHT (Moves in opposite phase to car) */}
                    <div
                      className="absolute w-5 h-10 bg-gradient-to-b from-slate-400 to-slate-600 rounded-[2px] border border-slate-700 shadow-sm z-20 transition-all duration-700 ease-in-out flex flex-col justify-between p-0.5"
                      style={{
                        right: '12%',
                        bottom: `${counterweightBottomPct}%`,
                      }}
                      title={`Counterweight for ${car.code}`}
                    >
                      <div className="h-0.5 bg-slate-300 rounded"></div>
                      <div className="h-0.5 bg-slate-300 rounded"></div>
                      <div className="h-0.5 bg-slate-300 rounded"></div>
                    </div>

                    {/* THE ELEVATOR CAB (Luminous Box with interior lighting) */}
                    <div
                      className={`absolute w-24 sm:w-28 h-16 rounded-[4px] border-2 transition-all duration-700 ease-in-out z-30 shadow-md flex flex-col justify-between ${
                        viewMode === 'THERMAL'
                          ? 'bg-[#FEF3C7] border-[#D97706]'
                          : viewMode === 'CAD_BLUEPRINT'
                          ? 'bg-white border-[#433690]'
                          : 'bg-[#FFFBEB] border-[#F5A524] shadow-[0_0_15px_rgba(245,165,36,0.25)]'
                      }`}
                      style={{
                        left: '20%',
                        bottom: `${carBottomPct}%`,
                      }}
                    >
                      {/* Cab Direction & Floor HUD */}
                      <div className="bg-[#1B2236] text-white px-1.5 py-0.5 flex items-center justify-between text-[9px] font-mono rounded-t-[2px]">
                        <span className="font-bold text-[#F5A524]">{car.code}</span>
                        <div className="flex items-center space-x-1">
                          {car.direction === 'UP' && <ArrowUp className="h-3 w-3 text-[#15804D] animate-bounce" />}
                          {car.direction === 'DOWN' && <ArrowDown className="h-3 w-3 text-[#15804D] animate-bounce" />}
                          {car.direction === 'STATIONARY' && <Minus className="h-3 w-3 text-slate-400" />}
                          <span className="font-bold">L{Math.round(car.floor)}</span>
                        </div>
                      </div>

                      {/* Cab Interior & Doors */}
                      <div className="relative flex-1 bg-white/80 flex items-center justify-center overflow-hidden">
                        {/* Left & Right Door Panels */}
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-[#E2E8F0] border-r border-[#94A3B8] transition-all duration-500 ease-in-out"
                          style={{ width: isDoorOpen ? '0%' : '50%' }}
                        ></div>
                        <div
                          className="absolute top-0 bottom-0 right-0 bg-[#E2E8F0] border-l border-[#94A3B8] transition-all duration-500 ease-in-out"
                          style={{ width: isDoorOpen ? '0%' : '50%' }}
                        ></div>

                        {/* Passenger Payload indicator */}
                        <div className="text-[10px] font-mono font-bold text-[#9C5C00] z-0">
                          {car.loadPercent}% LOAD
                        </div>
                      </div>

                      {/* Cab Bottom Safety Toe Guard */}
                      <div className="h-1 bg-[#D97706] rounded-b-[2px]"></div>
                    </div>

                    {/* Shaft Pit Buffer (Bottom) */}
                    <div className="absolute bottom-0 w-full h-3 bg-[#EEF0F6] border-t border-[#DCDFEA] flex justify-around items-center px-4">
                      <div className="w-3 h-2 bg-slate-500 rounded-t" title="Car Hydraulic Buffer"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-t" title="Counterweight Buffer"></div>
                    </div>
                  </div>

                  {/* Shaft Bottom Telemetry Summary */}
                  <div className="p-2 bg-[#EEF0F6]/70 border-t border-[#DCDFEA] rounded-b-[7px] text-[10px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#5D6375]">Velocity:</span>
                      <span className="font-bold text-[#1E2232]">{car.velocityMps.toFixed(2)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6375]">Door:</span>
                      <span className="font-bold uppercase text-[#433690]">{car.doorState}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
