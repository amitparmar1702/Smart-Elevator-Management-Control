# ElevateOS - System Architecture Document

## 1. Executive Summary
ElevateOS is an enterprise-grade Smart Elevator Operations and Asset Management Platform. It connects elevator controllers, edge IoT gateways, cloud management services, and browser-based interfaces for administrators, building managers, security personnel, residents, and field service technicians.

## 2. High-Level Architecture Pattern
We adopt a **Modular Monolith for Core Business Logic** coupled with an **Independent IoT Gateway & Ingestion Service**.

```
[ Next.js Web Portal ] <=== Secure WebSocket & REST ===> [ NestJS Modular API ]
                                                                 │
                                                    BullMQ / Redis PubSub
                                                                 │
                                                                 ▼
[ Elevator Hardware / Simulator ] <=== MQTT/TLS ===> [ IoT Gateway Service ]
                                                     (OEM Adapters & Normalizer)
```

### Rationale:
- **Avoids premature microservice complexity**: Modules share transactional boundaries, database connections, and domain typing.
- **Isolates high-throughput IoT traffic**: High-frequency MQTT telemetry ingestion runs in an event-driven worker without exhausting HTTP server thread pools or blocking web requests.
- **Fail-safe operational boundaries**: Web application crashes or maintenance windows cannot break the edge gateway or elevator controller operation.

## 3. Communication Pipelines

### 3.1 Uplink: Elevator Telemetry to Browser
1. Elevator Controller / Sensors sample telemetry (floor, door state, speed, motor current, load, vibration, fault codes).
2. Edge Gateway buffers readings locally, signs payloads with TLS client certificates, and publishes to EMQX broker on `elevateos/{orgId}/{bldgId}/{elevId}/telemetry`.
3. IoT Gateway Service consumes messages, validates schema, applies OEM-specific normalizer (mapping OEM fault codes to standard ElevateOS event types).
4. Telemetry is persisted in PostgreSQL / TimescaleDB hypertable.
5. Ingestion triggers Redis Pub/Sub event `elevator:telemetry:updated`.
6. NestJS WebSocket Gateway receives Redis event and emits `elevator.state.updated` and `elevator.position.updated` only to authenticated socket rooms (`org:{orgId}:elevator:{elevId}`).
7. Connected browser client (Next.js) receives payload and updates the live interactive shaft visualizer and KPI metrics with zero page reload.

### 3.2 Downlink: Authorized Remote Command to Elevator
1. Operator requests action (e.g., dispatch call to Floor 8, reserve service mode).
2. NestJS API performs authentication, RBAC permission verification, tenant boundary check, and controller capability validation.
3. If command policy requires dual approval, state becomes `AWAITING_APPROVAL` and notification is dispatched to Supervisor.
4. Upon approval, command is pushed to BullMQ durable queue with an idempotency key and 30-second TTL.
5. Command worker dispatches MQTT payload to `elevateos/{orgId}/{bldgId}/{elevId}/command`.
6. Edge Gateway receives command and translates it via OEM controller interface.
7. Gateway returns `elevateos/{orgId}/{bldgId}/{elevId}/command/ack` (`ACKNOWLEDGED` or `REJECTED`).
8. State Verification Worker monitors subsequent telemetry streams. If elevator arrives at requested floor within expected travel time, command status transitions to `VERIFIED` and `COMPLETED`.
9. If no verification arrives within timeout, status transitions to `FAILED` and an alert is logged.
10. Full audit event is written to the immutable audit log table.

