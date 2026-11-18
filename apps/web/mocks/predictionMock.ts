// TODO: connect to real API: GET /api/v1/analytics/predictive/wear/:elevatorId

export interface ComponentWearPrediction {
  id: string;
  component: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  wearPercent: number;
  daysUntilService: number;
  suggestedServiceDate: string;
  recommendedAction: string;
}

export const MOCK_COMPONENT_PREDICTIONS: Record<string, ComponentWearPrediction[]> = {
  'default': [
    {
      id: 'cmp-ropes',
      component: 'Hoist ropes & tensioners',
      riskLevel: 'LOW',
      wearPercent: 18,
      daysUntilService: 310,
      suggestedServiceDate: '22 Sep 2027',
      recommendedAction: 'Inspect cable crowning and lubricant coating during annual safety test.',
    },
    {
      id: 'cmp-door',
      component: 'Door operator motor & belt',
      riskLevel: 'MEDIUM',
      wearPercent: 44,
      daysUntilService: 140,
      suggestedServiceDate: '05 Apr 2027',
      recommendedAction: 'Check toothed belt tension and optical encoder alignment.',
    },
    {
      id: 'cmp-brakes',
      component: 'Electromechanical brake pads',
      riskLevel: 'LOW',
      wearPercent: 26,
      daysUntilService: 195,
      suggestedServiceDate: '30 May 2027',
      recommendedAction: 'Measure disc lining air gap clearance with feeler gauge (nominal 0.35 mm).',
    },
    {
      id: 'cmp-guides',
      component: 'Car guide shoes & liners',
      riskLevel: 'HIGH',
      wearPercent: 78,
      daysUntilService: 38,
      suggestedServiceDate: '24 Dec 2026',
      recommendedAction: 'Replace polyurethane guide shoe inserts to eliminate lateral vibration harmonics.',
    },
  ],
};
