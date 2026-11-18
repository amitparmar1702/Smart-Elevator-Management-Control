'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ApplicationStatusBar } from './ApplicationStatusBar';
import { CommandPalette } from './CommandPalette';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronRight, 
  Layers, 
  Activity, 
  LayoutGrid, 
  Smartphone, 
  Menu 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  breadcrumbs,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { activeRole, switchRole } = useAuthStore();
  const { setMobileDrawerOpen } = useThemeStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Automatic Pathname to Active Role Synchronization
  useEffect(() => {
    if (pathname.startsWith('/admin') && activeRole !== 'SUPER_ADMIN') {
      switchRole('SUPER_ADMIN');
    } else if (pathname.startsWith('/org') && activeRole !== 'ORGANISATION_ADMIN') {
      switchRole('ORGANISATION_ADMIN');
    } else if (pathname.startsWith('/technician') && activeRole !== 'TECHNICIAN') {
      switchRole('TECHNICIAN');
    } else if (pathname.startsWith('/resident') && activeRole !== 'RESIDENT') {
      switchRole('RESIDENT');
    } else if (pathname.startsWith('/control-room') && activeRole !== 'SECURITY_OPERATOR') {
      switchRole('SECURITY_OPERATOR');
    } else if (pathname.startsWith('/buildings') && activeRole !== 'BUILDING_MANAGER') {
      switchRole('BUILDING_MANAGER');
    } else if (pathname.startsWith('/audit') && activeRole !== 'AUDITOR') {
      switchRole('AUDITOR');
    }
  }, [pathname, activeRole, switchRole]);

  // Derive current page name for the Tab strip
  const tabName = title || (breadcrumbs && breadcrumbs[breadcrumbs.length - 1]?.label) || 'Overview';

  return (
    <div className="flex h-screen bg-[#EEF0F6] text-[#1E2232] overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <Topbar />

        {/* Tab Strip under Topbar */}
        <div className="h-9 px-3 sm:px-6 bg-[#FFFFFF] border-b border-[#DCDFEA] flex items-center justify-between shadow-xs overflow-x-auto">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="inline-flex items-center px-3 py-1 bg-[#EEF0F6] border-t-2 border-t-[#433690] border-x border-[#DCDFEA] rounded-t text-xs font-semibold text-[#433690]">
              {tabName}
            </div>
          </div>

          <div className="text-[11px] text-[#5D6375] font-mono hidden sm:block flex-shrink-0">
            ElevateOS &middot; Fleet Node Active
          </div>
        </div>

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 pb-20 md:pb-6">
          <div className="max-w-[1320px] mx-auto w-full">
            {/* Breadcrumbs & Header Bar */}
            {(breadcrumbs || title || actions) && (
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center space-x-1.5 text-xs text-[#5D6375] mb-1">
                      {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.label}>
                          {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                          {crumb.href ? (
                            <Link href={crumb.href} className="hover:text-[#433690] transition-colors">
                              {crumb.label}
                            </Link>
                          ) : (
                            <span className="font-semibold text-[#1E2232]">{crumb.label}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </nav>
                  )}
                  {title && (
                    <h1 className="text-xl md:text-2xl font-bold text-[#433690] tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#5D6375] mt-0.5 font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>

                {actions && <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">{actions}</div>}
              </div>
            )}

            {/* Page Body Content */}
            {children}
          </div>
        </main>

        {/* Dedicated Industrial Application Status Bar (Desktop/Tablet) */}
        <div className="hidden md:block">
          <ApplicationStatusBar />
        </div>

        {/* Mobile Persistent Bottom Navigation Dock (Phone viewports) */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#DCDFEA] flex items-center justify-around z-40 px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        >
          <Link
            href="/org/dashboard"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
              pathname.includes('/dashboard') ? 'text-[#433690] font-bold' : 'text-[#5D6375]'
            }`}
          >
            <Layers className="h-4 w-4 mb-0.5" />
            <span>Fleet</span>
          </Link>

          <Link
            href="/elevators/elv-a-01/live"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
              pathname.includes('/live') ? 'text-[#433690] font-bold' : 'text-[#5D6375]'
            }`}
          >
            <Activity className="h-4 w-4 mb-0.5" />
            <span>Cockpit</span>
          </Link>

          <Link
            href="/control-room/grid"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
              pathname.includes('/control-room') ? 'text-[#433690] font-bold' : 'text-[#5D6375]'
            }`}
          >
            <LayoutGrid className="h-4 w-4 mb-0.5" />
            <span>Grid</span>
          </Link>

          <Link
            href="/mobile"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
              pathname === '/mobile' || pathname.startsWith('/technician/mobile') ? 'text-[#433690] font-bold' : 'text-[#5D6375]'
            }`}
          >
            <Smartphone className="h-4 w-4 mb-0.5" />
            <span>Mobile</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] text-[#5D6375] hover:text-[#433690]"
            aria-label="Open navigation menu drawer"
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span>Menu</span>
          </button>
        </nav>
      </div>

      {/* Universal Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
