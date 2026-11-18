import {
  ElevatorDirection,
  DoorState,
  ElevatorStatus,
  ElevatorTelemetry,
} from '@elevateos/types';

export interface SimulatedCarConfig {
  id: string;
  name: string;
  assetCode: string;
  minFloor: number;
  maxFloor: number;
  ratedSpeedMps: number;
  capacityKg: number;
  initialFloor?: number;
}

export class SimulatedCar {
  public id: string;
  public name: string;
  public assetCode: string;
  public minFloor: number;
  public maxFloor: number;
  public ratedSpeedMps: number;
  public capacityKg: number;

  public currentFloor: number;
  public targetFloor: number | null = null;
  public direction: ElevatorDirection = 'STATIONARY';
  public velocityMps = 0;
  public doorState: DoorState = 'CLOSED';
  public doorCycles = 12400;
  public loadKg = 280;
  public isOverloaded = false;
  public motorTempCelsius = 42.0;
  public motorCurrentAmps = 0.0;
  public vibrationRms = 0.04;
  public safetyChainClosed = true;
  public emergencyStopActive = false;
  public gatewayConnected = true;

  private doorTimerMs = 0;
  private readonly FLOOR_HEIGHT_METERS = 3.5;

  constructor(config: SimulatedCarConfig) {
    this.id = config.id;
    this.name = config.name;
    this.assetCode = config.assetCode;
    this.minFloor = config.minFloor;
    this.maxFloor = config.maxFloor;
    this.ratedSpeedMps = config.ratedSpeedMps;
    this.capacityKg = config.capacityKg;
    this.currentFloor = config.initialFloor ?? 1;
  }

  /**
   * Dispatches the car to a destination floor
   */
  public dispatchTo(floor: number): boolean {
    if (floor < this.minFloor || floor > this.maxFloor) {
      return false;
    }
    if (!this.safetyChainClosed || this.emergencyStopActive) {
      return false;
    }
    this.targetFloor = floor;
    if (floor > Math.round(this.currentFloor)) {
      this.direction = 'UP';
    } else if (floor < Math.round(this.currentFloor)) {
      this.direction = 'DOWN';
    } else {
      this.direction = 'STATIONARY';
      this.openDoors();
    }
    return true;
  }

  public openDoors() {
    if (this.velocityMps === 0) {
      this.doorState = 'OPENING';
      this.doorTimerMs = 0;
    }
  }

  public closeDoors() {
    this.doorState = 'CLOSING';
    this.doorTimerMs = 0;
  }

  public triggerFault(faultType: 'OVERHEAT' | 'SAFETY_CHAIN_OPEN' | 'DOOR_OBSTRUCTION' | 'OVERLOAD') {
    switch (faultType) {
      case 'OVERHEAT':
        this.motorTempCelsius = 84.5;
        break;
      case 'SAFETY_CHAIN_OPEN':
        this.safetyChainClosed = false;
        this.velocityMps = 0;
        this.direction = 'STATIONARY';
        break;
      case 'DOOR_OBSTRUCTION':
        this.doorState = 'OPEN';
        this.doorTimerMs = 0;
        break;
      case 'OVERLOAD':
        this.loadKg = this.capacityKg + 150;
        this.isOverloaded = true;
        this.doorState = 'OPEN';
        break;
    }
  }

  public resetFaults() {
    this.safetyChainClosed = true;
    this.emergencyStopActive = false;
    this.isOverloaded = false;
    this.loadKg = 240;
    this.motorTempCelsius = 42.0;
  }

  /**
   * Physics simulation step executed every dtMs milliseconds
   */
  public update(dtMs: number) {
    const dtSeconds = dtMs / 1000;

    // 1. Door state machine
    if (this.doorState === 'OPENING') {
      this.doorTimerMs += dtMs;
      if (this.doorTimerMs >= 2000) {
        this.doorState = 'OPEN';
        this.doorTimerMs = 0;
      }
      return;
    } else if (this.doorState === 'OPEN') {
      this.doorTimerMs += dtMs;
      if (this.doorTimerMs >= 3500 && !this.isOverloaded) {
        this.doorState = 'CLOSING';
        this.doorTimerMs = 0;
      }
      return;
    } else if (this.doorState === 'CLOSING') {
      this.doorTimerMs += dtMs;
      if (this.doorTimerMs >= 2000) {
        this.doorState = 'CLOSED';
        this.doorCycles += 1;
        this.doorTimerMs = 0;
      }
      return;
    }

    // 2. Motion mechanics
    if (this.targetFloor !== null && this.doorState === 'CLOSED' && this.safetyChainClosed) {
      const targetMeters = (this.targetFloor - 1) * this.FLOOR_HEIGHT_METERS;
      const currentMeters = (this.currentFloor - 1) * this.FLOOR_HEIGHT_METERS;
      const distance = targetMeters - currentMeters;

      if (Math.abs(distance) < 0.05) {
        // Arrived at floor
        this.currentFloor = this.targetFloor;
        this.targetFloor = null;
        this.velocityMps = 0;
        this.direction = 'STATIONARY';
        this.motorCurrentAmps = 0;
        this.openDoors();
      } else {
        // Moving
        const sign = distance > 0 ? 1 : -1;
        this.direction = sign > 0 ? 'UP' : 'DOWN';
        this.velocityMps = this.ratedSpeedMps;

        const deltaMeters = sign * this.velocityMps * dtSeconds;
        const newMeters = currentMeters + deltaMeters;
        this.currentFloor = 1 + newMeters / this.FLOOR_HEIGHT_METERS;

        // Motor current depends on load & direction relative to 50% counterweight
        const loadRatio = this.loadKg / this.capacityKg;
        const counterweightRatio = 0.5;
        const imbalance = (loadRatio - counterweightRatio) * sign;
        this.motorCurrentAmps = Math.max(4.0, 14.0 + imbalance * 12.0);

        // Thermal climbing
        this.motorTempCelsius = Math.min(78.0, this.motorTempCelsius + 0.04 * dtSeconds);
        this.vibrationRms = 0.06 + Math.random() * 0.02;
      }
    } else {
      // Idle cooling
      this.velocityMps = 0;
      this.direction = 'STATIONARY';
      this.motorCurrentAmps = 0.8;
      this.vibrationRms = 0.02;
      if (this.motorTempCelsius > 38.0) {
        this.motorTempCelsius -= 0.02 * dtSeconds;
      }
    }
  }

  public getTelemetry(): ElevatorTelemetry {
    const loadPercent = Math.min(100, (this.loadKg / this.capacityKg) * 100);

    return {
      elevatorId: this.id,
      timestamp: new Date().toISOString(),
      floor: Number(this.currentFloor.toFixed(2)),
      targetFloor: this.targetFloor,
      direction: this.direction,
      velocityMps: Number(this.velocityMps.toFixed(2)),
      doorState: this.doorState,
      doorCycles: this.doorCycles,
      loadKg: Math.round(this.loadKg),
      loadPercent: Number(loadPercent.toFixed(1)),
      isOverloaded: this.isOverloaded,
      motorTempCelsius: Number(this.motorTempCelsius.toFixed(1)),
      motorCurrentAmps: Number(this.motorCurrentAmps.toFixed(1)),
      vibrationRms: Number(this.vibrationRms.toFixed(3)),
      controllerTempCelsius: 32.5,
      batteryVoltage: 27.2,
      safetyChainClosed: this.safetyChainClosed,
      emergencyStopActive: this.emergencyStopActive,
      gatewayConnected: this.gatewayConnected,
      lastUpdated: new Date().toISOString(),
    };
  }
}

