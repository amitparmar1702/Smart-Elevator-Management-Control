import { generateMockTrendPoints, TrendDataPoint } from '../mocks/trendMock';

export interface TrendQueryParams {
  elevatorId: string;
  metric: 'motorCurrent' | 'controllerTemperature' | 'doorCycles' | 'healthScore';
  from?: string;
  to?: string;
  rangePreset?: string;
}

export class TrendService {
  /**
   * Fetches historical time-series data for elevator metrics.
   * Backed by mock implementation until telemetry timeseries API endpoint is available.
   * TODO: connect to real API: GET /api/v1/telemetry/trends
   */
  public static async getTrend(params: TrendQueryParams): Promise<TrendDataPoint[]> {
    try {
      // In production environment with live TimescaleDB endpoint:
      // const res = await fetch(`/api/v1/telemetry/trends?elevatorId=${params.elevatorId}&metric=${params.metric}`);
      // if (res.ok) return await res.json();
    } catch {
      // Fallback cleanly to mock
    }

    const count = params.rangePreset === '30d' ? 7 : params.rangePreset === 'Today' ? 5 : 7;
    return generateMockTrendPoints(params.metric, count);
  }

  public static async getMotorCurrent(elevatorId: string, range?: string): Promise<TrendDataPoint[]> {
    return this.getTrend({ elevatorId, metric: 'motorCurrent', rangePreset: range });
  }

  public static async getControllerTemperature(elevatorId: string, range?: string): Promise<TrendDataPoint[]> {
    return this.getTrend({ elevatorId, metric: 'controllerTemperature', rangePreset: range });
  }

  public static async getDoorCycles(elevatorId: string, range?: string): Promise<TrendDataPoint[]> {
    return this.getTrend({ elevatorId, metric: 'doorCycles', rangePreset: range });
  }

  public static async getHealthScore(elevatorId: string, range?: string): Promise<TrendDataPoint[]> {
    return this.getTrend({ elevatorId, metric: 'healthScore', rangePreset: range });
  }
}
