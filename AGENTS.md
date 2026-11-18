# AGENTS.md - Smart Elevator Management & Control Platform (ElevateOS)

## 1. Project Purpose & Scope
ElevateOS is an enterprise-grade, multi-tenant web platform designed for monitoring, operating, maintaining, and managing smart elevator fleets across global commercial, residential, hospital, and industrial facilities.
It supports real-time telemetry, live interactive elevator visualization, dispatch and landing calls, elevator reservations/bookings, fault and emergency incident response, technician assignment and work orders, predictive health monitoring, and audited remote commands via OEM adapters and an IoT gateway simulator.

### CRITICAL SAFETY MANDATE
- ElevateOS is **NEVER** a replacement for:
  - Certified elevator safety chain circuits
  - Statutory/regulatory physical inspections (IS 17900, EN 81-20/50, EN 81-28/70, regional lift acts)
  - Physical emergency communication and rescue systems
  - Manufacturer-approved safety controllers
  - Machine-room safety lockouts and fire-service switches
- The cloud/web platform **NEVER** independently executes unsafe or unverified elevator movements.
- All remote operations require strict RBAC verification, multi-stage approval (where policy dictates), durable queue transmission, controller acknowledgement, and telemetry-backed physical state verification.
- Elevator local controllers continue 100% fail-safe autonomous operation if network, cloud, gateway, or MQTT links fail.

---

## 2. System Architecture
ElevateOS uses a **Modular Monolith + Independent IoT Gateway Service** architectural model.

```
Elevator Controller / Physical Sensors
                ↓ (RS-485 / CAN / Serial / Controller Bus)
         Edge Gateway
                ↓ (MQTT over TLS / JSON Payload)
          EMQX Broker (Port 1883/8883)
                ↓
    Independent IoT Gateway Service (Node.js/TypeScript)
      ├── OEM Adapter Layer (KONE, Otis, Schindler, TK, Generic)
      ├── Heartbeat & Health Monitor
      ├── Telemetry Parser & Normalizer
      └── Realistic Physics Simulator (Virtual Gateways & Controllers)
                ↓ (Redis Queue / REST / Internal PubSub)
      NestJS Core Application Service (Modular Monolith)
      ├── Auth & Identity (JWT, MFA, Session Management)
      ├── Multi-Tenant Isolation Engine (Org/Building/Elevator Scopes)
      ├── Operations Engine (Calls, Bookings, Command Dispatch)
      ├── Maintenance & Incident Service (Work orders, SLA, Checklists)
      ├── Analytics & Reporting Service
      └── PostgreSQL + TimescaleDB & Redis Cache
                ↓ (Secure WebSocket Server)
      Next.js Web Application (React, Tailwind CSS, shadcn/ui, Recharts)
      ├── Role-Dedicated Dashboards (SuperAdmin, OrgAdmin, BuildingMgr, Security, Resident, Technician)
      └── 3D/2D Interactive Elevator Shaft Visualizer
```

---

## 3. Technology Stack
- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, shadcn/ui component primitives, Recharts, TanStack Table, TanStack Query, React Hook Form, Zod, Zustand, Socket.IO Client.
- **Backend API**: Node.js, NestJS, TypeScript, REST API (versioned `/api/v1`), WebSocket (Socket.IO Gateway), BullMQ, Redis, Prisma ORM, PostgreSQL (relational core) + TimescaleDB (telemetry hypertable), Swagger/OpenAPI.
- **IoT & Telemetry**: EMQX (MQTT 5.0 broker), MQTT over TLS, Node.js IoT Service, OEM Adapter abstraction interface, deterministic multi-building elevator simulator.
- **Infrastructure**: Docker & Docker Compose, Nginx reverse proxy, Prometheus, Grafana, Sentry error tracking, Loki logging, S3-compatible object storage.

---

