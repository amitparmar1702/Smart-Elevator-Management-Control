'use client';

import React, { useState } from 'react';
import { 
  FolderLock, 
  Siren, 
  Users, 
  Clock, 
  AlertOctagon, 
  ShieldAlert, 
  Plus, 
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  Radio,
  PhoneCall
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { audioService } from '@/lib/audioService';

export default function IncidentsSafetyPage() {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'P1_CRITICAL' | 'RESOLVED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elevator, setElevator] = useState('ELV-A-02 (Car 2)');
  const [incidentType, setIncidentType] = useState('PASSENGER_ENTRAPMENT');
  const [severity, setSeverity] = useState('P1_CRITICAL');
  const [trappedCount, setTrappedCount] = useState(1);
  const [assignedTo, setAssignedTo] = useState('Emergency Fast-Response Unit');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [activeIntercomId, setActiveIntercomId] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2026-08',
      elevator: 'ELV-A-01 (Car 1)',
      building: 'Apex Financial Tower A',
      type: 'PASSENGER_ENTRAPMENT',
      severity: 'P1_CRITICAL',
      trappedCount: 2,
      status: 'RESPONDING',
      assignedTo: 'Vikram Singh (Supervisor) & Fire Marshall',
      slaDeadline: '18 mins remaining (20m SLA)',
      createdAt: '12 mins ago',
    },
    {
      id: 'INC-2026-07',
      elevator: 'ELV-A-03 (Car 3)',
      building: 'Apex Financial Tower A',
      type: 'SAFETY_CHAIN_CIRCUIT_TRIP',
      severity: 'P2_HIGH',
      trappedCount: 0,
      status: 'RESOLVED',
      assignedTo: 'Arjun Rao (Technician)',
      slaDeadline: 'Met (Resolved in 34m)',
      createdAt: 'Yesterday',
    },
  ]);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    audioService.playAlarmTone();
    const newId = `INC-2026-0${incidents.length + 7}`;
    const newInc = {
      id: newId,
      elevator,
      building: 'Apex Financial Tower A',
      type: incidentType,
      severity,
      trappedCount: Number(trappedCount),
      status: 'RESPONDING',
      assignedTo,
      slaDeadline: severity === 'P1_CRITICAL' ? '20 mins remaining (20m SLA)' : '55 mins remaining (60m SLA)',
      createdAt: 'Just now',
    };
    setIncidents([newInc, ...incidents]);
    setIsModalOpen(false);
    setSuccessBanner(`Critical incident ${newId} logged for ${elevator}. Emergency escalation dispatched.`);
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Safety & Emergency' }, { label: 'Incident Escalations' }]}
      title="Incident Response & Passenger Safety Center"
      subtitle="Critical entrapment tracking, statutory emergency escalation matrix and audited resolution logs"
      actions={
        <Button
          variant="danger"
          size="sm"
          icon={<Siren className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Log Critical Incident (P1)
        </Button>
      }
    >
      {successBanner && (
        <div className="mb-4 p-3 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-[#15804D] hover:underline font-bold">Dismiss</button>
        </div>
      )}

      {/* 4-KPI Overview Strip */}
      <Card noPadding className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DCDFEA]">
          <div className="p-4 md:p-5">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Active P1 Entrapments</span>
            <div className="text-2xl font-bold font-mono text-[#C92D29] mt-1">1 Car</div>
            <span className="text-[11px] text-[#C92D29] font-medium block mt-1">2 Trapped (Rescue active)</span>
          </div>

          <div className="p-4 md:p-5">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Incidents Logged (Month)</span>
            <div className="text-2xl font-bold font-mono text-[#1E2232] mt-1">{incidents.length + 6} Events</div>
            <span className="text-[11px] text-[#15804D] font-medium block mt-1">100% resolved within SLA</span>
          </div>

          <div className="p-4 md:p-5">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">SLA Compliance Rate</span>
            <div className="text-2xl font-bold font-mono text-[#15804D] mt-1">98.4%</div>
            <span className="text-[11px] text-[#5D6375] font-medium block mt-1">Target: &gt; 95% (IS 17900)</span>
          </div>

          <div className="p-4 md:p-5">
            <span className="text-[11px] font-medium text-[#5D6375] uppercase tracking-wider block">Assigned Emergency Team</span>
            <div className="text-2xl font-bold font-mono text-[#433690] mt-1">3 Units</div>
            <span className="text-[11px] text-[#5D6375] font-medium block mt-1">Fire command & supervisor</span>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4">
        {[
          { key: 'ALL', label: 'All Incidents', count: incidents.length },
          { key: 'P1_CRITICAL', label: 'P1 Critical', count: incidents.filter((i) => i.severity === 'P1_CRITICAL').length },
          { key: 'RESOLVED', label: 'Resolved', count: incidents.filter((i) => i.status === 'RESOLVED').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterSeverity(tab.key as any)}
            className={`text-xs px-3 py-1.5 rounded-[6px] border font-medium transition-colors flex items-center space-x-1.5 ${
              filterSeverity === tab.key
                ? 'bg-[#433690] text-white border-[#433690]'
                : 'bg-white text-[#5D6375] border-[#DCDFEA] hover:text-[#1E2232]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterSeverity === tab.key ? 'bg-white/20 text-white' : 'bg-[#EEF0F6] text-[#5D6375]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {incidents
          .filter((inc) => {
            if (filterSeverity === 'P1_CRITICAL') return inc.severity === 'P1_CRITICAL';
            if (filterSeverity === 'RESOLVED') return inc.status === 'RESOLVED';
            return true;
          })
          .map((inc) => (
          <Card
            key={inc.id}
            noPadding
            className={inc.severity === 'P1_CRITICAL' ? 'border-2 border-[#C92D29] shadow-md' : 'border border-[#DCDFEA]'}
          >
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#DCDFEA]">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-[8px] ${
                      inc.severity === 'P1_CRITICAL' ? 'bg-[#FDF3F2] text-[#C92D29] animate-pulse' : 'bg-[#EEF0F6] text-[#5D6375]'
                    }`}
                  >
                    <Siren className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#433690] text-xs">{inc.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          inc.severity === 'P1_CRITICAL'
                            ? 'bg-[#C92D29] text-white'
                            : 'bg-[#FFF4E5] text-[#9C5C00]'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF0F6] text-[#1E2232] border border-[#DCDFEA]">
                        {inc.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1E2232] mt-1">{inc.type}</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#5D6375] block">SLA Response Window</span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      inc.severity === 'P1_CRITICAL' ? 'text-[#C92D29] animate-pulse' : 'text-[#1E2232]'
                    }`}
                  >
                    {inc.slaDeadline}
                  </span>
                </div>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[#5D6375] block text-[10px] uppercase font-mono">AFFECTED ASSET</span>
                  <span className="font-bold text-[#1E2232]">{inc.elevator}</span>
                  <span className="text-[#5D6375] text-[11px] block">{inc.building}</span>
                </div>

                <div>
                  <span className="text-[#5D6375] block text-[10px] uppercase font-mono">PASSENGERS IN CABIN</span>
                  <span
                    className={`font-mono font-extrabold text-sm ${
                      inc.trappedCount > 0 ? 'text-[#C92D29]' : 'text-[#1E2232]'
                    }`}
                  >
                    {inc.trappedCount} {inc.trappedCount === 1 ? 'Passenger' : 'Passengers'} Trapped
                  </span>
                </div>

                <div>
                  <span className="text-[#5D6375] block text-[10px] uppercase font-mono">RESPONSE DISPATCH</span>
                  <span className="font-semibold text-[#433690]">{inc.assignedTo}</span>
                </div>
              </div>

              {/* Two-Way Audio Intercom Section for Trapped Passengers */}
              {inc.trappedCount > 0 && (
                <div className="mt-4 pt-3 border-t border-[#DCDFEA]">
                  {activeIntercomId === inc.id ? (
                    <div className="p-3.5 rounded-[8px] bg-[#F4F2FC] border border-[#433690]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Radio className="h-4 w-4 text-[#15804D] animate-pulse" />
                          <span className="text-xs font-bold text-[#433690]">
                            Two-Way Cabin Intercom Active (EN 81-28 Compliant)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-[#DCEFE4] text-[#15804D] font-bold px-2 py-0.5 rounded">
                          VoIP Channel: Connected (82 dB)
                        </span>
                      </div>

                      {/* Simulated Audio Waveform */}
                      <div className="flex items-center space-x-1 h-6 px-3 bg-white border border-[#DCDFEA] rounded-[6px]">
                        {[35, 60, 85, 45, 95, 70, 40, 65, 90, 50, 80, 45, 75, 95, 60, 30, 85, 55, 90, 40].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-150 ${
                              isMicMuted ? 'bg-slate-200' : 'bg-[#433690]'
                            }`}
                            style={{ height: isMicMuted ? '4px' : `${Math.max(4, h * 0.22)}px` }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[11px] text-[#5D6375]">
                          {isMicMuted ? 'Microphone muted. Listening to cabin ambient sound.' : 'Broadcasting live audio to cabin speaker.'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsMicMuted(!isMicMuted)}
                            className={`px-3 py-1.5 rounded-[6px] font-medium text-xs flex items-center space-x-1.5 transition-colors ${
                              isMicMuted
                                ? 'bg-[#C92D29] text-white hover:bg-[#A82522]'
                                : 'bg-[#433690] text-white hover:bg-[#352A75]'
                            }`}
                          >
                            {isMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                            <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveIntercomId(null)}
                            className="px-3 py-1.5 rounded-[6px] border border-[#DCDFEA] bg-white text-[#1E2232] hover:bg-slate-50 text-xs font-medium"
                          >
                            End Call
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5D6375]">Direct duplex communication line to elevator cabin speaker</span>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<PhoneCall className="h-4 w-4" />}
                        onClick={() => setActiveIntercomId(inc.id)}
                      >
                        Open Cabin Intercom
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Log Critical Incident Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Critical Elevator Incident"
        subtitle="Initiate formal emergency tracking, countdown SLA timer, and broadcast to duty team"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E2232] mb-1">Affected Elevator</label>
            <select
              value={elevator}
              onChange={(e) => setElevator(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="ELV-A-01 (Car 1)">ELV-A-01 (Car 1 - High Speed North)</option>
              <option value="ELV-A-02 (Car 2)">ELV-A-02 (Car 2 - Standard North)</option>
              <option value="ELV-A-03 (Car 3)">ELV-A-03 (Car 3 - Freight & Service)</option>
              <option value="ELV-A-04 (Car 4)">ELV-A-04 (Car 4 - Firefighters Lift)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Incident Category</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                <option value="PASSENGER_ENTRAPMENT">Passenger Entrapment</option>
                <option value="SAFETY_CHAIN_CIRCUIT_TRIP">Safety Chain Trip</option>
                <option value="DOOR_ZONE_INTERLOCK_FAULT">Door Zone Interlock Fault</option>
                <option value="OVERSPEED_GOVERNOR_TRIP">Overspeed Governor Trip</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Severity SLA</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              >
                <option value="P1_CRITICAL">P1 - Critical (20m SLA)</option>
                <option value="P2_HIGH">P2 - High (60m SLA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Trapped Passengers</label>
              <input
                type="number"
                min="0"
                max="30"
                value={trappedCount}
                onChange={(e) => setTrappedCount(Number(e.target.value))}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2232] mb-1">Dispatched Responders</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Log Critical Incident
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

