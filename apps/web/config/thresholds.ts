export interface ThresholdRule {
  metric: string;
  label: string;
  unit: string;
  normalMax: number;
  warningMax: number;
  alarmMax: number;
}

export const THRESHOLDS: Record<string, ThresholdRule> = {
  controllerTemperature: {
    metric: 'controllerTemperature',
    label: 'Controller temperature',
    unit: '°C',
    normalMax: 40,
    warningMax: 45,
    alarmMax: 60,
  },
  motorCurrent: {
    metric: 'motorCurrent',
    label: 'Motor current',
    unit: 'A',
    normalMax: 32,
    warningMax: 38,
    alarmMax: 50,
  },
  cabinLoad: {
    metric: 'cabinLoad',
    label: 'Load',
    unit: '%',
    normalMax: 80,
    warningMax: 95,
    alarmMax: 100,
  },
  vibration: {
    metric: 'vibration',
    label: 'Vibration RMS',
    unit: 'm/s²',
    normalMax: 0.25,
    warningMax: 0.45,
    alarmMax: 0.8,
  },
};

export type ThresholdStatus = 'NORMAL' | 'WARNING' | 'ALARM';

export function evaluateThreshold(metricKey: keyof typeof THRESHOLDS, value: number): ThresholdStatus {
  const rule = THRESHOLDS[metricKey];
  if (!rule) return 'NORMAL';
  if (value > rule.warningMax) return 'ALARM';
  if (value > rule.normalMax) return 'WARNING';
  return 'NORMAL';
}

export function getThresholdColor(status: ThresholdStatus): string {
  switch (status) {
    case 'ALARM':
      return '#C92D29'; // Red
    case 'WARNING':
      return '#9C5C00'; // Amber
    case 'NORMAL':
    default:
      return '#15804D'; // Green
  }
}

export function getThresholdBgColor(status: ThresholdStatus): string {
  switch (status) {
    case 'ALARM':
      return '#F8DDDC';
    case 'WARNING':
      return '#F6E9D2';
    case 'NORMAL':
    default:
      return '#DCEFE4';
  }
}
