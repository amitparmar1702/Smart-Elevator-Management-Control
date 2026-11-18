import { IOEMAdapter, NormalizedFault, OutboundOEMCommandPayload } from './oem-adapter.interface';
import { ElevatorCapabilities, ElevatorCommand, ElevatorTelemetry, DoorState, ElevatorDirection } from '@elevateos/types';

/**
 * Johnson Lifts OEM Adapter
 * Maps Johnson controller serial / RS-485 Modbus telemetry register packets
 */
export class JohnsonLiftsAdapter implements IOEMAdapter {
  readonly manufacturer = 'Johnson Lifts';

  getCapabilities(_model: string): ElevatorCapabilities {
    return {
      landingCall: 'SUPPORTED',
      destinationDispatch: 'UNSUPPORTED',
      remoteParking: 'SUPPORTED',
      doorHold: 'SUPPORTED',
      serviceModeControl: 'SUPPORTED',
      motorTelemetry: 'SUPPORTED',
      doorCycleTracking: 'SUPPORTED',
      weightSensor: 'SUPPORTED',
      vibrationSensor: 'SENSOR_REQUIRED',
    };
  }

  normalizeTelemetry(rawPayload: Record<string, any>): ElevatorTelemetry {
    let doorState: DoorState = 'CLOSED';
    const doorReg = Number(rawPayload.reg_door ?? 0);
    if (doorReg === 1) doorState = 'OPENING';
    else if (doorReg === 2) doorState = 'OPEN';
    else if (doorReg === 3) doorState = 'CLOSING';

    let direction: ElevatorDirection = 'STATIONARY';
    const dirReg = Number(rawPayload.reg_dir ?? 0);
    if (dirReg === 1) direction = 'UP';
    else if (dirReg === 2) direction = 'DOWN';

    return {
      elevatorId: rawPayload.unit_serial || rawPayload.lift_id || 'johnson-lift',
      timestamp: rawPayload.ts || new Date().toISOString(),
      floor: Number(rawPayload.reg_floor ?? 1),
      targetFloor: rawPayload.reg_target_floor ?? null,
      direction,
      velocityMps: Number(rawPayload.reg_speed ?? 0) / 100,
      doorState,
      doorCycles: Number(rawPayload.reg_door_cycles ?? 0),
      loadKg: Number(rawPayload.reg_load_kg ?? 0),
      loadPercent: Number(rawPayload.reg_load_pct ?? 0),
      isOverloaded: Boolean(rawPayload.reg_overload_flag),
      motorTempCelsius: Number(rawPayload.reg_motor_temp ?? 420) / 10,
      motorCurrentAmps: Number(rawPayload.reg_motor_current ?? 0) / 10,
      vibrationRms: Number(rawPayload.reg_vibe ?? 40) / 1000,
      controllerTempCelsius: Number(rawPayload.reg_ctrl_temp ?? 300) / 10,
      batteryVoltage: Number(rawPayload.reg_battery_v ?? 240) / 10,
      safetyChainClosed: Boolean(rawPayload.reg_safety_circuit === 1),
      emergencyStopActive: Boolean(rawPayload.reg_estop === 1),
      gatewayConnected: Boolean(rawPayload.modbus_online ?? true),
      lastUpdated: new Date().toISOString(),
    };
  }

  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload {
    return {
      rawCommand: `JOHNSON_MODBUS_CMD_${command.commandType}`,
      targetAddress: `SLAVE_ID_${command.elevatorId}`,
      payload: {
        registerAddress: 0x0100,
        commandCode: command.commandType === 'DISPATCH_CALL' ? 0x01 : 0x02,
        value: command.parameters.targetFloor || 0,
      },
      protocol: 'RS-485 Modbus-RTU',
    };
  }

  parseFaultCode(code: string | number): NormalizedFault {
    const codeStr = String(code);
    switch (codeStr) {
      case '01':
        return { faultCode: `JL-ERR-${codeStr}`, severity: 'CRITICAL', description: 'Emergency Stop Circuit Open', source: 'CONTROLLER' };
      case '05':
        return { faultCode: `JL-ERR-${codeStr}`, severity: 'WARNING', description: 'Door Lock Switch Timeout', source: 'SENSOR' };
      default:
        return { faultCode: `JL-ERR-${codeStr}`, severity: 'INFO', description: `Johnson Microprocessor Code ${codeStr}`, source: 'CONTROLLER' };
    }
  }
}
