import { IOEMAdapter, NormalizedFault, OutboundOEMCommandPayload } from './oem-adapter.interface';
import { ElevatorCapabilities, ElevatorCommand, ElevatorTelemetry, DoorState, ElevatorDirection } from '@elevateos/types';

/**
 * KONE OEM Adapter
 * Maps KONE Connected Services (KCF) and Polaris destination control telemetry
 */
export class KONEAdapter implements IOEMAdapter {
  readonly manufacturer = 'KONE';

  getCapabilities(model: string): ElevatorCapabilities {
    const isPolaris = model.toLowerCase().includes('polaris') || model.toLowerCase().includes('dx');
    return {
      landingCall: 'SUPPORTED',
      destinationDispatch: isPolaris ? 'SUPPORTED' : 'UNSUPPORTED',
      remoteParking: 'SUPPORTED',
      doorHold: 'SUPPORTED',
      serviceModeControl: 'SUPPORTED',
      motorTelemetry: 'SUPPORTED',
      doorCycleTracking: 'SUPPORTED',
      weightSensor: 'SUPPORTED',
      vibrationSensor: 'OEM_DEPENDENT',
    };
  }

  normalizeTelemetry(rawPayload: Record<string, any>): ElevatorTelemetry {
    let doorState: DoorState = 'CLOSED';
    if (rawPayload.door_status === 1 || rawPayload.door_status === 'OPENING') doorState = 'OPENING';
    else if (rawPayload.door_status === 2 || rawPayload.door_status === 'OPEN') doorState = 'OPEN';
    else if (rawPayload.door_status === 3 || rawPayload.door_status === 'CLOSING') doorState = 'CLOSING';

    let direction: ElevatorDirection = 'STATIONARY';
    if (rawPayload.movement_direction === 1 || rawPayload.movement_direction === 'UP') direction = 'UP';
    else if (rawPayload.movement_direction === 2 || rawPayload.movement_direction === 'DOWN') direction = 'DOWN';

    return {
      elevatorId: rawPayload.equipment_id || rawPayload.kone_asset_id || 'kone-car',
      timestamp: rawPayload.event_timestamp || new Date().toISOString(),
      floor: Number(rawPayload.current_floor_number ?? 1),
      targetFloor: rawPayload.next_stop_floor ?? null,
      direction,
      velocityMps: Number(rawPayload.speed_actual ?? 0),
      doorState,
      doorCycles: Number(rawPayload.door_cycle_count ?? 0),
      loadKg: Number(rawPayload.passenger_load_kg ?? 0),
      loadPercent: Number(rawPayload.load_percentage ?? 0),
      isOverloaded: Boolean(rawPayload.overload_active),
      motorTempCelsius: Number(rawPayload.traction_drive_temp ?? 42),
      motorCurrentAmps: Number(rawPayload.inverter_current ?? 0),
      vibrationRms: Number(rawPayload.car_vibration_rms ?? 0.04),
      controllerTempCelsius: Number(rawPayload.lce_board_temp ?? 31),
      batteryVoltage: Number(rawPayload.backup_battery_voltage ?? 27.4),
      safetyChainClosed: Boolean(rawPayload.safety_circuit_state === 'CLOSED' || rawPayload.safety_circuit_state === true),
      emergencyStopActive: Boolean(rawPayload.emergency_stop_triggered),
      gatewayConnected: Boolean(rawPayload.kcf_gateway_online ?? true),
      lastUpdated: new Date().toISOString(),
    };
  }

  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload {
    return {
      rawCommand: `KONE_KCF_${command.commandType}`,
      targetAddress: `KONE_DEV_${command.elevatorId}`,
      payload: {
        koneCommandId: command.id,
        targetFloor: command.parameters.targetFloor,
        dispatchMode: command.commandType === 'DISPATCH_CALL' ? 'POLARIS_DOP' : 'CONVENTIONAL',
        dwellTimeSeconds: command.parameters.holdDurationSeconds || 5,
      },
      protocol: 'KONE KCF / WebSocket JSON',
    };
  }

  parseFaultCode(code: string | number): NormalizedFault {
    const codeStr = String(code);
    switch (codeStr) {
      case '0021':
        return { faultCode: `KONE-${codeStr}`, severity: 'CRITICAL', description: 'Safety Chain Circuit Broken (LCE-CPU)', source: 'CONTROLLER' };
      case '0026':
        return { faultCode: `KONE-${codeStr}`, severity: 'WARNING', description: 'Drive Inverter Thermal Warning', source: 'CONTROLLER' };
      case '0044':
        return { faultCode: `KONE-${codeStr}`, severity: 'WARNING', description: 'Door Photocell Reversal Multi-Trigger', source: 'SENSOR' };
      default:
        return { faultCode: `KONE-${codeStr}`, severity: 'INFO', description: `KONE Controller Event ${codeStr}`, source: 'CONTROLLER' };
    }
  }
}
