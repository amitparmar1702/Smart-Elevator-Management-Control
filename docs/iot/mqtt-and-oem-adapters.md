# ElevateOS - IoT Architecture, MQTT Topics & OEM Adapters

## 1. IoT & MQTT Topology
```
[ Elevator Controller ]
         │ (RS485 / Modbus / CANopen Lift CiA 417 / OEM Serial)
[ Edge Gateway Device (e.g., Raspberry Pi / Advantech Industrial PC) ]
         │ (MQTT 5.0 over TLS, port 8883 / Mutual TLS)
[ EMQX Broker Cluster ]
         │
[ ElevateOS IoT Gateway Service (Node.js) ]
         │
         ├── Telemetry Normalization Pipeline
         ├── OEM Adapter Engine
         ├── Gateway Health & Watchdog
         └── Physics Simulation Engine
```

---

## 2. MQTT Topic Structure
Every topic follows a strict hierarchical namespace:
`elevateos/{orgId}/{buildingId}/{elevatorId}/{channel}`

### 2.1 Uplink Topics (Device -> Cloud)
- `elevateos/{orgId}/{bldgId}/{elevId}/telemetry`: High-frequency periodic telemetry (default: 1000ms interval when moving, 5000ms when idle).
- `elevateos/{orgId}/{bldgId}/{elevId}/events`: Asynchronous state events (e.g. door opened, safety-gear triggered, emergency stop pressed).
- `elevateos/{orgId}/{bldgId}/{elevId}/faults`: Controller fault code broadcasts.
- `elevateos/{orgId}/{bldgId}/{elevId}/command/ack`: Acknowledgement of remote command received by controller.
- `elevateos/{orgId}/gateways/{gatewayId}/heartbeat`: Edge gateway device health (CPU, RAM, temp, latency, signal dBm).

### 2.2 Downlink Topics (Cloud -> Device)
- `elevateos/{orgId}/{bldgId}/{elevId}/command`: Whitelisted remote action payload dispatched to gateway.
- `elevateos/{orgId}/gateways/{gatewayId}/config`: Gateway configuration push (reporting interval, sensor thresholds).

### 2.3 Payload Schemas

#### Telemetry Payload (`/telemetry`):
```json
{
  "timestamp": "2026-11-07T06:00:00.120Z",
  "gatewayId": "gw-ny-tower1-01",
  "elevatorId": "elv-car-a",
  "telemetry": {
    "floor": 4.0,
    "targetFloor": 7,
    "direction": "UP",
    "velocityMps": 1.75,
    "doorState": "CLOSED",
    "doorCycles": 14205,
    "loadKg": 320.5,
    "loadPercent": 40.0,
    "isOverloaded": false,
    "motorTempCelsius": 48.2,
    "motorCurrentAmps": 18.4,
    "vibrationRms": 0.08,
    "safetyChainClosed": true,
    "emergencyStopActive": false,
    "controllerMode": "NORMAL"
  }
}
```

#### Command Payload (`/command`):
```json
{
  "commandId": "cmd-550e8400-e29b-41d4-a716-446655440000",
  "correlationId": "corr-8f192b3c",
  "commandType": "DISPATCH_CALL",
  "params": {
    "targetFloor": 7,
    "servicePriority": "STANDARD"
  },
  "issuedAt": "2026-11-07T06:00:01.000Z",
  "expiresAt": "2026-11-07T06:00:31.000Z",
  "signature": "hmac_sha256_signed_token"
}
```

---

## 3. OEM Adapter Architecture
Elevator hardware protocols are non-standard across manufacturers. ElevateOS abstracts this complexity behind the `IOEMAdapter` interface.

```typescript
export interface ElevatorCapabilities {
  landingCall: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
  destinationDispatch: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
  remoteParking: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
  doorHold: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
  serviceModeControl: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
  motorTelemetry: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
  doorCycleTracking: 'SUPPORTED' | 'UNSUPPORTED' | 'OEM_DEPENDENT' | 'SENSOR_REQUIRED';
}

export interface IOEMAdapter {
  readonly manufacturer: string;
  getCapabilities(controllerModel: string): ElevatorCapabilities;
  normalizeTelemetry(rawPayload: Buffer | string | Record<string, any>): NormalizedTelemetry;
  translateCommand(command: ElevatorCommand): OutboundOEMCommandPayload;
  parseFaultCode(code: string | number): NormalizedFault;
}
```

### Concrete Adapter Implementations (Architecture Placeholders):
1. **KONEAdapter**: Maps to KONE Elevator Call API & Equipment Status API (WebSocket / Cloud-to-Cloud).
2. **OtisAdapter**: Integrates with Otis Compass/eService edge protocol.
3. **SchindlerAdapter**: Interfaces with Schindler Ahead digital connectivity gateway.
4. **TKElevatorAdapter**: TK Elevator MAX platform API translator.
5. **JohnsonLiftsAdapter**: Modbus RTU / Proprietary Serial protocol converter.
6. **GenericAdapter**: Standard Modbus-TCP / CANopen CiA-417 lift profile used for retrofitted sensors and the simulator.

---

## 4. Deterministic Multi-Car Elevator Physics Simulator
To guarantee comprehensive testing without physical elevator hardware, the system includes a high-fidelity **Elevator Physics & Gateway Simulator**.

### Capabilities:
- **Multiple Buildings & Banks**: Simulates multiple concurrent elevators (e.g., Tower 1 Car A, Car B; Tower 2 Car C).
- **Physical Kinematics Engine**:
  - Acceleration, jerk limiting, constant rated velocity (e.g. 1.75 m/s), deceleration to floor leveling.
  - Realistic door cycles: Deceleration -> Level -> Door Opening (2s) -> Door Hold (3s) -> Door Closing (2s) -> Ready.
- **Dynamic Load & Passenger Simulation**: Changes weight in cabin per floor stop, calculates motor current proportional to load and travel direction (counterweight differential).
- **Thermal & Vibration Model**: Motor temperature climbs gradually under continuous trips and cools during idle.
- **Configurable Fault Injection**:
  - Ability to trigger door obstruction, motor over-temperature (>75°C), safety chain break, or gateway disconnect on demand via API/UI.
- **Full Bidirectional Loop**: Accepts commands from the backend command queue, performs physical trip simulation, sends acknowledgement, and updates telemetry to trigger automated physical verification.

