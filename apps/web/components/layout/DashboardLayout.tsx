'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ApplicationStatusBar } from './ApplicationStatusBar';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPalette } from './CommandPalette';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 pb-20 lg:pb-6">
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

        {/* Dedicated Industrial Application Status Bar (Desktop) */}
        <ApplicationStatusBar />

        {/* Dedicated Mobile Bottom Navigation (Smartphones & Tablets < 1024px) */}
        <MobileBottomNav />
      </div>

      {/* Universal Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
