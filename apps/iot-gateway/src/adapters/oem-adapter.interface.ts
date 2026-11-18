import {
  ElevatorCapabilities,
  ElevatorCommand,
  ElevatorTelemetry,
  ElevatorStatus,
  ElevatorDirection,
  DoorState,
} from '@elevateos/types';

export interface NormalizedFault {
  faultCode: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  source: 'CONTROLLER' | 'SENSOR' | 'GATEWAY';
}

export interface OutboundOEMCommandPayload {
  rawCommand: string;
  targetAddress: string;
  payload: Record<string, any>;
  protocol: string;
}

export interface IOEMAdapter {
  readonly manufacturer: string;
  getCapabilities(model: string): ElevatorCapabilities;
  normalizeTelemetry(rawPayload: Record<string, any>): ElevatorTelemetry;
  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload;
  parseFaultCode(code: string | number): NormalizedFault;
}

