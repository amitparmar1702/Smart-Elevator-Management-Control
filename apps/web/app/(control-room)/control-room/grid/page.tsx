'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Siren, 
  CheckCircle2, 
  AlertOctagon, 
  DoorClosed, 
  DoorOpen, 
  Lock,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataFreshnessIndicator } from '@/components/ui/DataFreshnessIndicator';
import { WeekStripDatePicker } from '@/components/ui/WeekStripDatePicker';
import { audioService } from '@/lib/audioService';

interface MonitoredCar {
  id: string;
  code: string;
  name: string;
  floor: number;
  dir: 'UP' | 'DOWN' | 'STATIONARY';
  target: number | null;
  door: 'OPEN' | 'CLOSED';
  load: number;
  speed: number;
  safety: boolean;
  status: 'RUNNING' | 'IDLE' | 'FAULT' | 'RECALL';
}

const INITIAL_CARS: MonitoredCar[] = [
  {
    id: 'elv-a-01',
    code: 'CAR 1',
    name: 'High-Speed North',
    floor: 8,
    dir: 'UP',
    target: 12,
    door: 'CLOSED',
    load: 42,
    speed: 2.5,
    safety: true,
    status: 'RUNNING',
  },
  {
    id: 'elv-a-02',
    code: 'CAR 2',
    name: 'Standard North',
    floor: 1,
    dir: 'STATIONARY',
    target: null,
    door: 'OPEN',
    load: 0,
    speed: 0.0,
    safety: true,
    status: 'IDLE',
  },
  {
    id: 'elv-a-03',
    code: 'CAR 3',
    name: 'Freight & Service',
    floor: 3,
    dir: 'DOWN',
    target: -2,
    door: 'CLOSED',
    load: 68,
    speed: 1.6,
    safety: true,
    status: 'RUNNING',
  },
  {
    id: 'elv-a-04',
    code: 'CAR 4',
    name: 'Emergency & Fire',
    floor: 1,
    dir: 'STATIONARY',
    target: null,
    door: 'CLOSED',
    load: 0,
    speed: 0.0,
    safety: true,
    status: 'IDLE',
  },
];