## 4. Repository & Folder Structure
```
smart-elevator-platform/
├── apps/
│   ├── web/                    # Next.js frontend web portal
│   │   ├── app/                # Route groups: (auth), (super-admin), (org-admin), (building-manager), (technician), (resident), (security)
│   │   ├── components/         # Atomic UI, shaft visualizer, layouts, cards, modals
│   │   ├── features/           # Feature slices: telemetry, bookings, calls, commands, maintenance, incidents
│   │   ├── hooks/              # Custom React hooks (useTelemetry, useSocket, useAuth)
│   │   ├── lib/                # Utilities, API client, formatting
│   │   ├── stores/             # Zustand client stores
│   │   ├── types/              # Frontend view models
│   │   └── styles/             # Global CSS and Tailwind variables
│   │
│   ├── api/                    # NestJS Core Application (Modular Monolith)
│   │   ├── src/
│   │   │   ├── auth/           # Authentication, MFA, JWT, Sessions
│   │   │   ├── rbac/           # Roles, Permissions, Access Scopes
│   │   │   ├── organisations/  # Multi-tenant organization CRUD
│   │   │   ├── buildings/      # Buildings, wings, floors
│   │   │   ├── elevators/      # Elevator registry, groups, capabilities
│   │   │   ├── controllers/    # Controller hardware profiles
│   │   │   ├── gateways/       # Gateway registry, credentials, heartbeats
│   │   │   ├── telemetry/      # Ingestion, TimescaleDB hypertable querying
│   │   │   ├── commands/       # Durable queue, validation, verification
│   │   │   ├── bookings/       # Reservation scheduling, conflict detection
│   │   │   ├── calls/          # Landing & destination dispatch
│   │   │   ├── maintenance/    # PM, work orders, checklists, SLA, spare parts
│   │   │   ├── faults/         # Fault rules, active alarms, classification
│   │   │   ├── incidents/      # Emergency incidents, escalation matrix
│   │   │   ├── notifications/  # Email, SMS, WhatsApp, In-App channels
│   │   │   ├── reports/        # PDF/Excel scheduled & on-demand exports
│   │   │   ├── audit/          # Immutable compliance audit log
│   │   │   ├── websocket/      # Tenant-scoped real-time event broadcaster
│   │   │   └── common/         # Guards, interceptors, filters, decorators
│   │   └── prisma/             # Prisma schema, migrations, seed data
│   │
│   └── iot-gateway/            # Independent IoT Ingestion & Simulator Service
│       ├── src/
│       │   ├── mqtt/           # MQTT client, TLS connection, subscriptions
│       │   ├── adapters/       # OEM Adapters (KONE, Otis, Schindler, TK, Johnson, Generic)
│       │   ├── telemetry/      # Normalizer, buffer, deduplication
│       │   ├── commands/       # Downlink command translator & dispatcher
│       │   ├── simulator/      # Deterministic multi-car physics engine
│       │   └── health/         # Gateway watchdog & reconnection reconciliation
│       └── tests/
│
├── packages/
│   ├── types/                  # Shared TypeScript interfaces (telemetry, commands, DTOs)
│   ├── config/                 # Shared eslint, tsconfig, prettier
│   ├── validation/             # Zod validation schemas
│   └── shared/                 # Common constants, error codes, enum definitions
│
├── infrastructure/
│   ├── docker/                 # Dockerfiles for web, api, iot-gateway, emqx, postgres
│   ├── nginx/                  # Reverse proxy and SSL configuration
│   ├── monitoring/             # Prometheus scrape configs & Grafana dashboards
│   └── scripts/                # Database backup & restore, simulation runner
│
├── docs/                       # Complete architecture, database, API, and IoT documentation
├── AGENTS.md                   # This instruction and compliance file
├── README.md                   # Getting started and setup guide
├── .env.example                # Environment variables template
└── package.json                # Root monorepo workspace configuration
```

---

## 5. Coding & Design Standards
1. **TypeScript Strict Mode**: No `any` types permitted. All DTOs, parameters, and return types must be explicitly typed.
2. **Component Architecture**: Atomic, clean, modular components with decoupled logic. No mega-files exceeding 350 lines.
3. **Enterprise UI Quality**: Industrial dark navy sidebar (`#0F172A` / `#090D16`), light grey canvas (`#F8FAFC`), crisp white cards with subtle border borders (`#E2E8F0`), accessible contrast, zero reliance on colour alone for elevator state (must pair text, badges, and icons).
4. **State Management**:
   - Server state: TanStack Query (React Query) with strict invalidation tags.
   - Client/UI state: Zustand.
   - Real-time state: Socket.IO client subscribed only to authorized rooms.
5. **API Design**: Strict RESTful conventions, versioned under `/api/v1/`, validated with class-validator/Zod, documented via OpenAPI/Swagger.

---

## 6. Multi-Tenant Isolation Rules
- Every tenant record contains `organisation_id` (and where applicable, `building_id`, `elevator_id`).
- Isolation is enforced at the **Database & Service Repository Level** via NestJS TenantGuards and scoped Prisma query extensions.
- Under **NO** circumstances may data belonging to Organisation A be returned or modified by a user from Organisation B.
- Global Super Admins can only view customer data under logged audit trails and explicit impersonation sessions.
- Direct ID manipulation (BOLA/IDOR) in API requests must be thwarted by scoping queries `WHERE id = :id AND organisation_id = :tenantId`.

