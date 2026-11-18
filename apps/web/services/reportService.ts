import { MOCK_SCHEDULED_REPORTS, ScheduledReport } from '../mocks/reportMock';

export interface GenerateReportParams {
  reportType: 'AVAILABILITY' | 'MAINTENANCE' | 'INCIDENTS' | 'ENERGY';
  format: 'PDF' | 'EXCEL' | 'CSV';
  from: string;
  to: string;
  buildingId?: string;
  elevatorId?: string;
}

export class ReportService {
  /**
   * Generates and downloads a compliance or operations report.
   * Backed by mock implementation until report generation worker is wired.
   * TODO: connect to real API: POST /api/v1/reports/generate
   */
  public static async generateReport(params: GenerateReportParams): Promise<{ downloadUrl: string; filename: string }> {
    try {
      // In production environment:
      // const res = await fetch('/api/v1/reports/generate', { method: 'POST', body: JSON.stringify(params) });
      // if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const ext = params.format === 'PDF' ? 'pdf' : params.format === 'EXCEL' ? 'xlsx' : 'csv';
    return {
      downloadUrl: `#`,
      filename: `ElevateOS_${params.reportType}_${new Date().toISOString().split('T')[0]}.${ext}`,
    };
  }

  /**
   * Fetches recurring automated email schedules.
   * TODO: connect to real API: GET /api/v1/reports/schedules
   */
  public static async getSchedules(): Promise<ScheduledReport[]> {
    return [...MOCK_SCHEDULED_REPORTS];
  }

  /**
   * Creates a new recurring email schedule.
   * TODO: connect to real API: POST /api/v1/reports/schedules
   */
  public static async createSchedule(schedule: Omit<ScheduledReport, 'id'>): Promise<ScheduledReport> {
    const newEntry: ScheduledReport = {
      ...schedule,
      id: `SCH-${String(Math.floor(10 + Math.random() * 90))}`,
    };
    return newEntry;
  }
}
