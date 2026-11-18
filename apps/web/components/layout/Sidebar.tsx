'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  Activity, 
  Calendar, 
  Wrench, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Radio, 
  Users, 
  Sliders, 
  Clock, 
  HardHat, 
  Cpu, 
  Home, 
  Key, 
  Bell, 
  PhoneCall, 
  Compass, 
  Zap, 
  X, 
  ChevronDown, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { audioService } from '@/lib/audioService';
import { UserRole } from '@elevateos/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  section: string;
  badge?: string;
  count?: number;
}

const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'PLATFORM_SUPPORT',
  'ORGANISATION_ADMIN',
  'BUILDING_MANAGER',
  'FACILITY_MANAGER',
  'SECURITY_OPERATOR',
  'RESIDENT',
  'TECHNICIAN',
  'TECHNICIAN_SUPERVISOR',
  'SERVICE_VENDOR_ADMIN',
  'AUDITOR',
  'EMERGENCY_OPERATOR',
];

const ADMIN_AND_OPS: UserRole[] = [
  'SUPER_ADMIN',
  'PLATFORM_SUPPORT',
  'ORGANISATION_ADMIN',
  'BUILDING_MANAGER',
  'FACILITY_MANAGER',
  'SECURITY_OPERATOR',
  'TECHNICIAN_SUPERVISOR',
  'AUDITOR',
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeRole, logout } = useAuthStore();
  const { sidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen } = useThemeStore();

  // Derive effective role from path or activeRole
  const effectiveRole = React.useMemo(() => {
    if (pathname.startsWith('/admin')) return 'SUPER_ADMIN';
    if (pathname.startsWith('/technician')) return 'TECHNICIAN';
    if (pathname.startsWith('/resident')) return 'RESIDENT';
    if (pathname.startsWith('/buildings')) return 'BUILDING_MANAGER';
    if (pathname.startsWith('/control-room')) return 'SECURITY_OPERATOR';
    return activeRole;
  }, [pathname, activeRole]);

  // Primary navigation (the 10 core workflows)
  const primaryNavItems: NavItem[] = [
    // Section: Fleet & Cockpit
    {
      label: effectiveRole === 'SUPER_ADMIN' ? 'Platform Overview' : 'Fleet Dashboard',
      href: effectiveRole === 'SUPER_ADMIN' ? '/admin/dashboard' : '/org/dashboard',
      icon: Layers,
      roles: ALL_ROLES,
      section: 'Fleet & Monitoring',
    },
    {
      label: 'Live Shaft Cockpit',
      href: '/elevators/elv-a-01/live',
      icon: Activity,
      roles: ALL_ROLES,
      badge: 'LIVE',
      section: 'Fleet & Monitoring',
    },
    {
      label: 'Elevator Fleet',
      href: '/org/elevators',
      icon: Cpu,
      roles: ADMIN_AND_OPS,
      section: 'Fleet & Monitoring',
    },
    {
      label: 'Control Room Grid',
      href: '/control-room/grid',
      icon: ShieldAlert,
      roles: ALL_ROLES,
      section: 'Fleet & Monitoring',
    },

    // Section: Operations & Maintenance
    {
      label: 'Work Orders & SLA',
      href: '/maintenance/work-orders',
      icon: Wrench,
      roles: ALL_ROLES,
      count: 3,
      section: 'Operations & Maintenance',
    },
    {
      label: 'Active Safety Alarms',
      href: '/safety/alarms',
      icon: Bell,
      roles: ALL_ROLES,
      count: 2,
      badge: 'ALERT',
      section: 'Operations & Maintenance',
    },
    {
      label: 'Destination Dispatch',
      href: '/operations/dispatch-simulator',
      icon: Compass,
      roles: ALL_ROLES,
      section: 'Operations & Maintenance',
    },
    {
      label: 'Elevator Calls Log',
      href: '/operations/calls',
      icon: Clock,
      roles: ALL_ROLES,
      section: 'Operations & Maintenance',
    },

    // Section: Analytics & Intelligence
    {
      label: 'Predictive Health AI',
      href: '/analytics/predictive',
      icon: Cpu,
      roles: ALL_ROLES,
      badge: 'AI',
      section: 'Intelligence & Compliance',
    },
    {
      label: 'Statutory Reports',
      href: '/reports',
      icon: FileText,
      roles: ALL_ROLES,
      section: 'Intelligence & Compliance',
    },
    {
      label: 'Compliance Audit Trail',
      href: '/audit/logs',
      icon: Sliders,
      roles: ALL_ROLES,
      section: 'Intelligence & Compliance',
    },
  ];

  // Secondary/Advanced operations (neatly toggleable)
  const advancedNavItems: NavItem[] = [
    {
      label: 'Command Hub & Portals',
      href: '/',
      icon: Home,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Fleet Comparison',
      href: '/elevators/comparison',
      icon: Layers,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Building Operations',
      href: '/buildings/bldg-apex-tower/dashboard',
      icon: Building2,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Buildings & Floors',
      href: '/org/buildings',
      icon: Building2,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Service Bookings',
      href: '/operations/bookings',
      icon: Calendar,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Floor Access Policies',
      href: '/operations/floor-access',
      icon: Key,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Sector Parking & Eco',
      href: '/operations/parking',
      icon: Zap,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Mobile Tech View',
      href: '/technician/mobile',
      icon: HardHat,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Global IoT Gateways',
      href: '/admin/gateways',
      icon: Radio,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Organisations & Plans',
      href: '/admin/organisations',
      icon: Building2,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Users & Permissions',
      href: '/admin/users',
      icon: Users,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Notification Channels',
      href: '/settings/notifications',
      icon: Bell,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
    {
      label: 'Resident Portal',
      href: '/resident/dashboard',
      icon: PhoneCall,
      roles: ALL_ROLES,
      section: 'Advanced Operations',
    },
  ];

  // Check if current page is in advanced items
  const isCurrentInAdvanced = advancedNavItems.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(isCurrentInAdvanced);

  // Auto-expand if navigating to an advanced route
  useEffect(() => {
    if (isCurrentInAdvanced) {
      setIsAdvancedOpen(true);
    }
  }, [isCurrentInAdvanced]);

  const userInitial = user?.firstName?.[0] || 'A';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Apex Operator';

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col flex-shrink-0 bg-white text-[#1E2232] border-r border-[#DCDFEA] select-none transition-all duration-200 ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
        } ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-[62px] px-4 border-b border-[#DCDFEA] flex items-center justify-between bg-white">
          <Link href="/" className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded bg-[#433690] flex items-center justify-center font-bold text-white shadow-sm text-sm flex-shrink-0">
              EO
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="font-bold text-sm tracking-tight text-[#1E2232] leading-tight">ElevateOS</div>
                <div className="text-[10px] text-[#5D6375] font-normal">Fleet Operating System</div>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-1.5 rounded text-[#5D6375] hover:text-[#1E2232] hover:bg-[#F3F5FA]"
            aria-label="Close navigation drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Signed-in User Block */}
        <div className={`p-3 border-b border-[#DCDFEA] bg-[#EEF0F6]/60 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center space-x-2.5">
            <div
              suppressHydrationWarning
              className="h-8 w-8 rounded-full bg-[#433690] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ring-1 ring-[#DCDFEA]"
              title={userName}
            >
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div suppressHydrationWarning className="text-xs font-semibold text-[#1E2232] truncate leading-tight">{userName}</div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span suppressHydrationWarning className="text-[10px] font-mono text-[#433690] font-bold truncate">{effectiveRole}</span>
                  {(effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ORGANISATION_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ORGANISATION_ADMIN') && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#E6E3F7] text-[#433690] font-bold border border-[#433690]/20" title="Super Admin and Organisation Admin have universal cross-role access to all 12 portals">
                      ALL ROLES
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links with Section Headings */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {primaryNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const prevItem = primaryNavItems[idx - 1];
            const isNewSection = !prevItem || prevItem.section !== item.section;

            return (
              <React.Fragment key={item.label}>
                {!sidebarCollapsed && isNewSection && (
                  <div className={`px-3 ${idx === 0 ? 'pb-1 pt-1' : 'pt-3 pb-1'} text-[10px] font-bold font-mono tracking-wider text-[#5D6375] uppercase select-none`}>
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center px-3 py-1.5 text-xs font-medium rounded-r transition-all ${
                    isActive
                      ? 'bg-[#E6E3F7] text-[#433690] font-bold border-l-[3px] border-[#433690] pl-[9px]'
                      : 'text-[#5D6375] hover:text-[#1E2232] hover:bg-[#F3F5FA]'
                  } ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-2.5'} min-w-0`}>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-[#433690]' : 'text-[#8D9AB8] group-hover:text-[#433690]'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && (
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {item.count && (
                        <span className="bg-[#C92D29] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.badge === 'LIVE'
                              ? 'bg-[#15804D] text-white'
                              : item.badge === 'ALERT'
                              ? 'bg-[#C92D29] text-white'
                              : 'bg-[#433690] text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </React.Fragment>
            );
          })}

          {/* Collapsible Advanced Operations Section */}
          {!sidebarCollapsed && (
            <div className="pt-2">
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold font-mono tracking-wider text-[#5D6375] hover:text-[#1E2232] uppercase transition-colors"
              >
                <span>More Operations</span>
                {isAdvancedOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#5D6375]" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#5D6375]" />
                )}
              </button>

              {isAdvancedOpen && (
                <div className="space-y-0.5 mt-0.5 pl-1 border-l border-[#DCDFEA] ml-2">
                  {advancedNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`group flex items-center justify-between px-2.5 py-1 text-xs font-medium rounded transition-all ${
                          isActive
                            ? 'bg-[#E6E3F7] text-[#433690] font-bold'
                            : 'text-[#5D6375] hover:text-[#1E2232] hover:bg-[#F3F5FA]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-[#433690]' : 'text-[#8D9AB8] group-hover:text-[#433690]'}`} />
                          <span className="truncate text-[11px]">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer Link Status & Sign Out */}
        <div className={`p-2.5 border-t border-[#DCDFEA] bg-[#F8FAFC] text-[10px] space-y-2 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {/* Sign Out Button */}
          <button
            onClick={() => {
              audioService.playCallRegistered();
              logout();
              setMobileDrawerOpen(false);
              router.push('/login');
            }}
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center p-1.5' : 'space-x-2 px-2.5 py-1.5'
            } text-xs font-semibold text-[#C92D29] hover:bg-[#F8DDDC]/60 rounded-[6px] transition-colors border border-transparent hover:border-[#C92D29]/30`}
            title={`Sign out of ${effectiveRole} session and return to login`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span suppressHydrationWarning>Sign Out ({effectiveRole})</span>}
          </button>

          {!sidebarCollapsed ? (
            <div className="pt-1.5 border-t border-[#DCDFEA]/60">
              <div className="flex items-center justify-between mb-0.5 text-[#5D6375]">
                <span>IoT Gateway Link</span>
                <span className="text-[#15804D] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#15804D] inline-block animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <div className="text-[#5D6375] text-[10px]">
                EMQX Port 1883 &middot; TLS 1.3
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="IoT Gateway Connected (TLS 1.3)">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15804D] inline-block animate-pulse"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