---

## 7. RBAC & Access Scope Hierarchy
Supported Roles:
1. `SUPER_ADMIN`: Cross-tenant platform administration, subscriptions, global gateway registry, audit.
2. `PLATFORM_SUPPORT`: Platform diagnostic logs and tenant assistance (restricted operational commands).
3. `ORGANISATION_ADMIN`: Full control over customer buildings, wings, elevators, users, contracts, reports.
4. `BUILDING_MANAGER`: Scoped to assigned buildings. Elevator calls, booking approvals, visitor coordination.
5. `FACILITY_MANAGER`: Scoped to facility equipment, maintenance scheduling, and SLA tracking.
6. `SECURITY_OPERATOR`: Real-time monitoring room view, emergency alerts, call assistance (NO safety overrides).
7. `RESIDENT`: Browser portal for personal building elevators, landing calls, service elevator reservations.
8. `TECHNICIAN`: Work orders, inspection checklists, spare parts consumption, fault diagnosis logs.
9. `TECHNICIAN_SUPERVISOR`: Assign work orders, review inspection evidence, approve maintenance signoffs.
10. `SERVICE_VENDOR_ADMIN`: External vendor management of assigned technician teams and SLA compliance.
11. `AUDITOR`: Read-only access to maintenance logs, command history, and compliance documents.
12. `EMERGENCY_OPERATOR`: Incident escalation, emergency call routing, passenger assistance records.

Scope Granularity:
- Platform scope (Global)
- Organisation scope
- Building scope (`user_building_access`)
- Elevator scope (`user_elevator_access`)
- Floor scope (`user_floor_access`)

---

## 8. IoT & OEM Adapter Architecture
- Elevators communicate via industrial Edge Gateways to EMQX using MQTT 5.0 over TLS.
- Every gateway maintains secure device identity, x.509 certificate authentication, and periodic heartbeats.
- The **OEM Adapter Interface** isolates manufacturer-specific differences:
  - `KONEAdapter`: KONE API Services / WebSocket
  - `OtisAdapter`: Otis OEM API / Gateway
  - `SchindlerAdapter`: Schindler Digital Interface
  - `TKElevatorAdapter`: TK Elevator API
  - `JohnsonLiftsAdapter`: Johnson Controller Protocol
  - `GenericAdapter`: Standard Modbus-RTU/TCP / MQTT JSON edge gateway
- Capability Matrix: Every elevator declares capabilities as `SUPPORTED`, `UNSUPPORTED`, `OEM_DEPENDENT`, or `SENSOR_REQUIRED`. The UI dynamically hides or disables features that are unsupported.

---

## 9. Secure Command Engine Workflow
Any remote action (e.g. landing call, dispatch, parking recall, service mode) must execute through the 12-state verified lifecycle:
```
1. REQUESTED
2. VALIDATING (RBAC + Scope + Controller Health + Policy Check)
3. AWAITING_APPROVAL (If dual authorization is configured)
4. QUEUED (Durable BullMQ / Redis queue with idempotency token)
5. SENT (Transmitted to Gateway/Controller via OEM Adapter)
6. ACKNOWLEDGED (Gateway/Controller confirms command reception)
7. EXECUTING (Controller executes physical motion)
8. VERIFIED (Telemetry confirms arrival at requested floor/door state)
9. COMPLETED (Audit record finalized)
[Failed states: REJECTED | EXPIRED | CANCELLED | FAILED]
```
- **Rule**: Stale or timed-out commands are NEVER blindly replayed upon gateway reconnection.
- **Rule**: API acceptance is never displayed as physical completion.

---

## 10. Testing & Verification Standards
- Unit tests for validation, RBAC policies, and telemetry parsers.
- Tenant isolation integration tests (asserting Org A cannot query or mutate Org B data under any URL or parameter combination).
- Real-time WebSocket room authorization tests.
- Command state machine tests (idempotency, timeout, state verification).
- Responsive UI visual regression across desktop (1920x1080, 1440x900), tablet (1024x768, 768x1024), and mobile viewports (375x667).

---

## 11. Environment & Configuration Security
- Never store secrets or API tokens in git repositories.
- Use `.env.example` as the canonical reference for all environment configuration.
- Password hashes use Argon2id or bcrypt (cost >= 12).
- JWT keys, session cookies, and database passwords must be loaded from verified environment variables.

