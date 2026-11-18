/**
 * Standardized sentence-case labels for ElevateOS platform
 * Replaces raw, camelCase, or inconsistent labels across all UI pages.
 */

export const LABELS = {
  // Telemetry & Hardware States
  safetyChain: 'Safety chain',
  emergencyStop: 'Emergency stop',
  emergencyStops: 'Emergency stops',
  doorObstruction: 'Door obstructions',
  doorObstructions: 'Door obstructions',
  load: 'Load',
  cabinLoad: 'Cabin load',
  motorCurrent: 'Motor current',
  motorTemperature: 'Motor temperature',
  controllerTemperature: 'Controller temperature',
  vibrationRms: 'Vibration RMS',
  doorState: 'Door state',
  doorCycles: 'Door cycles',
  batteryVoltage: 'Backup battery',
  velocity: 'Car speed',
  currentFloor: 'Current floor',
  targetFloor: 'Target floor',
  operatingMode: 'Operating mode',

  // Fleet & Management
  availability: 'Availability',
  downtime: 'Downtime',
  healthScore: 'Health score',
  totalTrips: 'Total trips',
  meanTimeToRecovery: 'Mean recovery time',
  activeAlarms: 'Active alarms',
  resolvedAlarms: 'Resolved alarms',
  workOrders: 'Work orders',
  technicianAssigned: 'Assigned technician',
  slaDeadline: 'SLA deadline',

  // Status Labels
  running: 'Running',
  healthy: 'Healthy',
  normal: 'Normal',
  idle: 'Idle',
  warning: 'Warning',
  alarm: 'Alarm',
  fault: 'Fault',
  interrupted: 'Interrupted',
  maintenance: 'In maintenance',
  offline: 'Offline',
  unknown: 'Unknown',
} as const;

export function formatLabel(key: keyof typeof LABELS): string {
  return LABELS[key] || key;
}

export function toSentenceCase(text: string): string {
  if (!text) return '';
  // Convert camelCase or SNAKE_CASE or kebab-case to readable sentence-case
  const unSnake = text.replace(/[_-]+/g, ' ');
  const unCamel = unSnake.replace(/([a-z])([A-Z])/g, '$1 $2');
  const cleaned = unCamel.trim().toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
