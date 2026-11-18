import { IOEMAdapter, NormalizedFault, OutboundOEMCommandPayload } from './oem-adapter.interface';
import { ElevatorCapabilities, ElevatorCommand, ElevatorTelemetry } from '@elevateos/types';

export class GenericAdapter implements IOEMAdapter {
  readonly manufacturer = 'Generic / CiA-417';

  getCapabilities(_model: string): ElevatorCapabilities {
    return {
      landingCall: 'SUPPORTED',
      destinationDispatch: 'SUPPORTED',
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
    return {
      elevatorId: rawPayload.elevatorId || 'generic-elv',
      timestamp: rawPayload.timestamp || new Date().toISOString(),
      floor: Number(rawPayload.floor ?? 1),
      targetFloor: rawPayload.targetFloor ?? null,
      direction: rawPayload.direction || 'STATIONARY',
      velocityMps: Number(rawPayload.velocityMps ?? 0),
      doorState: rawPayload.doorState || 'CLOSED',
      doorCycles: Number(rawPayload.doorCycles ?? 0),
      loadKg: Number(rawPayload.loadKg ?? 0),
      loadPercent: Number(rawPayload.loadPercent ?? 0),
      isOverloaded: Boolean(rawPayload.isOverloaded),
      motorTempCelsius: Number(rawPayload.motorTempCelsius ?? 40),
      motorCurrentAmps: Number(rawPayload.motorCurrentAmps ?? 0),
      vibrationRms: Number(rawPayload.vibrationRms ?? 0.05),
      controllerTempCelsius: Number(rawPayload.controllerTempCelsius ?? 30),
      batteryVoltage: Number(rawPayload.batteryVoltage ?? 24),
      safetyChainClosed: Boolean(rawPayload.safetyChainClosed ?? true),
      emergencyStopActive: Boolean(rawPayload.emergencyStopActive ?? false),
      gatewayConnected: Boolean(rawPayload.gatewayConnected ?? true),
      lastUpdated: new Date().toISOString(),
    };
  }

  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload {
    return {
      rawCommand: `CIA417_${command.commandType}`,
      targetAddress: `NODE_${command.elevatorId}`,
      payload: command.parameters,
      protocol: 'CANopen CiA-417 / Modbus-TCP',
    };
  }

  parseFaultCode(code: string | number): NormalizedFault {
    const codeStr = String(code);
    switch (codeStr) {
      case 'E-101':
        return { faultCode: 'E-101', severity: 'CRITICAL', description: 'Safety Chain Circuit Opened', source: 'CONTROLLER' };
      case 'E-204':
        return { faultCode: 'E-204', severity: 'WARNING', description: 'Door Sensor Obstruction Exceeded Timeout', source: 'SENSOR' };
      case 'E-310':
        return { faultCode: 'E-310', severity: 'CRITICAL', description: 'Traction Motor Overtemperature Warning', source: 'CONTROLLER' };
      case 'E-401':
        return { faultCode: 'E-401', severity: 'WARNING', description: 'Cabin Load Exceeded Maximum Rated Capacity', source: 'SENSOR' };
      default:
        return { faultCode: codeStr, severity: 'INFO', description: `Generic Controller Event ${codeStr}`, source: 'CONTROLLER' };
    }
  }
}

