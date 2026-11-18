import { IOEMAdapter, NormalizedFault, OutboundOEMCommandPayload } from './oem-adapter.interface';
import { ElevatorCapabilities, ElevatorCommand, ElevatorTelemetry, DoorState, ElevatorDirection } from '@elevateos/types';

/**
 * Schindler OEM Adapter
 * Maps Schindler Ahead IoT telemetry and PORT destination dispatch protocol
 */
export class SchindlerAdapter implements IOEMAdapter {
  readonly manufacturer = 'Schindler';

  getCapabilities(model: string): ElevatorCapabilities {
    const isPort = model.toLowerCase().includes('port') || model.toLowerCase().includes('ahead');
    return {
      landingCall: 'SUPPORTED',
      destinationDispatch: isPort ? 'SUPPORTED' : 'UNSUPPORTED',
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
    if (rawPayload.doorState === 'Open' || rawPayload.doorState === 'OPEN') doorState = 'OPEN';
    else if (rawPayload.doorState === 'Opening') doorState = 'OPENING';
    else if (rawPayload.doorState === 'Closing') doorState = 'CLOSING';

    let direction: ElevatorDirection = 'STATIONARY';
    if (rawPayload.travelDirection === 'Up') direction = 'UP';
    else if (rawPayload.travelDirection === 'Down') direction = 'DOWN';

    return {
      elevatorId: rawPayload.installationNumber || rawPayload.carId || 'schindler-car',
      timestamp: rawPayload.timestamp || new Date().toISOString(),
      floor: Number(rawPayload.actualFloor ?? 1),
      targetFloor: rawPayload.targetFloor ?? null,
      direction,
      velocityMps: Number(rawPayload.speed ?? 0),
      doorState,
      doorCycles: Number(rawPayload.doorOperationCounter ?? 0),
      loadKg: Number(rawPayload.carLoadWeight ?? 0),
      loadPercent: Number(rawPayload.loadPercent ?? 0),
      isOverloaded: Boolean(rawPayload.loadOverweight),
      motorTempCelsius: Number(rawPayload.tractionMotorTemperature ?? 43),
      motorCurrentAmps: Number(rawPayload.driveCurrent ?? 0),
      vibrationRms: Number(rawPayload.vibrationMagnitude ?? 0.04),
      controllerTempCelsius: Number(rawPayload.cabinetTemperature ?? 29),
      batteryVoltage: Number(rawPayload.upsVoltage ?? 27.0),
      safetyChainClosed: Boolean(rawPayload.safetyLineStatus === 'Active' || rawPayload.safetyLineStatus === true),
      emergencyStopActive: Boolean(rawPayload.emergencyStopTriggered),
      gatewayConnected: Boolean(rawPayload.aheadCubeConnected ?? true),
      lastUpdated: new Date().toISOString(),
    };
  }

  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload {
    return {
      rawCommand: `SCHINDLER_AHEAD_${command.commandType}`,
      targetAddress: `SCHINDLER_CUBE_${command.elevatorId}`,
      payload: {
        commandType: command.commandType,
        destinationFloor: command.parameters.targetFloor,
        executionPriority: 'NORMAL',
        token: command.idempotencyKey,
      },
      protocol: 'Schindler Ahead Cube / MQTT JSON',
    };
  }

  parseFaultCode(code: string | number): NormalizedFault {
    const codeStr = String(code);
    switch (codeStr) {
      case '001':
        return { faultCode: `SCH-${codeStr}`, severity: 'CRITICAL', description: 'Safety Circuit Open / Car Stoppage', source: 'CONTROLLER' };
      case '008':
        return { faultCode: `SCH-${codeStr}`, severity: 'WARNING', description: 'Curtain of Light Obstruction Detected', source: 'SENSOR' };
      default:
        return { faultCode: `SCH-${codeStr}`, severity: 'INFO', description: `Schindler Controller Event ${codeStr}`, source: 'CONTROLLER' };
    }
  }
}
