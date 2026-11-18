'use client';

import React from 'react';
import { 
  Gauge, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ArrowUp, 
  ArrowDown, 
  Minus 
} from 'lucide-react';

interface GaugeClusterProps {
  velocity?: number; // m/s
  direction?: 'UP' | 'DOWN' | 'STATIONARY';
  powerKw?: number; // negative = regen, positive = draw
  vibrationRms?: number; // m/s2
  availabilityPct?: number; // %
  safetyChainClosed?: boolean;
}

export function TelemetryGaugeCluster({
  velocity = 2.25,
  direction = 'UP',
  powerKw = -14.8,
  vibrationRms = 0.042,
  availabilityPct = 99.85,
  safetyChainClosed = true,
}: GaugeClusterProps) {
  // Semi-circle arc circumference for radius 46 is PI * 46 = 144.51
  const arcLength = 144.51;

  // Gauge 1: Velocity (0 to 4.0 m/s)
  const maxVelocity = 4.0;
  const velRatio = Math.min(1, Math.max(0, velocity / maxVelocity));
  const velAngle = -90 + velRatio * 180;
  const velOffset = arcLength * (1 - velRatio);

  // Gauge 2: Power (-30kW regen to +60kW draw)
  const isRegen = powerKw < 0;
  const absPower = Math.abs(powerKw);
  const maxPowerScale = isRegen ? 30 : 60;
  const powerRatio = Math.min(1, absPower / maxPowerScale);
  const powerAngle = isRegen ? -90 + (1 - powerRatio) * 90 : powerRatio * 90;
  const powerOffset = arcLength * (1 - powerRatio);

  // Gauge 3: Vibration (0 to 0.150 m/s2)
  const maxVib = 0.150;
  const vibRatio = Math.min(1, Math.max(0, vibrationRms / maxVib));
  const vibAngle = -90 + vibRatio * 180;
  const vibOffset = arcLength * (1 - vibRatio);

  // Gauge 4: Availability (0 to 100%)
  const availRatio = Math.min(1, Math.max(0, availabilityPct / 100));
  const availAngle = -90 + availRatio * 180;
  const availOffset = arcLength * (1 - availRatio);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* GAUGE 1: Kinematic Speedometer */}
      <div className="luminous-cockpit-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#E6E3F7] text-[#433690]">
              <Gauge className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-[#1E2232] tracking-tight">Kinematic Speed</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF0F6] text-[#433690] font-bold border border-[#DCDFEA]">
            0 - 4.0 m/s
          </span>
        </div>

        {/* Semi-circular Arch Dial */}
        <div className="flex flex-col items-center justify-center pt-2">
          <svg className="w-28 h-16" viewBox="0 0 120 65">
            {/* Background Arch */}
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#EEF0F6"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Colored Active Arch */}
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#433690"
              strokeWidth="9"
              strokeDasharray={arcLength}
              strokeDashoffset={velOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            {/* Pivot and Needle */}
            <circle cx="60" cy="60" r="5" fill="#1E2232" />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="20"
              stroke="#433690"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${velAngle} 60 60)`}
              className="gauge-needle"
            />
          </svg>

          {/* Clean Non-Overlapping Digital Readout */}
          <div className="text-center mt-1">
            <div className="text-2xl font-bold font-mono text-[#1E2232] tracking-tight leading-none">
              {velocity.toFixed(2)} <span className="text-xs font-normal text-[#5D6375]">m/s</span>
            </div>
            <div className="flex items-center justify-center space-x-1 text-[11px] font-mono text-[#15804D] font-bold mt-1">
              {direction === 'UP' && <ArrowUp className="h-3 w-3 animate-bounce" />}
              {direction === 'DOWN' && <ArrowDown className="h-3 w-3 animate-bounce" />}
              {direction === 'STATIONARY' && <Minus className="h-3 w-3 text-slate-400" />}
              <span>{direction} &middot; 0.85 m/s³ JERK</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#DCDFEA] mt-2 flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#5D6375]">Rated Max:</span>
          <span className="font-bold text-[#1E2232]">2.50 m/s (Nominal)</span>
        </div>
      </div>

      {/* GAUGE 2: Microgrid Power & Regen */}
      <div className="luminous-cockpit-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#DCEFE4] text-[#15804D]">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-[#1E2232] tracking-tight">Microgrid Power</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCEFE4] text-[#15804D] font-bold border border-[#15804D]/30">
            {isRegen ? 'REGEN FEED' : 'MOTOR DRAW'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center pt-2">
          <svg className="w-28 h-16" viewBox="0 0 120 65">
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#EEF0F6"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke={isRegen ? '#15804D' : '#433690'}
              strokeWidth="9"
              strokeDasharray={arcLength}
              strokeDashoffset={powerOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <circle cx="60" cy="60" r="5" fill="#1E2232" />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="20"
              stroke={isRegen ? '#15804D' : '#433690'}
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${powerAngle} 60 60)`}
              className="gauge-needle"
            />
          </svg>

          <div className="text-center mt-1">
            <div className={`text-2xl font-bold font-mono tracking-tight leading-none ${isRegen ? 'text-[#15804D]' : 'text-[#433690]'}`}>
              {isRegen ? `+${absPower.toFixed(1)}` : `${absPower.toFixed(1)}`} <span className="text-xs font-normal text-[#5D6375]">kW</span>
            </div>
            <div className="text-[11px] font-mono text-[#5D6375] font-semibold mt-1">
              {isRegen ? 'Feeding Building Bus' : 'Active Traction Draw'}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#DCDFEA] mt-2 flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#5D6375]">Energy Offset:</span>
          <span className="font-bold text-[#15804D]">+148.5 kWh Today</span>
        </div>
      </div>

      {/* GAUGE 3: ISO 18738 Ride Quality */}
      <div className="luminous-cockpit-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#E6E3F7] text-[#433690]">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-[#1E2232] tracking-tight">ISO 18738 Quality</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCEFE4] text-[#15804D] font-bold border border-[#15804D]/30">
            CLASS A
          </span>
        </div>

        <div className="flex flex-col items-center justify-center pt-2">
          <svg className="w-28 h-16" viewBox="0 0 120 65">
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#EEF0F6"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#15804D"
              strokeWidth="9"
              strokeDasharray={arcLength}
              strokeDashoffset={vibOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <circle cx="60" cy="60" r="5" fill="#1E2232" />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="20"
              stroke="#1E2232"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${vibAngle} 60 60)`}
              className="gauge-needle"
            />
          </svg>

          <div className="text-center mt-1">
            <div className="text-2xl font-bold font-mono text-[#1E2232] tracking-tight leading-none">
              {vibrationRms.toFixed(3)} <span className="text-xs font-normal text-[#5D6375]">m/s²</span>
            </div>
            <div className="text-[11px] font-mono text-[#15804D] font-semibold mt-1">
              Vibration RMS (Nominal)
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#DCDFEA] mt-2 flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#5D6375]">Cabin Acoustic:</span>
          <span className="font-bold text-[#1E2232]">46.2 dBA (Silent Cab)</span>
        </div>
      </div>

      {/* GAUGE 4: Safety Chain & SLA */}
      <div className="luminous-cockpit-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCDFEA]">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#DCEFE4] text-[#15804D]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-[#1E2232] tracking-tight">Safety & Uptime</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCEFE4] text-[#15804D] font-bold border border-[#15804D]/30 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15804D] animate-ping"></span>
            <span>INTERLOCKED</span>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center pt-2">
          <svg className="w-28 h-16" viewBox="0 0 120 65">
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#EEF0F6"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 14,60 A 46,46 0 0,1 106,60"
              fill="none"
              stroke="#15804D"
              strokeWidth="9"
              strokeDasharray={arcLength}
              strokeDashoffset={availOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <circle cx="60" cy="60" r="5" fill="#1E2232" />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="20"
              stroke="#15804D"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${availAngle} 60 60)`}
              className="gauge-needle"
            />
          </svg>

          <div className="text-center mt-1">
            <div className="text-2xl font-bold font-mono text-[#1E2232] tracking-tight leading-none">
              {availabilityPct}%
            </div>
            <div className="text-[11px] font-mono text-[#5D6375] font-semibold mt-1">
              30d Fleet Uptime
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#DCDFEA] mt-2 flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#5D6375]">Safety Circuits:</span>
          <span className="font-bold text-[#15804D]">100% Closed & Tested</span>
        </div>
      </div>
    </div>
  );
}
