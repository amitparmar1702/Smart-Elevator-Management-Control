import { MOCK_COMPONENT_PREDICTIONS, ComponentWearPrediction } from '../mocks/predictionMock';

export class PredictionService {
  /**
   * Fetches Remaining Useful Life (RUL) and component wear predictions.
   * Backed by mock implementation until predictive AI service is wired.
   * TODO: connect to real API: GET /api/v1/analytics/predictive/wear/:elevatorId
   */
  public static async getWearPredictions(elevatorId: string): Promise<ComponentWearPrediction[]> {
    try {
      // In production environment:
      // const res = await fetch(`/api/v1/analytics/predictive/wear/${elevatorId}`);
      // if (res.ok) return await res.json();
    } catch {
      // Fallback cleanly to mock
    }
    return MOCK_COMPONENT_PREDICTIONS[elevatorId] || MOCK_COMPONENT_PREDICTIONS['default'];
  }
}
