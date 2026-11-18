import { IOEMAdapter, NormalizedFault, OutboundOEMCommandPayload } from './oem-adapter.interface';
import { ElevatorCapabilities, ElevatorCommand, ElevatorTelemetry, DoorState, ElevatorDirection } from '@elevateos/types';

/**
 * Otis OEM Adapter
 * Maps Otis REM (Remote Elevator Monitoring) and Otis ONE IoT payloads
 */
export class OtisAdapter implements IOEMAdapter {
  readonly manufacturer = 'Otis';

  getCapabilities(model: string): ElevatorCapabilities {
    const isCompass = model.toLowerCase().includes('compass') || model.toLowerCase().includes('gen2');
    return {
      landingCall: 'SUPPORTED',
      destinationDispatch: isCompass ? 'SUPPORTED' : 'OEM_DEPENDENT',
      remoteParking: 'SUPPORTED',
      doorHold: 'SUPPORTED',
      serviceModeControl: 'SUPPORTED',
      motorTelemetry: 'SUPPORTED',
      doorCycleTracking: 'SUPPORTED',
      weightSensor: 'SUPPORTED',
      vibrationSensor: 'SUPPORTED',
    };
  }

  normalizeTelemetry(rawPayload: Record<string, any>): ElevatorTelemetry {
    let doorState: DoorState = 'CLOSED';
    const rawDoor = String(rawPayload.DOOR_STATE || '').toUpperCase();
    if (rawDoor === 'OPN' || rawDoor === 'OPEN') doorState = 'OPEN';
    else if (rawDoor === 'OPG' || rawDoor === 'OPENING') doorState = 'OPENING';
    else if (rawDoor === 'CLG' || rawDoor === 'CLOSING') doorState = 'CLOSING';

    let direction: ElevatorDirection = 'STATIONARY';
    const rawDir = String(rawPayload.DIR || '').toUpperCase();
    if (rawDir === 'U' || rawDir === 'UP') direction = 'UP';
    else if (rawDir === 'D' || rawDir === 'DOWN') direction = 'DOWN';

    return {
      elevatorId: rawPayload.UNIT_ID || rawPayload.REM_DEVICE_ID || 'otis-car',
      timestamp: rawPayload.TIMESTAMP || new Date().toISOString(),
      floor: Number(rawPayload.POSITION_FLOOR ?? 1),
      targetFloor: rawPayload.DESTINATION_FLOOR ?? null,
      direction,
      velocityMps: Number(rawPayload.CAR_SPEED ?? 0),
      doorState,
      doorCycles: Number(rawPayload.TOTAL_DOOR_CYCLES ?? 0),
      loadKg: Number(rawPayload.CAR_LOAD_KG ?? 0),
      loadPercent: Number(rawPayload.PERCENT_FULL ?? 0),
      isOverloaded: Boolean(rawPayload.OVERLOAD_FLAG),
      motorTempCelsius: Number(rawPayload.HOIST_MOTOR_TEMP ?? 41.5),
      motorCurrentAmps: Number(rawPayload.ARMATURE_CURRENT ?? 0),
      vibrationRms: Number(rawPayload.CAB_ACCEL_RMS ?? 0.035),
      controllerTempCelsius: Number(rawPayload.GECB_TEMP ?? 33),
      batteryVoltage: Number(rawPayload.EMERGENCY_BATTERY_V ?? 26.8),
      safetyChainClosed: Boolean(rawPayload.SAFETY_STRING_STATUS === 1 || rawPayload.SAFETY_STRING_STATUS === 'CLOSED'),
      emergencyStopActive: Boolean(rawPayload.E_STOP_TRIPPED),
      gatewayConnected: Boolean(rawPayload.OTIS_ONE_CONNECTED ?? true),
      lastUpdated: new Date().toISOString(),
    };
  }

  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload {
    return {
      rawCommand: `OTIS_REM_${command.commandType}`,
      targetAddress: `OTIS_GECB_${command.elevatorId}`,
      payload: {
        unitId: command.elevatorId,
        cmd: command.commandType,
        destination: command.parameters.targetFloor,
        mode: command.commandType === 'DISPATCH_CALL' ? 'COMPASS_DESPATCH' : 'NORMAL',
      },
      protocol: 'Otis REM / GECB Serial Protocol',
    };
  }

  parseFaultCode(code: string | number): NormalizedFault {
    const codeStr = String(code);
    switch (codeStr) {
      case '0100':
        return { faultCode: `OTIS-${codeStr}`, severity: 'CRITICAL', description: 'GECB Operational Fault / E-Stop Active', source: 'CONTROLLER' };
      case '0200':
        return { faultCode: `OTIS-${codeStr}`, severity: 'WARNING', description: 'Door Dwell Time Exceeded / Obstruction', source: 'SENSOR' };
      case '0300':
        return { faultCode: `OTIS-${codeStr}`, severity: 'CRITICAL', description: 'Traction Drive Thermal Overload', source: 'CONTROLLER' };
      default:
        return { faultCode: `OTIS-${codeStr}`, severity: 'INFO', description: `Otis Controller Event ${codeStr}`, source: 'CONTROLLER' };
    }
  }
}
