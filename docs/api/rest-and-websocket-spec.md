# ElevateOS - API & WebSocket Architecture Specification

## 1. REST API Standards
- **Base URL**: `/api/v1`
- **Protocol**: HTTPS / REST
- **Authentication**: Bearer JWT in `Authorization` header (`Bearer <token>`) + HTTP-only Refresh Token cookie.
- **Content-Type**: `application/json`
- **Error Format**: RFC 7807 Problem Details:
  ```json
  {
    "statusCode": 403,
    "timestamp": "2026-11-07T05:58:00.000Z",
    "path": "/api/v1/elevators/elev-01/commands",
    "error": "Forbidden",
    "message": "User does not possess command dispatch permission for this building",
    "correlationId": "req-98f2b31a"
  }
  ```

---

## 2. Comprehensive Endpoint Inventory

### 2.1 Authentication & Profile (`/api/v1/auth`)
- `POST /auth/login`: Email/password login -> returns `{ accessToken, user, mfaRequired }`
- `POST /auth/mfa/verify`: TOTP code verification -> returns `{ accessToken, refreshToken }`
- `POST /auth/refresh`: Refresh expired access token via secure refresh cookie
- `POST /auth/logout`: Revoke active session in Redis & database
- `GET /auth/me`: Current authenticated user identity, role, scopes, and permitted feature flags
- `POST /auth/forgot-password`: Request password reset token
- `POST /auth/reset-password`: Reset password using verified token
- `GET /auth/sessions`: List active device sessions for current user
- `DELETE /auth/sessions/:sessionId`: Revoke specific device session

### 2.2 Organizations & Subscriptions (`/api/v1/organisations`) [Super Admin & Org Admin]
- `GET /organisations`: List organizations (Super Admin only; paginated)
- `POST /organisations`: Create new tenant organization
- `GET /organisations/:id`: Get organization profile and active subscription details
- `PUT /organisations/:id`: Update organization details
- `PATCH /organisations/:id/status`: Suspend or activate tenant
- `GET /organisations/:id/usage`: Tenant limits, elevator count, storage consumed, API quotas

### 2.3 Facilities & Assets (`/api/v1/buildings`, `/api/v1/elevators`)
- `GET /buildings`: List buildings within current tenant scope (filterable by city/status)
- `POST /buildings`: Register new building
- `GET /buildings/:id`: Building details, wings, floor hierarchy, elevator banks
- `PUT /buildings/:id`: Update building
- `GET /buildings/:id/floors`: List configured floors and access restrictions
- `POST /buildings/:id/floors`: Add floor configuration
- `GET /elevators`: List elevators (filterable by building, group, status, manufacturer)
- `POST /elevators`: Register new elevator asset
- `GET /elevators/:id`: Elevator profile, controller, gateway, current state, capabilities
- `PUT /elevators/:id`: Update elevator configuration
- `GET /elevators/:id/capabilities`: List OEM capability matrix (supported/unsupported actions)
- `GET /elevator-groups`: List elevator groups & dispatch policies
- `POST /elevator-groups`: Create elevator group

### 2.4 Controllers & Gateways (`/api/v1/controllers`, `/api/v1/gateways`)
- `GET /controllers`: List elevator controllers
- `POST /controllers`: Provision controller configuration & protocol mapping
- `GET /gateways`: List IoT gateways with online/offline status and latency
- `POST /gateways`: Register edge gateway hardware ID
- `GET /gateways/:id/health`: Gateway telemetry, heartbeat history, CPU/memory stats
- `POST /gateways/:id/rotate-credentials`: Generate new TLS device credentials

### 2.5 Real-Time Telemetry & Shaft Visualizer (`/api/v1/telemetry`)
- `GET /elevators/:id/telemetry/live`: Instant snapshot of latest physical state
- `GET /elevators/:id/telemetry/history`: Historical time-series query (timeframe: 24h, 7d, 30d, custom)
- `GET /elevators/compare`: Compare metrics (runtime, power, current, door cycles) across 2-4 elevators

### 2.6 Remote Command Engine (`/api/v1/commands`)
- `POST /elevators/:id/commands`: Submit remote command (idempotency key required)
- `GET /elevators/:id/commands`: List commands for specific elevator
- `GET /commands/:commandId`: Command lifecycle inspection, approval state, verification status
- `POST /commands/:commandId/approve`: Approve pending command (Supervisor / Building Manager)
- `POST /commands/:commandId/reject`: Reject command request with reason
- `POST /commands/:commandId/cancel`: Cancel queued/pending command

### 2.7 Operations: Calls & Bookings (`/api/v1/calls`, `/api/v1/bookings`)
- `POST /calls`: Request landing call or destination dispatch
- `GET /calls/active`: Active calls assigned to elevators
- `GET /calls/history`: Historical call log with waiting times and dispatch latency
- `GET /bookings`: List elevator reservations (filtered by building, date, status)
- `POST /bookings`: Request service elevator reservation (moving, furniture, maintenance)
- `GET /bookings/:id`: Booking details, conflicts check, approval trail
- `PATCH /bookings/:id/status`: Approve / Reject / Cancel reservation

