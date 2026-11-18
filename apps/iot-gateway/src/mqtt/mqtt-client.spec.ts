import { ElevateOSMQTTClient } from './mqtt-client';

describe('ElevateOSMQTTClient', () => {
  let client: ElevateOSMQTTClient;

  beforeEach(() => {
    client = new ElevateOSMQTTClient({
      brokerUrl: 'mqtt://localhost:1883',
      clientId: 'test-gateway-agent',
    });
  });

  afterEach(() => {
    client.disconnect();
  });

  it('should initialize with disconnected status', () => {
    expect(client.getConnected()).toBe(false);
  });

  it('should gracefully handle publish attempts when broker is offline', () => {
    const published = client.publishTelemetry('org-1', 'bldg-1', 'elv-1', {
      elevatorId: 'elv-1',
      timestamp: new Date().toISOString(),
      floor: 1,
      targetFloor: null,
      direction: 'STATIONARY',
      velocityMps: 0,
      doorState: 'CLOSED',
      doorCycles: 100,
      loadKg: 200,
      loadPercent: 20,
      isOverloaded: false,
      motorTempCelsius: 40,
      motorCurrentAmps: 0,
      vibrationRms: 0.03,
      controllerTempCelsius: 30,
      batteryVoltage: 27,
      safetyChainClosed: true,
      emergencyStopActive: false,
      gatewayConnected: true,
      lastUpdated: new Date().toISOString(),
    });

    expect(published).toBe(false);
  });
});

