// TODO: connect to real API: POST /api/v1/reports/generate & GET/POST /api/v1/reports/schedules

export interface ScheduledReport {
  id: string;
  name: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  recipients: string[];
  nextRunDate: string;
  status: 'ACTIVE' | 'PAUSED';
}

export const MOCK_SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'SCH-01',
    name: 'Monthly fleet availability & SLA compliance digest',
    format: 'PDF',
    frequency: 'MONTHLY',
    recipients: ['facility.manager@apexproperties.com', 'admin@apexproperties.com'],
    nextRunDate: '01 Dec 2026',
    status: 'ACTIVE',
  },
  {
    id: 'SCH-02',
    name: 'Statutory emergency safety brake test audit log',
    format: 'EXCEL',
    frequency: 'QUARTERLY',
    recipients: ['compliance@elevateos.io', 'auditor@apexproperties.com'],
    nextRunDate: '31 Dec 2026',
    status: 'ACTIVE',
  },
];