export default function ControlRoomGridPage() {
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [selectedOperationalDate, setSelectedOperationalDate] = useState('2026-11-20');
  const [p1EmergencyActive, setP1EmergencyActive] = useState(false);
  const [escalationReason, setEscalationReason] = useState('PASSENGER_ENTRAPMENT');
  const [escalationCar, setEscalationCar] = useState('ALL');
  const [cars, setCars] = useState<MonitoredCar[]>(INITIAL_CARS);
  const [activeAlarms, setActiveAlarms] = useState([
    { id: 'ALM-901', elv: 'ELV-A-01', type: 'DOOR_OBSTRUCTION', time: '2m ago', severity: 'WARNING' },
  ]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live real-time kinematics and emergency recall simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCars((prevCars) =>
        prevCars.map((car) => {
          // 1. If P1 Emergency is active: all cars recall to Floor 1 (Lobby Level)
          if (p1EmergencyActive) {
            if (car.floor > 1) {
              return {
                ...car,
                floor: car.floor - 1,
                dir: 'DOWN',
                target: 1,
                speed: 2.2,
                door: 'CLOSED',
                status: 'RECALL',
              };
            } else if (car.floor < 1) {
              return {
                ...car,
                floor: car.floor + 1,
                dir: 'UP',
                target: 1,
                speed: 1.6,
                door: 'CLOSED',
                status: 'RECALL',
              };
            } else {
              return {
                ...car,
                dir: 'STATIONARY',
                target: 1,
                speed: 0.0,
                door: 'OPEN',
                load: 0,
                status: 'RECALL',
              };
            }
          }

          // 2. If single car is in RECALL status: recall to Floor 1
          if (car.status === 'RECALL') {
            if (car.floor > 1) {
              return {
                ...car,
                floor: car.floor - 1,
                dir: 'DOWN',
                target: 1,
                speed: 2.2,
                door: 'CLOSED',
              };
            } else if (car.floor < 1) {
              return {
                ...car,
                floor: car.floor + 1,
                dir: 'UP',
                target: 1,
                speed: 1.6,
                door: 'CLOSED',
              };
            } else {
              return {
                ...car,
                dir: 'STATIONARY',
                target: null,
                speed: 0.0,
                door: 'OPEN',
                load: 0,
              };
            }
          }

          // 3. If car has safety fault: halt movement
          if (car.status === 'FAULT' || !car.safety) {
            return {
              ...car,
              speed: 0.0,
              dir: 'STATIONARY',
            };
          }

          // 4. If car is at floor with doors open: close doors on next tick if stationary
          if (car.door === 'OPEN') {
            if (car.target !== null && car.target !== car.floor) {
              return { ...car, door: 'CLOSED', dir: car.target > car.floor ? 'UP' : 'DOWN', speed: 2.0 };
            }
            return { ...car, door: 'CLOSED' };
          }

          // 5. If car has an active target floor: move towards it
          if (car.target !== null) {
            if (car.floor < car.target) {
              const nextFloor = car.floor + 1;
              const arrived = nextFloor >= car.target;
              if (arrived) {
                audioService.playArrivalChime();
              }
              return {
                ...car,
                floor: nextFloor,
                dir: arrived ? 'STATIONARY' : 'UP',
                speed: arrived ? 0.0 : 2.5,
                door: arrived ? 'OPEN' : 'CLOSED',
                target: arrived ? null : car.target,
                status: arrived ? 'IDLE' : 'RUNNING',
                load: arrived ? Math.floor(Math.random() * 35 + 15) : car.load,
              };
            } else if (car.floor > car.target) {
              const nextFloor = car.floor - 1;
              const arrived = nextFloor <= car.target;
              if (arrived) {
                audioService.playArrivalChime();
              }
              return {
                ...car,
                floor: nextFloor,
                dir: arrived ? 'STATIONARY' : 'DOWN',
                speed: arrived ? 0.0 : 2.5,
                door: arrived ? 'OPEN' : 'CLOSED',
                target: arrived ? null : car.target,
                status: arrived ? 'IDLE' : 'RUNNING',
                load: arrived ? Math.floor(Math.random() * 35 + 15) : car.load,
              };
            } else {
              // Already at target floor
              return {
                ...car,
                dir: 'STATIONARY',
                speed: 0.0,
                door: 'OPEN',
                target: null,
                status: 'IDLE',
              };
            }
          }

          return car;
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [p1EmergencyActive]);

  const handleAckAlarm = (id: string) => {
    audioService.playCallRegistered();
    setActiveAlarms(activeAlarms.filter((a) => a.id !== id));
  };

  const handleStandDown = () => {
    audioService.playCallRegistered();
    setP1EmergencyActive(false);
    setCars(INITIAL_CARS);
    setActionNotice('P1 Emergency stood down. All elevators restored to Normal Automatic mode.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleToggleDoor = (carId: string) => {
    audioService.playCallRegistered();
    setCars((prev) =>
      prev.map((c) =>
        c.id === carId
          ? {
              ...c,
              door: c.door === 'OPEN' ? 'CLOSED' : 'OPEN',
              speed: 0,
              dir: 'STATIONARY',
            }
          : c
      )
    );
  };

  const handleSingleCarRecall = (carId: string, carCode: string) => {
    audioService.playCallRegistered();
    setCars((prev) =>
      prev.map((c) =>
        c.id === carId
          ? {
              ...c,
              target: 1,
              dir: c.floor > 1 ? 'DOWN' : c.floor < 1 ? 'UP' : 'STATIONARY',
              speed: 2.0,
              door: 'CLOSED',
              status: 'RECALL',
            }
          : c
      )
    );
    setActionNotice(`${carCode} commanded to Phase 1 recall to Floor 1.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDispatchFloor = (carId: string, carCode: string, targetFloor: number) => {
    audioService.playCallRegistered();
    setCars((prev) =>
      prev.map((c) => {
        if (c.id === carId) {
          const dir = targetFloor > c.floor ? 'UP' : targetFloor < c.floor ? 'DOWN' : 'STATIONARY';
          return {
            ...c,
            target: targetFloor,
            dir,
            speed: dir === 'STATIONARY' ? 0 : 2.5,
            door: 'CLOSED',
            status: 'RUNNING',
          };
        }
        return c;
      })
    );
    setActionNotice(`${carCode} dispatched to Floor ${formatFloorDisplay(targetFloor)}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSetCarStatus = (carId: string, carCode: string, newStatus: MonitoredCar['status']) => {
    audioService.playCallRegistered();
    setCars((prev) =>
      prev.map((c) =>
        c.id === carId
          ? {
              ...c,
              status: newStatus,
              speed: newStatus === 'FAULT' || newStatus === 'IDLE' ? 0 : c.speed,
              dir: newStatus === 'FAULT' ? 'STATIONARY' : c.dir,
            }
          : c
      )
    );
    setActionNotice(`${carCode} operational mode switched to ${newStatus}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleSafety = (carId: string, carCode: string) => {
    audioService.playCallRegistered();
    setCars((prev) =>
      prev.map((c) => {
        if (c.id === carId) {
          const nextSafety = !c.safety;
          return {
            ...c,
            safety: nextSafety,
            status: nextSafety ? 'RUNNING' : 'FAULT',
            speed: nextSafety ? c.speed : 0,
            dir: nextSafety ? c.dir : 'STATIONARY',
          };
        }
        return c;
      })
    );
    setActionNotice(`${carCode} safety chain toggled.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const formatFloorDisplay = (floor: number): string => {
    if (floor < 0) return `B${Math.abs(floor)}`;
    if (floor === 1) return 'G';
    return `L${floor}`;
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Security & Operations' }, { label: 'Control Room Grid' }]}
      title="Control Room Grid (Tower A & B)"
      subtitle="Continuous live elevator telemetry grid, passenger entrapment detection and emergency escalation"
      actions={
        <div className="flex items-center space-x-3">
          <DataFreshnessIndicator />
          <Button
            variant="danger"
            size="sm"
            icon={<Siren className="h-4 w-4" />}
            onClick={() => setShowEscalationModal(true)}
          >
            Trigger emergency escalation (P1)
          </Button>
        </div>
      }
    >
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="mb-4 p-3 rounded-[6px] bg-[#DCEFE4] border border-[#15804D]/30 text-[#15804D] text-xs font-medium flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{actionNotice}</span>
          </span>
          <button onClick={() => setActionNotice(null)} className="hover:underline font-bold">Dismiss</button>
        </div>
      )}

      {/* P1 Emergency Escalation Banner */}
      {p1EmergencyActive && (
        <div className="mb-6 p-4 rounded-[8px] bg-red-100 border-l-4 border-red-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <Siren className="h-5 w-5 text-red-600 animate-bounce flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-red-900 uppercase tracking-wide">
                CRITICAL P1 EMERGENCY ACTIVE ({escalationReason.replace('_', ' ')}):
              </span>
              <span className="text-red-800 ml-1">
                Target: {escalationCar}. Autonomous safety recall active. Emergency responders and building safety team notified.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-600 text-red-700 hover:bg-red-200 flex-shrink-0"
            onClick={handleStandDown}
          >
            Stand Down Escalation
          </Button>
        </div>
      )}

      {/* Active Alarm Banner (If any) */}
      {activeAlarms.length > 0 && (
        <div className="mb-6 p-4 rounded-[8px] bg-[#F6E9D2] border-l-4 border-[#9C5C00] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="h-5 w-5 text-[#9C5C00] animate-pulse flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#9C5C00]">Active warning detected:</span>
              <span className="text-[#9C5C00] ml-1">
                {activeAlarms[0].elv} reported {activeAlarms[0].type.toLowerCase().replace('_', ' ')} ({activeAlarms[0].time})
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={() => handleAckAlarm(activeAlarms[0].id)}
          >
            Acknowledge alarm
          </Button>
        </div>
      )}

      {/* Real-Time Operational Calendar Track */}
      <div className="mb-6">
        <WeekStripDatePicker
          initialDate={selectedOperationalDate}
          onDateChange={(d) => setSelectedOperationalDate(d)}
        />
      </div>

      {/* High-Density 4-Car Live Monitoring Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {cars.map((car) => {
          const isDoorOpen = car.door === 'OPEN';
          return (
            <div
              key={car.id}
              className={`bg-white text-[#1E2232] rounded-[8px] border ${
                car.status === 'RECALL'
                  ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  : 'border-[#DCDFEA] hover:border-[#433690]/40'
              } p-5 flex flex-col justify-between shadow-card transition-all`}
            >
              {/* Top Car Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#DCDFEA]">
                  <div>
                    <h3 className="font-medium text-base text-[#433690]">{car.code}</h3>
                    <p className="text-[11px] text-[#5D6375]">{car.name}</p>
                  </div>
                  <StatusBadge status={car.status} size="sm" />
                </div>

                {/* Floor Readout Card */}
                <div className="py-4 text-center bg-[#EEF0F6] rounded-[6px] my-3 border border-[#DCDFEA]">
                  <div className="text-3xl font-bold font-mono text-[#1E2232] tracking-tight flex items-center justify-center space-x-2">
                    <span>FL {formatFloorDisplay(car.floor)}</span>
                    {car.dir === 'UP' && <ArrowUp className="h-5 w-5 text-[#15804D] animate-bounce" />}
                    {car.dir === 'DOWN' && <ArrowDown className="h-5 w-5 text-[#15804D] animate-bounce" />}
                    {car.dir === 'STATIONARY' && <Minus className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div className="text-[10px] font-mono text-[#5D6375] mt-1">
                    TARGET: {car.target !== null ? `FLOOR ${formatFloorDisplay(car.target)}` : 'STANDBY'}
                  </div>
                </div>

                {/* 60px Sensor Tiles for Door Status & Safety Circuit */}
                <div className="flex justify-center space-x-3 my-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDoor(car.id)}
                    className={`sensor-tile ${car.status === 'FAULT' ? 'fault' : ''} cursor-pointer hover:border-[#433690] transition-colors`}
                    title={`Click to cycle door state (Currently: ${car.door})`}
                  >
                    {isDoorOpen ? (
                      <DoorOpen className="h-5 w-5 text-[#433690]" />
                    ) : (
                      <DoorClosed className="h-5 w-5 text-[#5D6375]" />
                    )}
                    <span className="text-[9px] font-medium mt-1 uppercase text-[#5D6375]">
                      {car.door}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSafety(car.id, car.code)}
                    className={`sensor-tile ${!car.safety ? 'fault' : ''} cursor-pointer hover:border-[#15804D] transition-colors`}
                    title={`Safety Chain: Click to toggle (Currently: ${car.safety ? 'Closed & Normal' : 'Open / Tripped'})`}
                  >
                    <Lock className={`h-5 w-5 ${car.safety ? 'text-[#15804D]' : 'text-[#C92D29]'}`} />
                    <span className={`text-[9px] font-medium mt-1 ${car.safety ? 'text-[#15804D]' : 'text-[#C92D29]'}`}>
                      {car.safety ? 'Closed' : 'Tripped'}
                    </span>
                  </button>
                </div>

                {/* Direct Floor Dispatch Selector Bar */}
                <div className="my-2.5 p-2 bg-[#EEF0F6]/80 rounded-[6px] border border-[#DCDFEA]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#5D6375] mb-1.5">
                    <span>CALL CAR:</span>
                    <span className="text-[#433690]">DISPATCH</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 4, 8, 12, 14].map((fl) => (
                      <button
                        key={fl}
                        type="button"
                        onClick={() => handleDispatchFloor(car.id, car.code, fl)}
                        className={`py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                          car.floor === fl
                            ? 'bg-[#433690] text-white border-[#433690] shadow-xs'
                            : car.target === fl
                            ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                            : 'bg-white hover:bg-[#E6E3F7] text-[#1E2232] border-[#DCDFEA]'
                        }`}
                        title={`Dispatch ${car.code} to Floor ${formatFloorDisplay(fl)}`}
                      >
                        {formatFloorDisplay(fl)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key/Value Telemetry Rows (label left, bold right) */}
                <div className="space-y-1.5 text-xs font-mono divide-y divide-[#DCDFEA] pt-1">
                  <div className="flex justify-between py-1.5 items-center">
                    <span className="text-[#5D6375]">Mode:</span>
                    <select
                      value={car.status}
                      onChange={(e) => handleSetCarStatus(car.id, car.code, e.target.value as any)}
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#DCDFEA] bg-[#EEF0F6] text-[#433690] focus:ring-1 focus:ring-[#433690]"
                    >
                      <option value="RUNNING">RUNNING (Auto)</option>
                      <option value="IDLE">IDLE (Standby)</option>
                      <option value="RECALL">RECALL (Lobby)</option>
                      <option value="FAULT">FAULT (Lockout)</option>
                    </select>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#5D6375]">Load:</span>
                    <span className="font-bold text-[#1E2232]">{car.load}%</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#5D6375]">Speed:</span>
                    <span className="font-bold text-[#1E2232]">{car.speed.toFixed(1)} m/s</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#DCDFEA] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSingleCarRecall(car.id, car.code)}
                  title="Command Phase 1 recall for this hoistway"
                  className="text-[11px] text-[#433690] hover:text-[#31276B] font-semibold hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Recall</span>
                </button>
                <Link href={`/elevators/${car.id}/live`}>
                  <Button variant="outline" size="sm">
                    Shaft view
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Response Protocol Card */}
      <Card title="Emergency Response Standard Operating Procedure (IS 17900 / EN 81-28)">
        <div className="text-xs text-[#5D6375] leading-relaxed space-y-2">
          <p>
            1. <strong>Passenger Assistance:</strong> In the event of stoppage between floors, establish voice communication via primary hardware intercom. Do not attempt unverified remote resets.
          </p>
          <p>
            2. <strong>Autonomous Safety Chain:</strong> The local controller safety circuitry remains active independently of cloud status. If power drops, the automatic rescue device (ARD) operates locally.
          </p>
        </div>
      </Card>

      {/* Trigger P1 Escalation Modal */}
      <Modal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        title="Declare Priority 1 (P1) Emergency Escalation"
        subtitle="Initiate statutory incident protocol, automated dispatch to emergency responders, and SMS/push broadcasts"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            audioService.playAlarmTone();
            setP1EmergencyActive(true);
            setShowEscalationModal(false);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="escalation-target" className="block text-xs font-semibold text-[#1E2232] mb-1">Target Hoistway / Elevator Bank</label>
            <select
              id="escalation-target"
              name="escalationCar"
              suppressHydrationWarning
              value={escalationCar}
              onChange={(e) => setEscalationCar(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="ALL">All Cars in Tower A & B (Facility-Wide)</option>
              <option value="CAR 1 (High-Speed North)">CAR 1 (High-Speed North)</option>
              <option value="CAR 2 (Standard North)">CAR 2 (Standard North)</option>
              <option value="CAR 3 (Freight & Service)">CAR 3 (Freight & Service)</option>
              <option value="CAR 4 (Emergency & Fire)">CAR 4 (Emergency & Fire)</option>
            </select>
          </div>

          <div>
            <label htmlFor="escalation-reason" className="block text-xs font-semibold text-[#1E2232] mb-1">Emergency Category</label>
            <select
              id="escalation-reason"
              name="escalationReason"
              suppressHydrationWarning
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full text-xs h-10 px-3 bg-white border border-[#DCDFEA] rounded-[6px] text-[#1E2232]"
            >
              <option value="PASSENGER_ENTRAPMENT">Passenger Entrapment (Urgent Rescue)</option>
              <option value="FIRE_ALARM_INTEGRATION">Fire Alarm Trigger (Phase I Recall)</option>
              <option value="SEISMIC_SHUTDOWN">Seismic / Earthquake Sensor Trip</option>
              <option value="POWER_OUTAGE_ARD">Mains Power Failure (ARD Interlocking)</option>
              <option value="SAFETY_CIRCUIT_FAULT">Critical Safety Chain Interruption</option>
            </select>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-[11px] text-red-800 space-y-1">
            <p className="font-semibold">Statutory Protocol Note:</p>
            <p>
              Declaring a P1 emergency notifies the on-duty supervisor, fire command station, and initiates an immutable compliance audit record.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCDFEA]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEscalationModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm & Escalate
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
