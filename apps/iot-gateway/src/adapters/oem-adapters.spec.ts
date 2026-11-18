import { OEMAdapterRegistry, KONEAdapter, OtisAdapter, SchindlerAdapter, TKElevatorAdapter, JohnsonLiftsAdapter } from './index';

describe('OEM Adapter Architecture & Protocol Mapping', () => {
  it('should resolve specific OEM adapter for recognized manufacturers', () => {
    expect(OEMAdapterRegistry.getAdapter('KONE')).toBeInstanceOf(KONEAdapter);
    expect(OEMAdapterRegistry.getAdapter('Otis')).toBeInstanceOf(OtisAdapter);
    expect(OEMAdapterRegistry.getAdapter('Schindler')).toBeInstanceOf(SchindlerAdapter);
    expect(OEMAdapterRegistry.getAdapter('TK Elevator')).toBeInstanceOf(TKElevatorAdapter);
    expect(OEMAdapterRegistry.getAdapter('Johnson Lifts')).toBeInstanceOf(JohnsonLiftsAdapter);
  });

  it('should fall back to GenericAdapter for unknown manufacturers', () => {
    const adapter = OEMAdapterRegistry.getAdapter('Unknown Elevator Brand');
    expect(adapter.manufacturer).toContain('Generic');
  });

  it('should correctly normalize KONE KCF telemetry payload', () => {
    const kone = new KONEAdapter();
    const rawKone = {
      equipment_id: 'kone-dx-99',
      current_floor_number: 7,
      door_status: 2, // OPEN
      movement_direction: 1, // UP
      speed_actual: 2.5,
      passenger_load_kg: 450,
      load_percentage: 45,
      traction_drive_temp: 48.2,
      safety_circuit_state: 'CLOSED',
    };

    const telemetry = kone.normalizeTelemetry(rawKone);
    expect(telemetry.elevatorId).toBe('kone-dx-99');
    expect(telemetry.floor).toBe(7);
    expect(telemetry.doorState).toBe('OPEN');
    expect(telemetry.direction).toBe('UP');
    expect(telemetry.safetyChainClosed).toBe(true);
    expect(telemetry.motorTempCelsius).toBe(48.2);
  });

  it('should correctly normalize Otis REM telemetry payload', () => {
    const otis = new OtisAdapter();
    const rawOtis = {
      UNIT_ID: 'otis-compass-01',
      POSITION_FLOOR: 12,
      DOOR_STATE: 'OPN',
      DIR: 'U',
      CAR_SPEED: 3.0,
      CAR_LOAD_KG: 600,
      PERCENT_FULL: 60,
      SAFETY_STRING_STATUS: 1,
      HOIST_MOTOR_TEMP: 43.1,
    };

    const telemetry = otis.normalizeTelemetry(rawOtis);
    expect(telemetry.elevatorId).toBe('otis-compass-01');
    expect(telemetry.floor).toBe(12);
    expect(telemetry.doorState).toBe('OPEN');
    expect(telemetry.direction).toBe('UP');
    expect(telemetry.safetyChainClosed).toBe(true);
  });

  it('should translate dispatch command to OEM format with destination floor', () => {
    const schindler = new SchindlerAdapter();
    const cmd: any = {
      id: 'cmd-1',
      elevatorId: 'sch-01',
      commandType: 'DISPATCH_CALL',
      parameters: { targetFloor: 14 },
      idempotencyKey: 'idem-test',
    };

    const outbound = schindler.translateCommand(cmd);
    expect(outbound.rawCommand).toBe('SCHINDLER_AHEAD_DISPATCH_CALL');
    expect(outbound.payload.destinationFloor).toBe(14);
  });
});

