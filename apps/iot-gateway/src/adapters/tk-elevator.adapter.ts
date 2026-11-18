import { IOEMAdapter, NormalizedFault, OutboundOEMCommandPayload } from './oem-adapter.interface';
import { ElevatorCapabilities, ElevatorCommand, ElevatorTelemetry, DoorState, ElevatorDirection } from '@elevateos/types';

/**
 * TK Elevator (thyssenkrupp) OEM Adapter
 * Maps TKE MAX cloud telemetry and TAC family controller interfaces
 */
export class TKElevatorAdapter implements IOEMAdapter {
  readonly manufacturer = 'TK Elevator';

  getCapabilities(model: string): ElevatorCapabilities {
    const isMax = model.toLowerCase().includes('max') || model.toLowerCase().includes('tac');
    return {
      landingCall: 'SUPPORTED',
      destinationDispatch: isMax ? 'SUPPORTED' : 'UNSUPPORTED',
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
    if (rawPayload.doorStateCode === 'DOOR_OPEN') doorState = 'OPEN';
    else if (rawPayload.doorStateCode === 'DOOR_OPENING') doorState = 'OPENING';
    else if (rawPayload.doorStateCode === 'DOOR_CLOSING') doorState = 'CLOSING';

    let direction: ElevatorDirection = 'STATIONARY';
    if (rawPayload.directionOfTravel === 'UP') direction = 'UP';
    else if (rawPayload.directionOfTravel === 'DOWN') direction = 'DOWN';

    return {
      elevatorId: rawPayload.elevatorIdentifier || rawPayload.unitId || 'tke-car',
      timestamp: rawPayload.messageTimestamp || new Date().toISOString(),
      floor: Number(rawPayload.currentCarFloor ?? 1),
      targetFloor: rawPayload.assignedTargetFloor ?? null,
      direction,
      velocityMps: Number(rawPayload.velocityMetersPerSec ?? 0),
      doorState,
      doorCycles: Number(rawPayload.cumulativeDoorCycles ?? 0),
      loadKg: Number(rawPayload.measuredCarWeightKg ?? 0),
      loadPercent: Number(rawPayload.loadPercentOfCapacity ?? 0),
      isOverloaded: Boolean(rawPayload.overloadAlarmActive),
      motorTempCelsius: Number(rawPayload.tractionDriveTemperatureCelsius ?? 40.5),
      motorCurrentAmps: Number(rawPayload.motorPhaseCurrentAmps ?? 0),
      vibrationRms: Number(rawPayload.rideComfortVibrationRms ?? 0.038),
      controllerTempCelsius: Number(rawPayload.tacControllerTempCelsius ?? 31.0),
      batteryVoltage: Number(rawPayload.batteryBackupVoltageVolts ?? 26.5),
      safetyChainClosed: Boolean(rawPayload.safetyStringContinuity === true),
      emergencyStopActive: Boolean(rawPayload.emergencyStopInputActive),
      gatewayConnected: Boolean(rawPayload.maxEdgeBoxConnected ?? true),
      lastUpdated: new Date().toISOString(),
    };
  }

  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload {
    return {
      rawCommand: `TKE_MAX_${command.commandType}`,
      targetAddress: `TKE_TAC_${command.elevatorId}`,
      payload: {
        commandType: command.commandType,
        destinationFloorIndex: command.parameters.targetFloor,
        clientKey: command.idempotencyKey,
      },
      protocol: 'TKE MAX IoT / REST over TLS',
    };
  }

  parseFaultCode(code: string | number): NormalizedFault {
    const codeStr = String(code);
    switch (codeStr) {
      case '1000':
        return { faultCode: `TKE-${codeStr}`, severity: 'CRITICAL', description: 'Safety Chain Circuit Opened (TAC-50)', source: 'CONTROLLER' };
      case '1020':
        return { faultCode: `TKE-${codeStr}`, severity: 'WARNING', description: 'Door Open Dwell Timeout', source: 'SENSOR' };
      default:
        return { faultCode: `TKE-${codeStr}`, severity: 'INFO', description: `TKE Controller Diagnostic Code ${codeStr}`, source: 'CONTROLLER' };
    }
  }
}
