'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, 
  ChevronDown, 
  Bell, 
  Menu, 
  ShieldCheck, 
  Radio,
  Search,
  Volume2,
  VolumeX,
  Crown,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { audioService } from '@/lib/audioService';
import { UserRole } from '@elevateos/types';

const roleDashboardMap: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  PLATFORM_SUPPORT: '/admin/gateways',
  ORGANISATION_ADMIN: '/org/dashboard',
  BUILDING_MANAGER: '/buildings/bldg-apex-tower/dashboard',
  FACILITY_MANAGER: '/operations/parking',
  SECURITY_OPERATOR: '/control-room/grid',
  TECHNICIAN: '/technician/dashboard',
  TECHNICIAN_SUPERVISOR: '/maintenance/work-orders',
  SERVICE_VENDOR_ADMIN: '/maintenance/work-orders',
  RESIDENT: '/resident/dashboard',
  AUDITOR: '/audit/logs',
  EMERGENCY_OPERATOR: '/safety/incidents',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeRole, switchRole, logout } = useAuthStore();
  const { toggleSidebar, setMobileDrawerOpen } = useThemeStore();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [selectedOrg, setSelectedOrg] = useState('Apex Commercial Properties');
  const [selectedBuilding, setSelectedBuilding] = useState('Apex Financial Tower A');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  React.useEffect(() => {
    setIsAudioMuted(audioService.getIsMuted());
  }, []);

  const handleToggleAudio = () => {
    const next = audioService.toggleMute();
    setIsAudioMuted(next);
  };

  const effectiveRole = React.useMemo(() => {
    // If user explicitly picked a role, and the current pathname matches its family, keep that role
    if (activeRole === 'SERVICE_VENDOR_ADMIN' && pathname.startsWith('/maintenance')) return 'SERVICE_VENDOR_ADMIN';
    if (activeRole === 'TECHNICIAN_SUPERVISOR' && pathname.startsWith('/maintenance')) return 'TECHNICIAN_SUPERVISOR';
    if (activeRole === 'PLATFORM_SUPPORT' && (pathname.startsWith('/admin/gateways') || pathname.startsWith('/admin'))) return 'PLATFORM_SUPPORT';
    if (activeRole === 'SUPER_ADMIN' && pathname.startsWith('/admin')) return 'SUPER_ADMIN';

    // Route-based default inference when browsing
    if (pathname.startsWith('/admin/gateways')) return 'PLATFORM_SUPPORT';
    if (pathname.startsWith('/admin')) return 'SUPER_ADMIN';
    if (pathname.startsWith('/technician')) return 'TECHNICIAN';
    if (pathname.startsWith('/maintenance')) return 'TECHNICIAN_SUPERVISOR';
    if (pathname.startsWith('/resident')) return 'RESIDENT';
    if (pathname.startsWith('/buildings')) return 'BUILDING_MANAGER';
    if (pathname.startsWith('/control-room')) return 'SECURITY_OPERATOR';
    if (pathname.startsWith('/safety/incidents')) return 'EMERGENCY_OPERATOR';
    if (pathname.startsWith('/operations/parking')) return 'FACILITY_MANAGER';
    if (pathname.startsWith('/audit')) return 'AUDITOR';
    if (pathname.startsWith('/org')) return 'ORGANISATION_ADMIN';
    return activeRole;
  }, [pathname, activeRole]);

  const availableRoles: UserRole[] = [
    'SUPER_ADMIN',
    'ORGANISATION_ADMIN',
    'BUILDING_MANAGER',
    'FACILITY_MANAGER',
    'SECURITY_OPERATOR',
    'EMERGENCY_OPERATOR',
    'TECHNICIAN',
    'TECHNICIAN_SUPERVISOR',
    'SERVICE_VENDOR_ADMIN',
    'RESIDENT',
    'AUDITOR',
    'PLATFORM_SUPPORT',
  ];

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setMobileDrawerOpen(true);
    } else {
      toggleSidebar();
    }
  };

  return (
    <header className="h-[62px] sticky top-0 z-30 bg-white border-b border-[#DCDFEA] px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: ☰ button + Brand Tagline + Location Selectors */}
      <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
        {/* ☰ Hamburger Button */}
        <button
          onClick={handleMenuClick}
          aria-label="Toggle navigation menu"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] border border-[#DCDFEA] bg-white text-[#1E2232] flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          <Menu className="h-5 w-5 text-[#433690]" />
        </button>

        {/* Brand Tagline */}
        <div className="hidden sm:block min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight text-[#1E2232]">
              ElevateOS
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-[#5D6375] font-normal truncate">
              Fleet Operations Application
            </span>
          </div>
        </div>

        <span className="hidden md:inline text-slate-300">/</span>

        {/* Organisation & Building Selectors */}
        <div className="hidden lg:flex items-center space-x-2 text-xs">
          <Building2 className="h-4 w-4 text-[#5D6375]" />
          <span className="font-medium text-[#1E2232]">{selectedOrg}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[#5D6375]">{selectedBuilding}</span>
          <span className="text-[10px] bg-slate-100 text-[#5D6375] px-1.5 py-0.5 rounded font-mono">
            4 Elevators
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Quick Command Search Pill (Ctrl+K) */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
          className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-[8px] border border-[#DCDFEA] bg-[#EEF0F6]/70 hover:bg-[#EEF0F6] text-xs text-[#5D6375] transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5 text-[#433690]" />
          <span>Quick Search...</span>
          <kbd className="text-[10px] bg-white border border-[#DCDFEA] px-1.5 py-0.2 rounded font-mono text-slate-500 font-semibold shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Acoustic Audio Chimes Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-[8px] border text-xs font-mono font-semibold transition-all shadow-xs ${
            !isAudioMuted
              ? 'bg-[#E6E3F7] text-[#433690] border-[#433690]/30 hover:bg-[#D8D3F3]'
              : 'bg-white text-[#5D6375] border-[#DCDFEA] hover:bg-slate-50'
          }`}
          title="Toggle acoustic arrival & call registration sounds (Web Audio API)"
        >
          {!isAudioMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="hidden lg:inline">{!isAudioMuted ? 'FX: ON' : 'FX: MUTED'}</span>
        </button>
        {/* Simulator Link Status */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs bg-[#DCEFE4] text-[#15804D] border border-[#15804D]/20 px-2.5 py-1 rounded-full font-medium">
          <Radio className="h-3 w-3 text-[#15804D] animate-pulse" />
          <span>Simulator Active</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (isRoleDropdownOpen) setIsRoleDropdownOpen(false);
            }}
            aria-label="View notifications"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] border border-[#DCDFEA] bg-white text-[#5D6375] flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C92D29]"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-sm bg-white border border-[#DCDFEA] rounded-[8px] shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-1.5 border-b border-[#DCDFEA] flex items-center justify-between">
                <span className="font-bold text-[#1E2232] text-xs">Fleet Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[10px] text-[#433690] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#DCDFEA] max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#C92D29]">Door obstruction warning</span>
                    <span className="text-[10px] text-[#5D6375]">2m ago</span>
                  </div>
                  <p className="text-[11px] text-[#5D6375] mt-0.5">ELV-A-01: Light curtain hold timeout on Floor 4</p>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#9C5C00]">Pre-trip overload alert</span>
                    <span className="text-[10px] text-[#5D6375]">18m ago</span>
                  </div>
                  <p className="text-[11px] text-[#5D6375] mt-0.5">ELV-A-03: Cabin load reached 98% rated capacity</p>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#15804D]">Work order assigned</span>
                    <span className="text-[10px] text-[#5D6375]">1h ago</span>
                  </div>
                  <p className="text-[11px] text-[#5D6375] mt-0.5">WO-1092 assigned to Arjun Rao (Door Lead)</p>
                </div>
              </div>
              <div className="p-2 border-t border-[#DCDFEA] text-center bg-[#F8FAFC]">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    router.push('/safety/alarms');
                  }}
                  className="text-xs text-[#433690] font-semibold hover:underline"
                >
                  View all active alarms &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Persona Switcher (Min 40px height, 8px radius) */}
        <div className="relative flex items-center space-x-1.5">
          {(effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ORGANISATION_ADMIN' || activeRole === 'SUPER_ADMIN' || activeRole === 'ORGANISATION_ADMIN') && (
            <span
              className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1 rounded-[6px] text-[10px] font-mono font-bold bg-[#E6E3F7] text-[#433690] border border-[#433690]/25 shadow-2xs"
              title="Super Admin & Organisation Admin have master cross-role bypass access to all 12 portals at all times"
            >
              <Crown className="h-3 w-3 text-[#433690]" />
              <span>All 12 Roles Unlocked</span>
            </span>
          )}

          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="h-9 sm:h-10 px-2 sm:px-3 rounded-[8px] border border-[#DCDFEA] bg-white hover:bg-slate-50 text-xs font-medium text-[#1E2232] flex items-center space-x-1.5 sm:space-x-2 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-[#433690] flex-shrink-0" />
            <span className="hidden sm:inline text-[#5D6375]">Role:</span>
            <strong className="text-[#433690] font-semibold max-w-[80px] xs:max-w-[120px] sm:max-w-none truncate" title={effectiveRole}>
              {effectiveRole}
            </strong>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] bg-white border border-[#DCDFEA] rounded-[8px] shadow-lg py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#5D6375] border-b border-slate-100 flex items-center justify-between">
                <span>Switch Operational Persona</span>
                <span className="text-[9px] font-bold text-[#433690]">12 Portals</span>
              </div>
              <div className="px-3 py-1 bg-[#EEF0F6] text-[10px] text-[#5D6375] border-b border-[#DCDFEA] flex items-center space-x-1">
                <Crown className="h-3 w-3 text-[#433690] flex-shrink-0" />
                <span>Super & Org Admins have full access across all portals.</span>
              </div>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    audioService.playCallRegistered();
                    switchRole(role);
                    setIsRoleDropdownOpen(false);
                    const target = roleDashboardMap[role];
                    if (target) {
                      router.push(target);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    effectiveRole === role
                      ? 'font-bold text-[#433690] bg-[#F4F2FC]'
                      : 'text-[#1E2232]'
                  }`}
                >
                  <span>{role}</span>
                  {effectiveRole === role && (
                    <span className="h-2 w-2 rounded-full bg-[#433690]"></span>
                  )}
                </button>
              ))}

              {/* End Session / Logout Option */}
              <div className="pt-1.5 border-t border-[#DCDFEA] mt-1 bg-[#F8FAFC]">
                <button
                  onClick={() => {
                    audioService.playCallRegistered();
                    logout();
                    setIsRoleDropdownOpen(false);
                    router.push('/login');
                  }}
                  className="w-full text-left px-3 py-2 flex items-center space-x-2 text-[#C92D29] hover:bg-[#F8DDDC]/60 transition-colors font-bold text-xs"
                >
                  <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Sign Out of Fleet Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated Quick Sign Out Button */}
        <button
          onClick={() => {
            audioService.playCallRegistered();
            logout();
            router.push('/login');
          }}
          aria-label="Sign out of current role"
          title={`Sign out of ${effectiveRole} session and return to login`}
          className="h-9 sm:h-10 px-2 sm:px-2.5 rounded-[8px] border border-[#DCDFEA] bg-white hover:bg-[#F8DDDC]/50 hover:border-[#C92D29]/40 text-[#5D6375] hover:text-[#C92D29] flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs font-semibold">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
