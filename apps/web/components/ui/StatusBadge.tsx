import React from 'react';
import { ElevatorStatus } from '@elevateos/types';

interface StatusBadgeProps {
  status: ElevatorStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showShape?: boolean;
}

export function StatusBadge({
  status,
  size = 'md',
  className = '',
  showShape = true,
}: StatusBadgeProps) {
  const normalized = status ? status.trim().toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';

  // Strict ElevateOS Light Theme tokens:
  // Running / Healthy / Normal / Active / Verified: green #15804D on #DCEFE4, shape: ●
  // Warning / Attention / Acknowledged / New / Pending: #9C5C00 on #F6E9D2, shape: ▲
  // Alarm / Fault / Interrupted / Critical / Emergency: red #C92D29 on #F8DDDC, shape: ■
  // Maintenance / In Progress / Dispatched: violet #5543C0 on #E6E3F7, shape: ◆
  // Offline / Unknown / Suspended: grey #66707B on #E3E6E9, shape: ○
  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; shape: string }
  > = {
    RUNNING: {
      label: 'Running',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    ONLINE: {
      label: 'Online',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    HEALTHY: {
      label: 'Healthy',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    NORMAL: {
      label: 'Normal',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    ACTIVE: {
      label: 'Active',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    APPROVED: {
      label: 'Approved',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    IDLE: {
      label: 'Standby',
      bg: 'bg-[#DCEFE4]',
      text: 'text-[#15804D]',
      border: 'border-[#15804D]/30',
      shape: '●',
    },
    WARNING: {
      label: 'Warning',
      bg: 'bg-[#F6E9D2]',
      text: 'text-[#9C5C00]',
      border: 'border-[#9C5C00]/30',
      shape: '▲',
    },
    NEW: {
      label: 'New',
      bg: 'bg-[#F6E9D2]',
      text: 'text-[#9C5C00]',
      border: 'border-[#9C5C00]/30',
      shape: '▲',
    },
    ACKNOWLEDGED: {
      label: 'Acknowledged',
      bg: 'bg-[#F6E9D2]',
      text: 'text-[#9C5C00]',
      border: 'border-[#9C5C00]/30',
      shape: '▲',
    },
    PENDING: {
      label: 'Pending',
      bg: 'bg-[#F6E9D2]',
      text: 'text-[#9C5C00]',
      border: 'border-[#9C5C00]/30',
      shape: '▲',
    },
    PENDING_APPROVAL: {
      label: 'Pending approval',
      bg: 'bg-[#F6E9D2]',
      text: 'text-[#9C5C00]',
      border: 'border-[#9C5C00]/30',
      shape: '▲',
    },
    ATTENTION: {
      label: 'Attention',
      bg: 'bg-[#F6E9D2]',
      text: 'text-[#9C5C00]',
      border: 'border-[#9C5C00]/30',
      shape: '▲',
    },
    FAULT: {
      label: 'Fault',
      bg: 'bg-[#F8DDDC]',
      text: 'text-[#C92D29]',
      border: 'border-[#C92D29]/30',
      shape: '■',
    },
    ALARM: {
      label: 'Alarm',
      bg: 'bg-[#F8DDDC]',
      text: 'text-[#C92D29]',
      border: 'border-[#C92D29]/30',
      shape: '■',
    },
    INTERRUPTED: {
      label: 'Interrupted',
      bg: 'bg-[#F8DDDC]',
      text: 'text-[#C92D29]',
      border: 'border-[#C92D29]/30',
      shape: '■',
    },
    EMERGENCY: {
      label: 'Emergency',
      bg: 'bg-[#F8DDDC]',
      text: 'text-[#C92D29] font-bold',
      border: 'border-[#C92D29]/40',
      shape: '■',
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-[#F8DDDC]',
      text: 'text-[#C92D29]',
      border: 'border-[#C92D29]/30',
      shape: '■',
    },
    MAINTENANCE: {
      label: 'In maintenance',
      bg: 'bg-[#E6E3F7]',
      text: 'text-[#5543C0]',
      border: 'border-[#5543C0]/30',
      shape: '◆',
    },
    IN_MAINTENANCE: {
      label: 'In maintenance',
      bg: 'bg-[#E6E3F7]',
      text: 'text-[#5543C0]',
      border: 'border-[#5543C0]/30',
      shape: '◆',
    },
    IN_PROGRESS: {
      label: 'In progress',
      bg: 'bg-[#E6E3F7]',
      text: 'text-[#5543C0]',
      border: 'border-[#5543C0]/30',
      shape: '◆',
    },
    DISPATCHED: {
      label: 'Dispatched',
      bg: 'bg-[#E6E3F7]',
      text: 'text-[#5543C0]',
      border: 'border-[#5543C0]/30',
      shape: '◆',
    },
    OFFLINE: {
      label: 'Offline',
      bg: 'bg-[#E3E6E9]',
      text: 'text-[#66707B]',
      border: 'border-[#66707B]/30',
      shape: '○',
    },
    UNKNOWN: {
      label: 'Unknown',
      bg: 'bg-[#E3E6E9]',
      text: 'text-[#66707B]',
      border: 'border-[#66707B]/30',
      shape: '○',
    },
  };

  const current = configs[normalized] || {
    label: status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    bg: 'bg-[#E3E6E9]',
    text: 'text-[#66707B]',
    border: 'border-[#66707B]/30',
    shape: '○',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1.5',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {showShape && (
        <span className="font-mono text-[9px] leading-none select-none" aria-hidden="true">
          {current.shape}
        </span>
      )}
      <span>{current.label}</span>
    </span>
  );
}
