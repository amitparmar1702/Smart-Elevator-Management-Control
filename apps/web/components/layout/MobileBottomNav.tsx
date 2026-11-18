'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Layers, 
  Activity, 
  Radio, 
  Wrench, 
  Menu 
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { audioService } from '@/lib/audioService';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setMobileDrawerOpen } = useThemeStore();

  const navItems = [
    {
      label: 'Fleet',
      href: '/org/dashboard',
      icon: Layers,
      isActive: pathname === '/org/dashboard' || pathname === '/admin/dashboard' || pathname === '/',
    },
    {
      label: 'Live Shaft',
      href: '/elevators/elv-a-01/live',
      icon: Activity,
      isActive: pathname.startsWith('/elevators/'),
    },
    {
      label: 'Control Grid',
      href: '/control-room/grid',
      icon: Radio,
      isActive: pathname.startsWith('/control-room'),
    },
    {
      label: 'Tech Mobile',
      href: '/technician/mobile',
      icon: Wrench,
      isActive: pathname.startsWith('/technician'),
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-[#DCDFEA] px-2 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => audioService.playCallRegistered()}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[56px] ${
              item.isActive
                ? 'text-[#433690] font-bold'
                : 'text-[#5D6375] hover:text-[#1E2232]'
            }`}
          >
            <div className={`p-1 rounded-md transition-all ${item.isActive ? 'bg-[#E6E3F7]' : 'bg-transparent'}`}>
              <Icon className={`h-5 w-5 ${item.isActive ? 'text-[#433690]' : 'text-[#5D6375]'}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        type="button"
        onClick={() => {
          audioService.playCallRegistered();
          setMobileDrawerOpen(true);
        }}
        aria-label="Open full application menu"
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[#5D6375] hover:text-[#1E2232] transition-all min-w-[56px]"
      >
        <div className="p-1 rounded-md bg-transparent">
          <Menu className="h-5 w-5 text-[#5D6375]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
          Menu
        </span>
      </button>
    </nav>
  );
}
