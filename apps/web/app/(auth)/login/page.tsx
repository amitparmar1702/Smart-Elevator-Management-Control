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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { audioService } from '@/lib/audioService';
import { UserRole } from '@elevateos/types';

interface DemoPersona {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  scope: string;
  target: string;
}

const demoPersonas: DemoPersona[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', name: 'Alexander Vance', email: 'superadmin@elevateos.io', scope: 'Global Platform', target: '/admin/dashboard' },
  { role: 'ORGANISATION_ADMIN', label: 'Organisation Admin', name: 'Rajesh Sharma', email: 'admin@apexproperties.com', scope: 'Apex Properties', target: '/org/dashboard' },
  { role: 'BUILDING_MANAGER', label: 'Building Manager', name: 'Marcus Sterling', email: 'manager@apexproperties.com', scope: 'Apex Tower A', target: '/buildings/bldg-apex-tower/dashboard' },
  { role: 'FACILITY_MANAGER', label: 'Facility Manager', name: 'Priya Patel', email: 'facility@apexproperties.com', scope: 'Logistics & Parking', target: '/operations/parking' },
  { role: 'SECURITY_OPERATOR', label: 'Security Operator', name: 'Carlos Mendez', email: 'security@apexproperties.com', scope: 'Control Room Grid', target: '/control-room/grid' },
  { role: 'EMERGENCY_OPERATOR', label: 'Emergency Operator', name: 'Dr. Elena Rostova', email: 'emergency@apexproperties.com', scope: 'Incident Response', target: '/safety/incidents' },
  { role: 'TECHNICIAN', label: 'Field Technician', name: 'Arjun Rao', email: 'tech@apexproperties.com', scope: 'Field Maintenance', target: '/technician/dashboard' },
  { role: 'TECHNICIAN_SUPERVISOR', label: 'Tech Supervisor', name: 'Vikram Singh', email: 'supervisor@apexproperties.com', scope: 'Work Orders & SLA', target: '/maintenance/work-orders' },
  { role: 'SERVICE_VENDOR_ADMIN', label: 'OEM Vendor Admin', name: 'Johan Lindqvist', email: 'vendor@kone-service.com', scope: 'KONE Service SLA', target: '/maintenance/work-orders' },
  { role: 'RESIDENT', label: 'Resident / Passenger', name: 'Ananya Gupta', email: 'resident@apexproperties.com', scope: 'Tower A · Floor 14', target: '/resident/dashboard' },
  { role: 'AUDITOR', label: 'Statutory Auditor', name: 'Claire Beaumont', email: 'auditor@compliance.gov', scope: 'Compliance Trail', target: '/audit/logs' },
  { role: 'PLATFORM_SUPPORT', label: 'Platform Support', name: 'Sarah Chen', email: 'support@elevateos.io', scope: 'IoT Edge Gateways', target: '/admin/gateways' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, switchRole } = useAuthStore();

  const [email, setEmail] = useState('admin@apexproperties.com');
  const [password, setPassword] = useState('Elevate@2026');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole>('ORGANISATION_ADMIN');
  const [mfaCode, setMfaCode] = useState('');
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSignIn = (account: DemoPersona) => {
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

  const handleRoleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setSelectedDemoRole(role);
    const persona = demoPersonas.find((p) => p.role === role);
    if (persona) {
      setEmail(persona.email);
      setPassword('Elevate@2026');
      setError(null);
    }
  };

  const handleQuickInstantLogin = () => {
    const persona = demoPersonas.find((p) => p.role === selectedDemoRole);
    if (persona) {
      executeSignIn(persona);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const matched = demoPersonas.find((d) => d.email.toLowerCase() === email.toLowerCase());

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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#EEF0F6] flex flex-col justify-center items-center py-8 px-4 sm:px-6 text-[#1E2232]">
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-5">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-[10px] bg-[#433690] text-white font-bold text-xl shadow-md mb-2.5 ring-4 ring-[#E6E3F7]">
          EO
        </div>
        <h1 className="text-2xl font-extrabold text-[#433690] tracking-tight">
          ElevateOS Portal
        </h1>
        <p className="text-xs text-[#5D6375] mt-0.5">
          Smart Elevator Fleet Operations & Mission-Control System
        </p>
      </div>

      {/* Main Single-Card Container (Eliminates all scrolling & overcrowding) */}
      <div className="w-full max-w-md bg-white p-6 sm:p-7 shadow-card border border-[#DCDFEA] rounded-[10px]">
        
        {error && (
          <div className="mb-4 p-2.5 rounded-[6px] bg-[#F8DDDC] border border-[#C92D29]/30 text-xs text-[#C92D29] flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Persona Selector Capsule */}
        <div className="mb-5 p-3 rounded-[8px] bg-[#F4F2FC] border border-[#433690]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#433690] uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-[#433690]" />
              <span>Demo Persona Switcher (12 Roles)</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#433690] border border-[#DCDFEA]">
              1-Click Sign-In
            </span>
          </div>

          <div className="flex space-x-2">
            <select
              value={selectedDemoRole}
              onChange={handleRoleDropdownChange}
              className="flex-1 h-9 text-xs bg-white border border-[#DCDFEA] rounded-[6px] px-2.5 font-medium text-[#1E2232] focus:ring-2 focus:ring-[#433690]"
            >
              {demoPersonas.map((p) => (
                <option key={p.role} value={p.role}>
                  {p.label} ({p.scope})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleQuickInstantLogin}
              className="h-9 px-3 rounded-[6px] bg-[#433690] hover:bg-[#352A75] text-white text-xs font-bold flex items-center space-x-1 transition-colors shadow-2xs flex-shrink-0"
              title="Instant sign-in as selected persona"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        {!isMfaStep ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">
                Corporate Email
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
                  className="block w-full pl-9 pr-3 h-10 min-h-[40px] text-xs bg-white border border-[#DCDFEA] rounded-[8px] focus:ring-2 focus:ring-[#433690] text-[#1E2232]"
                  placeholder="name@enterprise.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1E2232]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-[#433690] hover:underline">
                  Forgot?
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

            <div className="pt-1">
              <Button
                type="submit"
                className="w-full h-10"
                size="md"
                isLoading={isLoading}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Authenticate & Enter Cockpit
              </Button>
            </div>
          </form>
        ) : (
          /* MFA Step */
          <form onSubmit={handleLogin} className="space-y-3 text-center">
            <div className="inline-flex p-2 rounded-full bg-[#E6E3F7] text-[#433690] mb-1">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-[#1E2232]">Two-Factor Token Verification</h3>
            <p className="text-[11px] text-[#5D6375]">
              Demo TOTP: Enter <strong>123456</strong>
            </p>

            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="block w-full text-center tracking-widest text-lg font-mono h-11 border border-[#DCDFEA] rounded-[8px] bg-white focus:ring-2 focus:ring-[#433690] text-[#1E2232] font-bold"
              placeholder="123456"
            />

            <div className="flex space-x-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9"
                onClick={() => setIsMfaStep(false)}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-9"
                isLoading={isLoading}
              >
                Verify Token
              </Button>
            </div>
          </form>
        )}

        {/* Master Cross-Role Notice */}
        <div className="mt-4 pt-3.5 border-t border-[#DCDFEA] flex items-center space-x-2 text-[10px] text-[#5D6375]">
          <Crown className="h-3.5 w-3.5 text-[#433690] flex-shrink-0" />
          <span>Super & Org Admins have permanent cross-role access via Topbar.</span>
        </div>
      </div>
    </div>
  );
}