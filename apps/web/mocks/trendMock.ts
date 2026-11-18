// TODO: connect to real API: GET /api/v1/telemetry/trends/:elevatorId?metric=:metric&from=:from&to=:to

export interface TrendDataPoint {
  timestamp: string;
  timeLabel: string;
  value: number;
}

export function generateMockTrendPoints(
  metric: 'motorCurrent' | 'controllerTemperature' | 'doorCycles' | 'healthScore',
  pointsCount: number = 7
): TrendDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseValues: Record<string, { base: number; variance: number }> = {
    motorCurrent: { base: 28.5, variance: 4.2 },
    controllerTemperature: { base: 38.2, variance: 3.5 },
    doorCycles: { base: 450, variance: 120 },
    healthScore: { base: 92, variance: 4 },
  };

  const config = baseValues[metric] || { base: 50, variance: 10 };

  return days.slice(0, pointsCount).map((day, idx) => {
    // Generate deterministic values for consistency
    const seed = (idx + 1) * 1.7;
    const offset = Math.sin(seed) * config.variance;
    const value = Math.max(0, parseFloat((config.base + offset).toFixed(1)));
    return {
      timestamp: `2026-11-${String(10 + idx).padStart(2, '0')}`,
      timeLabel: day,
      value,
    };
  });
}