### 2.8 Maintenance & Work Orders (`/api/v1/maintenance`)
- `GET /maintenance/dashboard`: Work orders KPI (assigned, overdue, breakdown, awaiting approval)
- `GET /maintenance/work-orders`: Paginated list of work orders
- `POST /maintenance/work-orders`: Create work order (Preventive or Breakdown)
- `GET /maintenance/work-orders/:id`: Work order detail, checklist items, assigned technician
- `PATCH /maintenance/work-orders/:id/assign`: Assign technician to work order
- `POST /maintenance/work-orders/:id/checklist`: Submit completed inspection checklist & photo evidence
- `POST /maintenance/work-orders/:id/signoff`: Technician digital signature & completion
- `POST /maintenance/work-orders/:id/approve`: Supervisor review and sign-off
- `GET /maintenance/parts`: Spare parts inventory and stock levels
- `POST /maintenance/parts/consume`: Deduct spare parts used during service

### 2.9 Faults, Alarms & Incidents (`/api/v1/faults`, `/api/v1/incidents`)
- `GET /faults/active`: Active faults across elevators
- `GET /faults/history`: Historical fault events and clearance timestamps
- `POST /alarms/:id/acknowledge`: Operator acknowledgement of active alarm
- `GET /incidents`: Operational and emergency incidents list
- `POST /incidents`: Create incident ticket (e.g. entrapment, safety chain trip)
- `PATCH /incidents/:id/status`: Update incident status (`RESPONDING`, `RESOLVED`, `CLOSED`)
- `POST /incidents/:id/escalate`: Trigger emergency escalation matrix (SMS/email/call)

### 2.10 Analytics & Reports (`/api/v1/reports`, `/api/v1/analytics`)
- `GET /analytics/fleet`: Fleet availability, total trips, uptime %, energy consumption
- `GET /analytics/building/:id`: Building-specific performance and call wait times
- `GET /analytics/equipment-health/:id`: Motor, door, and brake degradation indicators
- `POST /reports/export`: Generate PDF or Excel report (Fleet, Maintenance, Fault, Audit)
- `GET /reports/scheduled`: List recurring automated reports

### 2.11 Audit & Security (`/api/v1/audit-logs`)
- `GET /audit-logs`: Query immutable audit trail with actor, action, timestamp, diff, and correlation ID
- `GET /audit-logs/:id`: Deep inspection of change set

---

## 3. WebSocket Real-Time Event System

### 3.1 Connection & Room Scoping
- **Endpoint**: `/socket.io`
- **Handshake Auth**: Client provides `token` in `auth: { token: "..." }`.
- **Tenant Isolation**: Upon connection, server inspects user permissions and joins client strictly to authorized rooms:
  - `org:{orgId}`
  - `building:{bldgId}` (only assigned buildings)
  - `elevator:{elevId}` (only assigned elevators)
- **Rule**: Client cannot request arbitrary room joins; joins are server-enforced during authentication.

### 3.2 WebSocket Event Catalogue

| Event Name | Direction | Payload | Purpose |
|------------|-----------|---------|---------|
| `elevator.state.updated` | Server -> Client | `{ elevatorId, status, currentFloor, direction, doorState, loadKg, speed, timestamp }` | Live updates for dashboard cards & lists |
| `elevator.position.updated` | Server -> Client | `{ elevatorId, floor, rawPosition, velocity, targetFloor }` | High-frequency position for smooth shaft animation |
| `elevator.door.updated` | Server -> Client | `{ elevatorId, doorState, obstructionDetected, cyclesCount }` | Door visual state change |
| `elevator.fault.detected` | Server -> Client | `{ elevatorId, faultCode, severity, description, timestamp }` | Immediate banner / toast alert |
| `elevator.fault.cleared` | Server -> Client | `{ elevatorId, faultCode, clearedAt }` | Dismiss alarm state |
| `gateway.connection.changed`| Server -> Client | `{ gatewayId, elevatorId, status: "ONLINE" \| "OFFLINE", lastSeen }`| Stale data / connectivity indicator |
| `command.acknowledged` | Server -> Client | `{ commandId, elevatorId, controllerAck: true, timestamp }` | Feedback that controller received command |
| `command.execution.updated`| Server -> Client | `{ commandId, status: "VERIFIED" \| "COMPLETED" \| "FAILED", details }`| Command completion feedback |
| `call.status.changed` | Server -> Client | `{ callId, status: "ASSIGNED" \| "ARRIVED" \| "COMPLETED", elevatorId }` | Resident / user call tracking |
| `booking.status.changed` | Server -> Client | `{ bookingId, status, approvedBy, timestamp }` | Booking calendar refresh |
| `maintenance.job.assigned`| Server -> Client | `{ workOrderId, technicianId, title, priority }` | Real-time technician notification |
| `incident.escalated` | Server -> Client | `{ incidentId, elevatorId, severity, message }` | Control room alarm banner & audio beep |

