'use client';

import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, Cpu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function ApplicationStatusBar() {
  const { activeRole } = useAuthStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="hidden lg:flex h-7 bg-[#FFFFFF] border-t border-[#DCDFEA] px-3 sm:px-6 items-center justify-between text-[11px] font-mono text-[#5D6375] select-none flex-shrink-0 z-20">
      {/* Left: System Telemetry Indicators */}
      <div className="flex items-center space-x-3 sm:space-x-5 overflow-hidden">
        <div className="flex items-center space-x-1.5 text-[#15804D] font-medium flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15804D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15804D]"></span>
          </span>
          <span className="font-semibold">SYS: ONLINE</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-[#433690] flex-shrink-0">
          <Radio className="h-3 w-3" />
          <span>MQTT 5.0 (TLS 1.3) : 12ms</span>
        </div>

        <div className="hidden md:flex items-center space-x-1 flex-shrink-0">
          <ShieldCheck className="h-3 w-3 text-[#15804D]" />
          <span>SAFETY CHAIN: INTERLOCKED (EN 81-20/50)</span>
        </div>

        <div className="hidden lg:flex items-center space-x-1 flex-shrink-0">
          <Cpu className="h-3 w-3 text-slate-400" />
          <span>BROKER: EMQX:8883 (ACTIVE)</span>
        </div>
      </div>

      {/* Right: Operational Scopes & Version */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-slate-400">UNITS:</span>
          <span className="font-semibold text-[#1E2232]">4/4 MONITORED</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-slate-400">SCOPE:</span>
          <span suppressHydrationWarning className="font-semibold text-[#433690]">{activeRole}</span>
        </div>

        <div className="hidden sm:block text-slate-300">|</div>

        <div suppressHydrationWarning className="hidden sm:block text-slate-400">
          {time}
        </div>

        <div className="bg-[#E6E3F7] text-[#433690] text-[10px] font-bold px-1.5 py-0.5 rounded">
          APP v1.0.4
        </div>
      </div>
    </footer>
  );
}
