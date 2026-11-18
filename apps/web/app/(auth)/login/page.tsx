'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle,
  Zap,
  CheckCircle2,
  Crown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { audioService } from '@/lib/audioService';
import { UserRole } from '@elevateos/types';

interface DemoAccount {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  scope: string;
  desc: string;
  target: string;
  category: 'Executive & Admins' | 'Operations & Security' | 'Field Engineering' | 'Passenger & Audit';
  badgeStyle: string;
}

const allDemoAccounts: DemoAccount[] = [
  // Category 1: Executive & Admins
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    name: 'Alexander Vance',
    email: 'superadmin@elevateos.io',
    scope: 'Global Platform',
    desc: 'Cross-tenant oversight, global IoT gateway registry & billing tiers',
    target: '/admin/dashboard',
    category: 'Executive & Admins',
    badgeStyle: 'bg-[#E6E3F7] text-[#433690] border-[#433690]/30',
  },
  {
    role: 'ORGANISATION_ADMIN',
    label: 'Organisation Admin',
    name: 'Rajesh Sharma',
    email: 'admin@apexproperties.com',
    scope: 'Enterprise Portfolio',
    desc: 'Full control over Apex Commercial buildings, elevators, users & reports',
    target: '/org/dashboard',
    category: 'Executive & Admins',
    badgeStyle: 'bg-[#E6E3F7] text-[#433690] border-[#433690]/30',
  },
  {
    role: 'PLATFORM_SUPPORT',
    label: 'Platform Support',
    name: 'Sarah Chen',
    email: 'support@elevateos.io',
    scope: 'Edge Infrastructure',
    desc: 'Broker MQTT 5.0 diagnostics, gateway heartbeats & edge reconciliation',
    target: '/admin/gateways',
    category: 'Executive & Admins',
    badgeStyle: 'bg-[#E0E7FF] text-[#3730A3] border-[#3730A3]/30',
  },
  {
    role: 'BUILDING_MANAGER',
    label: 'Building Manager',
    name: 'Marcus Sterling',
    email: 'manager@apexproperties.com',
    scope: 'Apex Financial Tower A',
    desc: 'On-site facility operations, visitor security passes & VIP freight bookings',
    target: '/buildings/bldg-apex-tower/dashboard',
    category: 'Executive & Admins',
    badgeStyle: 'bg-[#EEF0F6] text-[#1E2232] border-[#DCDFEA]',
  },

  // Category 2: Operations & Security
  {
    role: 'SECURITY_OPERATOR',
    label: 'Security Operator',
    name: 'Carlos Mendez',
    email: 'security@apexproperties.com',
    scope: '24/7 Monitoring Room',
    desc: 'Real-time CCTV grid visualizer, door interlocks & emergency drill alarms',
    target: '/control-room/grid',
    category: 'Operations & Security',
    badgeStyle: 'bg-[#F8DDDC] text-[#C92D29] border-[#C92D29]/30',
  },
  {
    role: 'EMERGENCY_OPERATOR',
    label: 'Emergency Operator',
    name: 'Dr. Elena Rostova',
    email: 'emergency@apexproperties.com',
    scope: 'Crisis Escalation',
    desc: 'P1 entrapment response, emergency call routing & passenger assistance logs',
    target: '/safety/incidents',
    category: 'Operations & Security',
    badgeStyle: 'bg-[#F8DDDC] text-[#C92D29] border-[#C92D29]/30',
  },
  {
    role: 'FACILITY_MANAGER',
    label: 'Facility Manager',
    name: 'Priya Patel',
    email: 'facility@apexproperties.com',
    scope: 'Logistics & Parking',
    desc: 'Sector parking coordination, EV charging microgrid & eco-dispatch schedules',
    target: '/operations/parking',
    category: 'Operations & Security',
    badgeStyle: 'bg-[#EEF0F6] text-[#1E2232] border-[#DCDFEA]',
  },

  // Category 3: Field Engineering
  {
    role: 'TECHNICIAN',
    label: 'Field Technician',
    name: 'Arjun Rao',
    email: 'tech@apexproperties.com',
    scope: 'Field Maintenance',
    desc: 'Assigned digital work orders, statutory EN 81-20 checklists & parts consumption',
    target: '/technician/dashboard',
    category: 'Field Engineering',
    badgeStyle: 'bg-[#F6E9D2] text-[#9C5C00] border-[#9C5C00]/30',
  },
  {
    role: 'TECHNICIAN_SUPERVISOR',
    label: 'Tech Supervisor',
    name: 'Vikram Singh',
    email: 'supervisor@apexproperties.com',
    scope: 'Engineering Oversight',
    desc: 'Work order dispatch, return-to-service validation & SLA compliance tracking',
    target: '/maintenance/work-orders',
    category: 'Field Engineering',
    badgeStyle: 'bg-[#F6E9D2] text-[#9C5C00] border-[#9C5C00]/30',
  },
  {
    role: 'SERVICE_VENDOR_ADMIN',
    label: 'OEM Vendor Admin',
    name: 'Johan Lindqvist',
    email: 'vendor@kone-service.com',
    scope: 'Vendor SLA Management',
    desc: 'KONE service contract management, external technician roster & parts supply',
    target: '/maintenance/work-orders',
    category: 'Field Engineering',
    badgeStyle: 'bg-[#F6E9D2] text-[#9C5C00] border-[#9C5C00]/30',
  },

  // Category 4: Passenger & Audit
  {
    role: 'RESIDENT',
    label: 'Resident / Passenger',
    name: 'Ananya Gupta',
    email: 'resident@apexproperties.com',
    scope: 'Tower A · Floor 14',
    desc: 'Touchless hall call button, arrival countdown chime & VIP move-in bookings',
    target: '/resident/dashboard',
    category: 'Passenger & Audit',
    badgeStyle: 'bg-[#DCEFE4] text-[#15804D] border-[#15804D]/30',
  },
  {
    role: 'AUDITOR',
    label: 'Statutory Auditor',
    name: 'Claire Beaumont',
    email: 'auditor@compliance.gov',
    scope: 'Regulatory Authority',
    desc: 'Cryptographic immutable audit ledger, statutory certificates & inspection logs',
    target: '/audit/logs',
    category: 'Passenger & Audit',
    badgeStyle: 'bg-[#EEF0F6] text-[#5D6375] border-[#DCDFEA]',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, switchRole } = useAuthStore();

  const [email, setEmail] = useState('admin@apexproperties.com');
  const [password, setPassword] = useState('Elevate@2026');
  const [mfaCode, setMfaCode] = useState('');
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Executive & Admins',
    'Operations & Security',
    'Field Engineering',
    'Passenger & Audit',
  ];

  const filteredAccounts = activeCategory === 'ALL'
    ? allDemoAccounts
    : allDemoAccounts.filter((acc) => acc.category === activeCategory);

  const executeSignIn = (account: DemoAccount) => {
    audioService.playArrivalChime();
    const [firstName, ...lastParts] = account.name.split(' ');
    const lastName = lastParts.join(' ') || 'Officer';

    setUser({
      id: 'usr-' + account.role.toLowerCase(),
      email: account.email,
      firstName,
      lastName,
      role: account.role,
      organisationId: 'org-apex-01',
      buildingIds: ['bldg-apex-twr-a'],
      elevatorIds: ['elv-a-01', 'elv-a-02', 'elv-a-03', 'elv-a-04'],
      mfaEnabled: account.role === 'SUPER_ADMIN',
    });
    switchRole(account.role);
    router.push(account.target);
  };

  const handleSelectDemo = (demo: DemoAccount) => {
    audioService.playCallRegistered();
    setEmail(demo.email);
    setPassword('Elevate@2026');
    setError(null);
  };

  const handleInstantSignIn = (demo: DemoAccount) => {
    executeSignIn(demo);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate validation and role detection
    setTimeout(() => {
      setIsLoading(false);
      const matched = allDemoAccounts.find((d) => d.email.toLowerCase() === email.toLowerCase());

      if (email === 'superadmin@elevateos.io' && !isMfaStep) {
        setIsMfaStep(true);
        audioService.playCallRegistered();
        return;
      }

      if (matched) {
        executeSignIn(matched);
      } else {
        setError('Invalid credentials. Please select one of the pre-configured demo personas.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F6] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-[#1E2232]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-[10px] bg-[#433690] text-white font-bold text-2xl shadow-md mb-3 ring-4 ring-[#E6E3F7]">
          EO
        </div>
        <h2 className="text-3xl font-extrabold text-[#433690] tracking-tight">
          ElevateOS Enterprise Cockpit
        </h2>
        <p className="mt-1 text-sm text-[#5D6375] font-medium">
          Mission-Critical Smart Elevator Fleet Operations, Monitoring & Control System
        </p>

        {/* Master Role Notice */}
        <div className="mt-3.5 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E6E3F7] text-[#433690] border border-[#433690]/25 text-xs font-semibold shadow-xs">
          <Crown className="h-4 w-4 text-[#433690] flex-shrink-0" />
          <span>Super Admin & Organisation Admin have master bypass access to all 12 roles at all times</span>
        </div>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-7 px-5 sm:px-8 md:px-10 shadow-card border border-[#DCDFEA] rounded-[10px]">
          
          {error && (
            <div className="mb-5 p-3 rounded-[6px] bg-[#F8DDDC] border border-[#C92D29]/30 text-xs text-[#C92D29] flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Top Credentials Form */}
          <div className="mb-7 pb-7 border-b border-[#DCDFEA]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1E2232] tracking-tight">
                Enterprise Authentication
              </h3>
              <span className="text-[11px] font-mono text-[#5D6375]">
                Role-Based Access Control (IS 17900 & EN 81-20 Compliant)
              </span>
            </div>

            {!isMfaStep ? (
              <form onSubmit={handleLogin} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-[#1E2232] mb-1">
                    Corporate Identity
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 h-10 min-h-[40px] text-xs bg-white border border-[#DCDFEA] rounded-[8px] focus:ring-2 focus:ring-[#433690] text-[#1E2232] font-medium"
                      placeholder="name@enterprise.com"
                    />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1E2232]">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] text-[#433690] hover:underline">
                      Reset?
                    </Link>
                  </div>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 h-10 min-h-[40px] text-xs bg-white border border-[#DCDFEA] rounded-[8px] focus:ring-2 focus:ring-[#433690] text-[#1E2232]"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 flex items-end">
                  <Button
                    type="submit"
                    className="w-full h-10"
                    size="md"
                    isLoading={isLoading}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    Authenticate
                  </Button>
                </div>
              </form>
            ) : (
              /* MFA TOTP Verification Step */
              <form onSubmit={handleLogin} className="p-4 bg-[#EEF0F6]/70 rounded-[8px] border border-[#DCDFEA] space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-[#E6E3F7] text-[#433690] flex-shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E2232]">Multi-Factor Security Token (TOTP)</h4>
                    <p className="text-[11px] text-[#5D6375]">
                      Enter the 6-digit code generated by your authenticator app (Demo: enter <strong>123456</strong>)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="block w-48 text-center tracking-widest text-base font-mono h-10 border border-[#DCDFEA] rounded-[8px] bg-white focus:ring-2 focus:ring-[#433690] text-[#1E2232] font-bold"
                    placeholder="123456"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMfaStep(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isLoading}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Verify & Enter Cockpit
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* 12 Role Persona Quick Selection Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
              <div>
                <span className="text-xs font-bold text-[#1E2232] uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#433690]" />
                  <span>All 12 Enterprise Role Portals (Instant 1-Click Access)</span>
                </span>
                <p className="text-[11px] text-[#5D6375] mt-0.5">
                  Click <strong>⚡ Instant Sign In</strong> on any role to immediately open its dedicated workstation.
                </p>
              </div>

              {/* Category Segmented Filter */}
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-[#433690] text-white shadow-2xs'
                        : 'bg-[#EEF0F6] text-[#5D6375] hover:bg-slate-200 border border-[#DCDFEA]'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Roles (12)' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
              {filteredAccounts.map((acc) => {
                const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                const isSuperOrOrg = acc.role === 'SUPER_ADMIN' || acc.role === 'ORGANISATION_ADMIN';

                return (
                  <div
                    key={acc.role}
                    className={`p-3 rounded-[8px] border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#433690] bg-[#F5F3FC] ring-1 ring-[#433690]/30 shadow-xs'
                        : 'border-[#DCDFEA] hover:border-[#433690]/40 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      {/* Top Row: Role Title & Scope */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          {isSuperOrOrg && <Crown className="h-3 w-3 text-[#433690] flex-shrink-0" />}
                          <span className="font-bold text-xs text-[#1E2232] truncate">
                            {acc.label}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${acc.badgeStyle}`}>
                          {acc.scope}
                        </span>
                      </div>

                      {/* User Name & Email */}
                      <div className="text-[11px] font-semibold text-[#433690]">
                        {acc.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#5D6375] truncate mt-0.5">
                        {acc.email}
                      </div>

                      {/* Brief description */}
                      <p className="text-[10px] text-[#5D6375] leading-relaxed mt-1.5 line-clamp-2">
                        {acc.desc}
                      </p>
                    </div>

                    {/* Bottom Actions: Auto-fill vs Instant Sign-In */}
                    <div className="mt-2.5 pt-2 border-t border-[#DCDFEA] flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectDemo(acc)}
                        className="text-[10px] text-[#5D6375] hover:text-[#433690] font-medium transition-colors"
                      >
                        Fill Form
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInstantSignIn(acc)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-[6px] text-[10px] font-bold bg-[#E6E3F7] text-[#433690] hover:bg-[#433690] hover:text-white transition-all shadow-2xs border border-[#433690]/20"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Instant Sign In</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}