'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  OctagonAlert, 
  DoorClosed, 
  CheckCircle2, 
  Wrench, 
  BellRing, 
  ArrowRightCircle,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export type EventType = 
  | 'FAULT' 
  | 'EMERGENCY_STOP' 
  | 'DOOR_OBSTRUCTION' 
  | 'ALARM_ACK' 
  | 'TECH_ASSIGNED' 
  | 'JOB_COMPLETED' 
  | 'BACK_IN_SERVICE';

export interface ElevatorTimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  badgeStatus: string;
}

interface ElevatorEventTimelineProps {
  elevatorId: string;
}

export const ElevatorEventTimeline: React.FC<ElevatorEventTimelineProps> = ({ elevatorId }) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | EventType>('ALL');

  const events: ElevatorTimelineEvent[] = [
    {
      id: 'EVT-109',
      type: 'BACK_IN_SERVICE',
      title: 'Elevator back in normal service',
      description: 'Physical inspection completed, safety interlocks verified, returned to fleet dispatch.',
      timestamp: '2026-11-16 11:45',
      relativeTime: '25 min ago',
      badgeStatus: 'Running',
    },
    {
      id: 'EVT-108',
      type: 'JOB_COMPLETED',
      title: 'Preventive service completed',
      description: 'Technician Vikram Singh completed monthly brake clearance and guide shoe lubrication.',
      timestamp: '2026-11-16 11:30',
      relativeTime: '40 min ago',
      badgeStatus: 'Completed',
    },
    {
      id: 'EVT-107',
      type: 'TECH_ASSIGNED',
      title: 'Technician dispatched to machine room',
      description: 'Work order WO-1092 assigned to certified field technician Vikram Singh.',
      timestamp: '2026-11-16 10:15',
      relativeTime: '1 hr 55 min ago',
      badgeStatus: 'In progress',
    },
    {
      id: 'EVT-106',
      type: 'ALARM_ACK',
      title: 'Alarm acknowledged by control room',
      description: 'Security operator Rajesh K. acknowledged optical sensor obstruction alert.',
      timestamp: '2026-11-16 09:42',
      relativeTime: '2 hrs ago',
      badgeStatus: 'Acknowledged',
    },
    {
      id: 'EVT-105',
      type: 'DOOR_OBSTRUCTION',
      title: 'Door obstruction cycle detected',
      description: 'Infrared light curtain tripped 3 consecutive cycles on floor 4.',
      timestamp: '2026-11-16 09:40',
      relativeTime: '2 hrs ago',
      badgeStatus: 'Warning',
    },
    {
      id: 'EVT-104',
      type: 'EMERGENCY_STOP',
      title: 'Safety circuit test stop',
      description: 'Governor overspeed safety contact verified during monthly audit.',
      timestamp: '2026-11-15 16:20',
      relativeTime: 'Yesterday',
      badgeStatus: 'Verified',
    },
    {
      id: 'EVT-103',
      type: 'FAULT',
      title: 'Door lock contact hesitation (E-31)',
      description: 'Landing door interlock open circuit detected during pre-flight check.',
      timestamp: '2026-11-14 08:12',
      relativeTime: '2 days ago',
      badgeStatus: 'Fault',
    },
  ];

  const filteredEvents = selectedFilter === 'ALL' 
    ? events 
    : events.filter((e) => e.type === selectedFilter);

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'FAULT':
        return <AlertTriangle className="h-4 w-4 text-[#C92D29]" />;
      case 'EMERGENCY_STOP':
        return <OctagonAlert className="h-4 w-4 text-[#C92D29]" />;
      case 'DOOR_OBSTRUCTION':
        return <DoorClosed className="h-4 w-4 text-[#9C5C00]" />;
      case 'ALARM_ACK':
        return <BellRing className="h-4 w-4 text-[#433690]" />;
      case 'TECH_ASSIGNED':
        return <Wrench className="h-4 w-4 text-[#5543C0]" />;
      case 'JOB_COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-[#15804D]" />;
      case 'BACK_IN_SERVICE':
        return <ArrowRightCircle className="h-4 w-4 text-[#15804D]" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-[#5D6375]" />;
    }
  };

  return (
    <Card title="Operational event timeline">
      {/* Event Filter Pills */}
      <div className="flex flex-wrap gap-1.5 mb-5 pb-3 border-b border-[#DCDFEA]">
        {[
          { label: 'All events', value: 'ALL' },
          { label: 'Faults', value: 'FAULT' },
          { label: 'Emergency stops', value: 'EMERGENCY_STOP' },
          { label: 'Door obstructions', value: 'DOOR_OBSTRUCTION' },
          { label: 'Dispatches & maintenance', value: 'TECH_ASSIGNED' },
          { label: 'In service', value: 'BACK_IN_SERVICE' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedFilter(f.value as any)}
            className={`text-xs px-2.5 py-1 rounded-[6px] border transition-colors ${
              selectedFilter === f.value
                ? 'bg-[#433690] text-white border-[#433690]'
                : 'bg-[#EEF0F6] text-[#5D6375] border-[#DCDFEA] hover:text-[#1E2232]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#DCDFEA]">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[23px] top-0.5 h-6 w-6 rounded-full bg-white border border-[#DCDFEA] flex items-center justify-center shadow-xs">
              {getEventIcon(evt.type)}
            </div>

            {/* Event Content Box */}
            <div className="p-3 rounded-[6px] bg-[#EEF0F6]/40 border border-[#DCDFEA]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-[#1E2232]">
                  {evt.title}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-[#5D6375]">
                    {evt.relativeTime} ({evt.timestamp})
                  </span>
                  <StatusBadge status={evt.badgeStatus} size="sm" />
                </div>
              </div>
              <p className="text-xs text-[#5D6375] leading-relaxed">
                {evt.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
