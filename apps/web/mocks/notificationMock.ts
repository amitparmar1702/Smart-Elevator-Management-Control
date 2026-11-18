// TODO: connect to real API: GET /api/v1/users/me/notifications/matrix & PUT /api/v1/users/me/notifications/matrix

export interface NotificationChannelSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface NotificationRule {
  id: string;
  category: string;
  label: string;
  description: string;
  channels: NotificationChannelSettings;
}

export const INITIAL_NOTIFICATION_MATRIX: NotificationRule[] = [
  {
    id: 'crit-safety',
    category: 'Safety & emergency',
    label: 'Safety chain break & emergency stop',
    description: 'Immediate notification when governor or pit switch safety contact opens.',
    channels: { push: true, email: true, sms: true, whatsapp: true },
  },
  {
    id: 'passenger-entrapment',
    category: 'Safety & emergency',
    label: 'Passenger entrapment alert',
    description: 'Car stationary between floors longer than 90 seconds with load.',
    channels: { push: true, email: true, sms: true, whatsapp: true },
  },
  {
    id: 'door-obstruction',
    category: 'Operational alarms',
    label: 'Door obstruction warnings',
    description: 'Optical light curtain interrupted for 3 consecutive retry attempts.',
    channels: { push: true, email: true, sms: false, whatsapp: false },
  },
  {
    id: 'high-temp',
    category: 'Equipment health',
    label: 'Controller or motor high temperature',
    description: 'Cabinet exceeds 45°C or traction motor thermistor exceeds 80°C.',
    channels: { push: true, email: true, sms: false, whatsapp: false },
  },
  {
    id: 'maintenance-due',
    category: 'Maintenance & compliance',
    label: 'Scheduled maintenance work order due',
    description: 'Preventive maintenance or statutory audit deadline within 48 hours.',
    channels: { push: true, email: true, sms: false, whatsapp: false },
  },
  {
    id: 'daily-digest',
    category: 'Reports & digests',
    label: 'Daily portfolio uptime & fault digest',
    description: 'Morning executive summary of fleet availability, trips, and energy consumption.',
    channels: { push: false, email: true, sms: false, whatsapp: false },
  },
];
