'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  Building2,
  Activity,
  Wrench,
  ShieldAlert,
  Users,
  Radio,
  Layers,
  Zap,
  Calendar,
  Key,
  FileText,
  Sliders,
  CornerDownLeft,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '@elevateos/types';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Elevator Asset' | 'Building' | 'Quick Action' | 'Safety';
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  shortcut?: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { switchRole } = useAuthStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-home', title: 'Fleet Operations Workstation', category: 'Navigation', icon: Layers, href: '/' },
    { id: 'nav-live', title: 'Live Animated Shaft Cockpit (Digital Twin)', category: 'Navigation', icon: Activity, href: '/elevators/elv-a-01/live', shortcut: 'ELV-A-01' },
    { id: 'nav-comparison', title: 'Fleet Performance Benchmark', category: 'Navigation', icon: Sliders, href: '/elevators/comparison' },
    { id: 'nav-control', title: 'Security Control Room Grid & CCTV', category: 'Navigation', icon: ShieldAlert, href: '/control-room/grid' },
    { id: 'nav-buildings', title: 'Property Portfolio & Floor Hierarchy', category: 'Navigation', icon: Building2, href: '/org/buildings' },
    { id: 'nav-elevators', title: 'Elevator Asset Inventory & Capabilities', category: 'Navigation', icon: Layers, href: '/org/elevators' },
    { id: 'nav-calls', title: 'Landing Call & Destination Dispatch', category: 'Navigation', icon: Radio, href: '/operations/calls' },
    { id: 'nav-bookings', title: 'Elevator Reservation & Scheduling', category: 'Navigation', icon: Calendar, href: '/operations/bookings' },
    { id: 'nav-floor-access', title: 'Floor Access Security Matrix', category: 'Navigation', icon: Key, href: '/operations/floor-access' },
    { id: 'nav-parking', title: 'Energy & Sector Parking Optimization', category: 'Navigation', icon: Zap, href: '/operations/parking' },
    { id: 'nav-workorders', title: 'Maintenance Work Orders & Checklists', category: 'Navigation', icon: Wrench, href: '/maintenance/work-orders' },
    { id: 'nav-alarms', title: 'Active Safety Alarms & Interlock Triage', category: 'Navigation', icon: ShieldAlert, href: '/safety/alarms' },
    { id: 'nav-incidents', title: 'Emergency Trapped Passenger Incident Center', category: 'Navigation', icon: ShieldAlert, href: '/safety/incidents' },
    { id: 'nav-tech-dash', title: 'Technician Work Order Hub', category: 'Navigation', icon: Wrench, href: '/technician/dashboard' },
    { id: 'nav-tech-mob', title: 'Mobile Field Technician View', category: 'Navigation', icon: Wrench, href: '/technician/mobile' },
    { id: 'nav-analytics-fleet', title: 'Fleet Analytics & Traffic Heatmaps', category: 'Navigation', icon: Activity, href: '/analytics/fleet' },
    { id: 'nav-predictive', title: 'Predictive Health & Remaining Useful Life (RUL)', category: 'Navigation', icon: Activity, href: '/analytics/predictive' },
    { id: 'nav-gateways', title: 'Global IoT Gateways Watchdog', category: 'Navigation', icon: Radio, href: '/admin/gateways' },
    { id: 'nav-users', title: 'RBAC 12-Role User Directory', category: 'Navigation', icon: Users, href: '/admin/users' },
    { id: 'nav-audit', title: 'Statutory Compliance Audit Log', category: 'Navigation', icon: FileText, href: '/audit/logs' },

    // Assets
    { id: 'asset-elv-1', title: 'Car ELV-A-01 · High-Speed Passenger (KONE)', category: 'Elevator Asset', icon: Activity, href: '/elevators/elv-a-01/live', keywords: ['kone', 'car 1', 'floor 4'] },
    { id: 'asset-elv-2', title: 'Car ELV-A-02 · Standard Passenger (Otis)', category: 'Elevator Asset', icon: Activity, href: '/org/elevators', keywords: ['otis', 'car 2', 'floor 1'] },
    { id: 'asset-elv-3', title: 'Car ELV-A-03 · Freight & Service (Schindler)', category: 'Elevator Asset', icon: Activity, href: '/org/elevators', keywords: ['schindler', 'car 3', 'freight'] },
    { id: 'asset-elv-4', title: 'Car ELV-A-04 · Fire & Emergency (TK Elevator)', category: 'Elevator Asset', icon: Activity, href: '/org/elevators', keywords: ['tk', 'tke', 'car 4', 'fire'] },

    // Buildings
    { id: 'bldg-apex', title: 'Apex Financial Tower A (22 Levels · BKC)', category: 'Building', icon: Building2, href: '/org/buildings', keywords: ['bkc', 'mumbai', 'apex'] },
    { id: 'bldg-emr', title: 'Emerald Business Bay Core (34 Levels · Marine)', category: 'Building', icon: Building2, href: '/org/buildings', keywords: ['emerald', 'marine promenade'] },
    { id: 'bldg-hrz', title: 'Grand Horizon Residence (18 Levels · Worli)', category: 'Building', icon: Building2, href: '/org/buildings', keywords: ['worli', 'horizon', 'residential'] },

    // Quick Actions / Persona Switch
    { id: 'act-role-sec', title: 'Switch Persona > Security Operator', category: 'Quick Action', icon: ShieldAlert, action: () => { switchRole('SECURITY_OPERATOR'); router.push('/control-room/grid'); } },
    { id: 'act-role-tech', title: 'Switch Persona > Field Technician', category: 'Quick Action', icon: Wrench, action: () => { switchRole('TECHNICIAN'); router.push('/technician/dashboard'); } },
    { id: 'act-role-admin', title: 'Switch Persona > Organisation Admin', category: 'Quick Action', icon: Users, action: () => { switchRole('ORGANISATION_ADMIN'); router.push('/org/dashboard'); } },
    { id: 'act-dispatch-ground', title: 'Dispatch Command > Recall Car 1 to Floor 1', category: 'Quick Action', icon: Radio, href: '/operations/calls' },
  ];

  const filtered = commands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const matchTitle = cmd.title.toLowerCase().includes(q);
    const matchCategory = cmd.category.toLowerCase().includes(q);
    const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchTitle || matchCategory || matchKeywords;
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-[12px] shadow-2xl border border-[#DCDFEA] overflow-hidden z-50 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#DCDFEA] flex items-center space-x-3 bg-white">
          <Search className="h-5 w-5 text-[#433690] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, route, asset code (ELV-A-01), or building..."
            className="w-full text-sm bg-transparent outline-none text-[#1E2232] placeholder-slate-400 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-slate-400 hover:text-[#1E2232] hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 flex-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5D6375]">
              No operational commands or assets matching <span className="font-bold text-[#1E2232]">"{query}"</span>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#F4F2FC] text-[#433690] font-semibold'
                      : 'text-[#1E2232] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-[6px] flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#433690] text-white'
                          : 'bg-[#EEF0F6] text-[#5D6375]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="block truncate">{item.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#5D6375]">
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-[#433690]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Info */}
        <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#DCDFEA] flex items-center justify-between text-[11px] text-[#5D6375] font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="hidden sm:block">
            ElevateOS Cockpit Navigation
          </div>
        </div>
      </div>
    </div>
  );
}
