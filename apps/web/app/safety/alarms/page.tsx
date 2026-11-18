'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Wrench,
  PhoneCall,
  Check,
  CheckCheck,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { CreateWorkOrderFromAlarmModal, AlarmItem } from '../../../components/modals/CreateWorkOrderFromAlarmModal';
import { EmergencyIntercomModal } from '../../../components/modals/EmergencyIntercomModal';

export type AlarmLifecycleState = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlarmRecord {
  id: string;
  elevator: string;
  building: string;
  code: string;
  type: string;
  description: string;
  severity: string;
  detectedAt: string;
  status: AlarmLifecycleState;
  ackBy?: string;
  resolvedBy?: string;
  workOrderId?: string;
}

export default function AlarmsSafetyPage() {
  const [alarms, setAlarms] = useState<AlarmRecord[]>([
    {
      id: 'ALM-901',
      elevator: 'ELV-A-01 (Car 1 High-Speed)',
      building: 'Apex Financial Tower A',
      code: 'E-204',
      type: 'Door obstruction',
      description: 'Door sensor light-curtain obstructed longer than 25 seconds on Floor 4',
      severity: 'WARNING',
      detectedAt: '2 mins ago',
      status: 'NEW',
    },
    {
      id: 'ALM-898',
      elevator: 'ELV-A-03 (Car 3 Freight)',
      building: 'Apex Financial Tower A',
      code: 'E-401',
      type: 'Load pre-trip overload',
      description: 'Cabin load reached 98% of rated 2,000 kg capacity on Floor 2',
      severity: 'WARNING',
      detectedAt: '18 mins ago',
      status: 'ACKNOWLEDGED',
      ackBy: 'Santosh Yadav (Security)',
      workOrderId: 'WO-1092',
    },
    {
      id: 'ALM-892',
      elevator: 'ELV-A-02 (Car 2 Passenger)',
      building: 'Apex Financial Tower A',
      code: 'E-102',
      type: 'Controller communication stutter',
      description: 'Transient RS-485 bus packet drop recovered after automated retry',
      severity: 'INFO',
      detectedAt: '2 hrs ago',
      status: 'RESOLVED',
      ackBy: 'Rajesh Sharma (Admin)',
      resolvedBy: 'Auto-recovery verified',
    },
  ]);

  const [filterState, setFilterState] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('OPEN');
  const [selectedAlarmForWo, setSelectedAlarmForWo] = useState<AlarmItem | null>(null);
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [isIntercomOpen, setIsIntercomOpen] = useState(false);
  const [activeIntercomElv, setActiveIntercomElv] = useState('Elevator ELV-A-01 (Car 1 High-Speed)');

  const handleAcknowledge = (id: string) => {
    setAlarms(
      alarms.map((a) =>
        a.id === id ? { ...a, status: 'ACKNOWLEDGED', ackBy: 'Rajesh Sharma (Admin)' } : a
      )
    );
  };

  const handleResolve = (id: string) => {
    setAlarms(
      alarms.map((a) =>
        a.id === id ? { ...a, status: 'RESOLVED', resolvedBy: 'Rajesh Sharma (Admin)' } : a
      )
    );
  };

  const handleCreateWo = (alarm: AlarmRecord) => {
    setSelectedAlarmForWo({
      id: alarm.id,
      elevator: alarm.elevator,
      building: alarm.building,
      code: alarm.code,
      type: alarm.type,
      description: alarm.description,
      severity: alarm.severity,
    });
    setIsWoModalOpen(true);
  };

  const handleWoCreated = (woId: string) => {
    if (selectedAlarmForWo) {
      setAlarms(
        alarms.map((a) =>
          a.id === selectedAlarmForWo.id
            ? { ...a, status: 'ACKNOWLEDGED', workOrderId: woId, ackBy: 'Rajesh Sharma (Admin)' }
            : a
        )
      );
    }
  };

  const filteredAlarms = alarms.filter((a) => {
    if (filterState === 'OPEN') return a.status === 'NEW' || a.status === 'ACKNOWLEDGED';
    if (filterState === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Safety & Alarms' }, { label: 'Active Fleet Alarms' }]}
      title="Active Alarm Monitoring & Fault Feed"
      subtitle="Supervisory 3-state alarm lifecycle console with 1-click work order creation and emergency intercom"
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsIntercomOpen(true)}
            icon={<PhoneCall className="h-4 w-4" />}
          >
            Emergency intercom test
          </Button>
        </div>
      }
    >
      {/* 3-State Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs font-semibold text-[#5D6375] mr-1 flex items-center space-x-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Status filter:</span>
        </span>
        {[
          { label: 'Open alarms', value: 'OPEN', count: alarms.filter((a) => a.status !== 'RESOLVED').length },
          { label: 'All alarms', value: 'ALL', count: alarms.length },
          { label: 'Resolved alarms', value: 'RESOLVED', count: alarms.filter((a) => a.status === 'RESOLVED').length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterState(tab.value as any)}
            className={`text-xs px-3 py-1.5 rounded-[6px] border font-medium transition-colors flex items-center space-x-1.5 ${
              filterState === tab.value
                ? 'bg-[#433690] text-white border-[#433690]'
                : 'bg-white text-[#5D6375] border-[#DCDFEA] hover:text-[#1E2232]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterState === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-[#EEF0F6] text-[#5D6375]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alarm Cards List */}
      <div className="space-y-4">
        {filteredAlarms.length === 0 ? (
          <Card className="text-center py-10">
            <CheckCircle2 className="h-8 w-8 text-[#15804D] mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-[#1E2232]">
              No active alarms found in this view
            </h4>
            <p className="text-xs text-[#5D6375] mt-1">
              All statutory safety chain interlocks and door controllers operating nominally.
            </p>
          </Card>
        ) : (
          filteredAlarms.map((alarm) => (
            <Card
              key={alarm.id}
              noPadding
              className={`border-l-4 ${
                alarm.status === 'RESOLVED'
                  ? 'border-l-[#15804D]'
                  : alarm.status === 'ACKNOWLEDGED'
                  ? 'border-l-[#9C5C00]'
                  : 'border-l-[#C92D29]'
              }`}
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start space-x-3">
                  {alarm.status === 'RESOLVED' ? (
                    <CheckCircle2 className="h-5 w-5 text-[#15804D] mt-0.5 flex-shrink-0" />
                  ) : alarm.status === 'ACKNOWLEDGED' ? (
                    <Clock className="h-5 w-5 text-[#9C5C00] mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[#C92D29] mt-0.5 flex-shrink-0 animate-pulse" />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#433690] text-xs">
                        {alarm.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#EEF0F6] font-bold text-[#5D6375] border border-[#DCDFEA]">
                        CODE: {alarm.code}
                      </span>
                      <StatusBadge status={alarm.status} size="sm" />
                      {alarm.workOrderId && (
                        <span className="text-[10px] font-mono font-bold text-[#5543C0] bg-[#E6E3F7] px-2 py-0.5 rounded-[4px]">
                          {alarm.workOrderId}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#1E2232] mt-1">
                      {alarm.type} - {alarm.elevator}
                    </h4>
                    <p className="text-xs text-[#5D6375] mt-0.5">{alarm.description}</p>
                    <div className="text-[11px] text-[#5D6375] mt-1 flex flex-wrap items-center gap-2 font-mono">
                      <span>Detected: {alarm.detectedAt}</span>
                      <span>•</span>
                      <span>Facility: {alarm.building}</span>
                      {alarm.ackBy && (
                        <>
                          <span>•</span>
                          <span className="text-[#9C5C00]">Ack by: {alarm.ackBy}</span>
                        </>
                      )}
                      {alarm.resolvedBy && (
                        <>
                          <span>•</span>
                          <span className="text-[#15804D]">Resolved: {alarm.resolvedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3-State Action Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  {alarm.status === 'NEW' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(alarm.id)}
                    >
                      Acknowledge
                    </Button>
                  )}

                  {alarm.status !== 'RESOLVED' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCreateWo(alarm)}
                        icon={<Wrench className="h-3.5 w-3.5" />}
                      >
                        Create work order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(alarm.id)}
                        icon={<Check className="h-3.5 w-3.5" />}
                      >
                        Mark resolved
                      </Button>
                    </>
                  )}

                  {alarm.status === 'RESOLVED' && (
                    <span className="text-xs text-[#15804D] font-mono font-semibold flex items-center space-x-1">
                      <CheckCheck className="h-4 w-4" />
                      <span>Closed</span>
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 1-Click Work Order Modal */}
      <CreateWorkOrderFromAlarmModal
        isOpen={isWoModalOpen}
        onClose={() => setIsWoModalOpen(false)}
        alarm={selectedAlarmForWo}
        onSuccess={handleWoCreated}
      />

      {/* Emergency Intercom Console Modal */}
      <EmergencyIntercomModal
        isOpen={isIntercomOpen}
        onClose={() => setIsIntercomOpen(false)}
        elevatorName={activeIntercomElv}
        floor={4}
      />
    </DashboardLayout>
  );
}
