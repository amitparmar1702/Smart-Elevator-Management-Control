'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  Save, 
  Search,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { audioService } from '@/lib/audioService';

interface FloorAccessRow {
  floorNumber: number;
  floorName: string;
  wings: string[];
  publicAccess: boolean;
  residentAccess: boolean;
  staffAccess: boolean;
  vipOnly: boolean;
  nightLockout: boolean;
  currentStatus: 'OPEN' | 'SECURED' | 'VIP_ONLY' | 'LOCKDOWN';
}

export default function FloorAccessPage() {
  const [selectedBuilding, setSelectedBuilding] = useState('bldg-apex-tower');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'COMMERCIAL' | 'LOBBY' | 'BASEMENT' | 'VIP'>('ALL');
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleApplyFleet = () => {
    audioService.playCallRegistered();
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setSyncSuccess(true);
      audioService.playArrivalChime();
      setTimeout(() => setSyncSuccess(false), 5000);
    }, 800);
  };

  // Initial Floor Access Matrix
  const [floors, setFloors] = useState<FloorAccessRow[]>([
    { floorNumber: 20, floorName: 'Penthouse & Sky Lounge', wings: ['North', 'South'], publicAccess: false, residentAccess: false, staffAccess: true, vipOnly: true, nightLockout: true, currentStatus: 'VIP_ONLY' },
    { floorNumber: 19, floorName: 'Executive Suites (VIP)', wings: ['North'], publicAccess: false, residentAccess: false, staffAccess: true, vipOnly: true, nightLockout: true, currentStatus: 'VIP_ONLY' },
    { floorNumber: 15, floorName: 'High-Rise Commercial 15', wings: ['North', 'South'], publicAccess: false, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: true, currentStatus: 'SECURED' },
    { floorNumber: 10, floorName: 'Mid-Rise Commercial 10', wings: ['North', 'South'], publicAccess: false, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: true, currentStatus: 'SECURED' },
    { floorNumber: 5, floorName: 'Fitness Center & Wellness Spa', wings: ['East'], publicAccess: false, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: true, currentStatus: 'OPEN' },
    { floorNumber: 2, floorName: 'Business Conference Center', wings: ['East', 'West'], publicAccess: true, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: false, currentStatus: 'OPEN' },
    { floorNumber: 1, floorName: 'Main Lobby & Reception', wings: ['Main'], publicAccess: true, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: false, currentStatus: 'OPEN' },
    { floorNumber: 0, floorName: 'Ground Plaza & Retail', wings: ['Retail Arcade'], publicAccess: true, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: false, currentStatus: 'OPEN' },
    { floorNumber: -1, floorName: 'Basement Parking 1 (P1)', wings: ['Parking Garage'], publicAccess: true, residentAccess: true, staffAccess: true, vipOnly: false, nightLockout: false, currentStatus: 'OPEN' },
    { floorNumber: -2, floorName: 'Basement Parking 2 & Plant Room', wings: ['Engineering Vault'], publicAccess: false, residentAccess: false, staffAccess: true, vipOnly: false, nightLockout: true, currentStatus: 'SECURED' },
  ]);

  const toggleFloorAccess = (floorNum: number, field: 'publicAccess' | 'residentAccess' | 'staffAccess' | 'vipOnly' | 'nightLockout') => {
    setFloors((prev) =>
      prev.map((f) => {
        if (f.floorNumber === floorNum) {
          const updated = { ...f, [field]: !f[field] };
          if (field === 'vipOnly' && updated.vipOnly) {
            updated.publicAccess = false;
            updated.residentAccess = false;
            updated.currentStatus = 'VIP_ONLY';
          } else if (!updated.publicAccess && updated.residentAccess) {
            updated.currentStatus = 'SECURED';
          } else if (updated.publicAccess) {
            updated.currentStatus = 'OPEN';
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleToggleEmergencyLockdown = () => {
    const nextState = !emergencyLockdown;
    setEmergencyLockdown(nextState);
    if (nextState) {
      audioService.playAlarmTone();
      setFloors((prev) => prev.map((f) => ({ ...f, currentStatus: 'LOCKDOWN' })));
    } else {
      audioService.playCallRegistered();
      setFloors((prev) =>
        prev.map((f) => ({
          ...f,
          currentStatus: f.vipOnly ? 'VIP_ONLY' : f.publicAccess ? 'OPEN' : 'SECURED',
        }))
      );
    }
  };

  const filteredFloors = floors.filter((f) => {
    const matchesSearch =
      f.floorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(f.floorNumber).includes(searchQuery);
    if (!matchesSearch) return false;
    if (zoneFilter === 'COMMERCIAL') return f.floorNumber >= 10;
    if (zoneFilter === 'LOBBY') return f.floorNumber >= 0 && f.floorNumber < 10;
    if (zoneFilter === 'BASEMENT') return f.floorNumber < 0;
    if (zoneFilter === 'VIP') return f.vipOnly;
    return true;
  });

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Security & Access' }, { label: 'Floor Access Policies' }]}
      title="Floor Access Control & Security Policies"
      subtitle="Configure destination dispatch authorization, keycard clearance, VIP floor lockouts, and after-hours schedules"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={emergencyLockdown ? 'danger' : 'outline'}
            size="sm"
            onClick={handleToggleEmergencyLockdown}
            className={`flex items-center gap-2 ${emergencyLockdown ? 'animate-pulse' : ''}`}
          >
            <AlertOctagon className="w-4 h-4" />
            {emergencyLockdown ? 'DISABLE LOCKDOWN' : 'TRIGGER LOCKDOWN'}
          </Button>

          <Button
            size="sm"
            onClick={handleApplyFleet}
            disabled={isApplying}
            className="flex items-center gap-2"
          >
            <Save className={`w-4 h-4 ${isApplying ? 'animate-spin' : ''}`} />
            {isApplying ? 'Syncing to Fleet...' : 'Apply to Fleet'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Fleet Sync Confirmation */}
        {syncSuccess && (
          <div className="p-3 bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] rounded-lg text-xs font-medium flex items-center justify-between">
            <span>Floor access policies successfully pushed to all 12 building hoistway controllers & turnstiles.</span>
            <button onClick={() => setSyncSuccess(false)} className="hover:underline font-bold">Dismiss</button>
          </div>
        )}

        {/* Emergency Notice if Active */}
        {emergencyLockdown && (
          <div className="p-4 bg-[#C92D29] text-white rounded-lg shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 animate-bounce flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm tracking-wide uppercase">Emergency Facility Lockdown Enforced</h4>
                <p className="text-xs text-red-100">
                  All landing buttons and destination calls are disabled across all hoistways. Elevators recalled to ground floor for security/first responders.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleToggleEmergencyLockdown} className="bg-white text-[#C92D29] hover:bg-red-50 border-white flex-shrink-0">
              Release Lockdown
            </Button>
          </div>
        )}

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">Total Configured Floors</span>
            <div className="mt-1 text-2xl font-bold text-main font-mono">22 Floors</div>
            <span className="text-[11px] text-muted mt-1 block">Level -2 to Level 20</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">Public Access Floors</span>
            <div className="mt-1 text-2xl font-bold text-st-running font-mono">4 Floors</div>
            <span className="text-[11px] text-muted mt-1 block">Lobby, Retail, Parking, Conference</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Card-Secured Floors</span>
            <div className="mt-1 text-2xl font-bold text-[#433690] font-mono">6 Floors</div>
            <span className="text-[11px] text-[#5D6375] mt-1 block">Tenants & registered staff only</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">VIP / Penthouse Lockouts</span>
            <div className="mt-1 text-2xl font-bold text-st-warning font-mono">2 Floors</div>
            <span className="text-[11px] text-muted mt-1 block">Requires dual biometric / VIP PIN</span>
          </Card>
        </div>

        {/* Sector Zone Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: 'All Levels', count: floors.length },
            { key: 'COMMERCIAL', label: 'Commercial & Executive (L10 - L20)', count: floors.filter((f) => f.floorNumber >= 10).length },
            { key: 'LOBBY', label: 'Plaza & Amenities (L0 - L5)', count: floors.filter((f) => f.floorNumber >= 0 && f.floorNumber < 10).length },
            { key: 'BASEMENT', label: 'Parking & Vaults (B1 - B2)', count: floors.filter((f) => f.floorNumber < 0).length },
            { key: 'VIP', label: 'VIP Lockouts', count: floors.filter((f) => f.vipOnly).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setZoneFilter(tab.key as any)}
              className={`text-xs px-3 py-1.5 rounded-[6px] border font-medium transition-colors flex items-center space-x-1.5 ${
                zoneFilter === tab.key
                  ? 'bg-[#433690] text-white border-[#433690]'
                  : 'bg-white text-[#5D6375] border-[#DCDFEA] hover:text-[#1E2232]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  zoneFilter === tab.key ? 'bg-white/20 text-white' : 'bg-[#EEF0F6] text-[#5D6375]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Access Matrix Table */}
        <Card noPadding>
          <div className="p-3 border-b border-card-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search floor name or level..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-page border border-card-border rounded-lg h-10 px-3 w-full sm:w-64 text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <Clock className="w-4 h-4 text-muted flex-shrink-0" />
              <span>Night Lockout Schedule: <strong className="text-main">21:00 - 06:00 Daily</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-page/60 text-muted uppercase tracking-wider border-b border-card-border font-mono text-[11px]">
                <tr>
                  <th className="px-5 py-3">Floor Level</th>
                  <th className="px-5 py-3">Designation / Wing</th>
                  <th className="px-5 py-3 text-center">Public Unrestricted</th>
                  <th className="px-5 py-3 text-center">Resident / Keycard</th>
                  <th className="px-5 py-3 text-center">Staff & Facility Ops</th>
                  <th className="px-5 py-3 text-center">VIP Exclusive Pin</th>
                  <th className="px-5 py-3 text-center">Night Auto-Lock</th>
                  <th className="px-5 py-3">Security State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredFloors.map((floor) => (
                  <tr key={floor.floorNumber} className="hover:bg-page/40 transition-colors">
                    <td className="px-5 py-3 font-bold text-main font-floor">
                      Level {floor.floorNumber > 0 ? `+${floor.floorNumber}` : floor.floorNumber}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-main">{floor.floorName}</div>
                      <div className="text-[11px] text-muted">{floor.wings.join(', ')}</div>
                    </td>

                    {/* Public Access Toggle */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleFloorAccess(floor.floorNumber, 'publicAccess')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          floor.publicAccess ? 'bg-st-running-bg border-emerald-200 text-st-running' : 'bg-page border-card-border text-muted'
                        }`}
                      >
                        {floor.publicAccess ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Resident Access Toggle */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleFloorAccess(floor.floorNumber, 'residentAccess')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          floor.residentAccess ? 'bg-[#E6E3F7] border-[#433690]/30 text-[#433690]' : 'bg-[#EEF0F6] border-[#DCDFEA] text-[#5D6375]'
                        }`}
                      >
                        {floor.residentAccess ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Staff Access Toggle */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleFloorAccess(floor.floorNumber, 'staffAccess')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          floor.staffAccess ? 'bg-[#E6E3F7] border-[#433690]/30 text-[#433690]' : 'bg-[#EEF0F6] border-[#DCDFEA] text-[#5D6375]'
                        }`}
                      >
                        {floor.staffAccess ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* VIP Toggle */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleFloorAccess(floor.floorNumber, 'vipOnly')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          floor.vipOnly ? 'bg-st-warning-bg border-amber-200 text-st-warning' : 'bg-page border-card-border text-muted'
                        }`}
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Night Auto-Lock */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleFloorAccess(floor.floorNumber, 'nightLockout')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          floor.nightLockout ? 'bg-st-warning-bg border-amber-200 text-st-warning' : 'bg-page border-card-border text-muted'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Security State Badge */}
                    <td className="px-5 py-3">
                      <StatusBadge status={
                        floor.currentStatus === 'LOCKDOWN' ? 'ALARM' :
                        floor.currentStatus === 'VIP_ONLY' ? 'WARNING' :
                        floor.currentStatus === 'SECURED' ? 'MAINTENANCE' : 'RUNNING'
                      } />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

