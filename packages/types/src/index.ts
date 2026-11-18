export type ElevatorStatus =
  | 'RUNNING'
  | 'IDLE'
  | 'WARNING'
  | 'FAULT'
  | 'MAINTENANCE'
  | 'OFFLINE'
  | 'EMERGENCY';

export type ElevatorDirection = 'UP' | 'DOWN' | 'STATIONARY';
export type DoorState = 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING';

export type CapabilityStatus =
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'OEM_DEPENDENT'
  | 'SENSOR_REQUIRED';

export interface ElevatorCapabilities {
  landingCall: CapabilityStatus;
  destinationDispatch: CapabilityStatus;
  remoteParking: CapabilityStatus;
  doorHold: CapabilityStatus;
  serviceModeControl: CapabilityStatus;
  motorTelemetry: CapabilityStatus;
  doorCycleTracking: CapabilityStatus;
  weightSensor: CapabilityStatus;
  vibrationSensor: CapabilityStatus;
}

export interface ElevatorTelemetry {
  elevatorId: string;
  timestamp: string;
  floor: number;
  targetFloor: number | null;
  direction: ElevatorDirection;
  velocityMps: number;
  doorState: DoorState;
  doorCycles: number;
  loadKg: number;
  loadPercent: number;
  isOverloaded: boolean;
  motorTempCelsius: number;
  motorCurrentAmps: number;
  vibrationRms: number;
  controllerTempCelsius: number;
  batteryVoltage: number;
  safetyChainClosed: boolean;
  emergencyStopActive: boolean;
  gatewayConnected: boolean;
  lastUpdated: string;
}

export type CommandType =
  | 'DISPATCH_CALL'
  | 'PARK_FLOOR'
  | 'SET_SERVICE_MODE'
  | 'DOOR_HOLD'
  | 'CLEAR_FAULT';

export type CommandStatus =
  | 'REQUESTED'
  | 'VALIDATING'
  | 'AWAITING_APPROVAL'
  | 'QUEUED'
  | 'SENT'
  | 'ACKNOWLEDGED'
  | 'EXECUTING'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface ElevatorCommand {
  id: string;
  organisationId: string;
  buildingId: string;
  elevatorId: string;
  requestedByUserId: string;
  commandType: CommandType;
  parameters: Record<string, any>;
  correlationId: string;
  idempotencyKey: string;
  status: CommandStatus;
  expiresAt: string;
  createdAt: string;
  acknowledgedAt?: string;
  verifiedAt?: string;
  failureReason?: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_SUPPORT'
  | 'ORGANISATION_ADMIN'
  | 'BUILDING_MANAGER'
  | 'FACILITY_MANAGER'
  | 'SECURITY_OPERATOR'
  | 'RESIDENT'
  | 'TECHNICIAN'
  | 'TECHNICIAN_SUPERVISOR'
  | 'SERVICE_VENDOR_ADMIN'
  | 'AUDITOR'
  | 'EMERGENCY_OPERATOR';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organisationId?: string;
  role: UserRole;
  buildingIds: string[];
  elevatorIds: string[];
  mfaEnabled: boolean;
}

