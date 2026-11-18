# ElevateOS - Smart Elevator Management & Control Platform

[![Enterprise Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith%20%2B%20IoT%20Gateway-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%20Strict-blue.svg)](#)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%20%7C%20Tailwind-black.svg)](#)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%20%7C%20Prisma-red.svg)](#)
[![MQTT](https://img.shields.io/badge/IoT-EMQX%20%7C%20MQTT%205.0-brightgreen.svg)](#)

ElevateOS is an enterprise-grade multi-tenant web platform designed for monitoring, operating, maintaining, and managing modern smart elevator fleets across global facilities.

---

## ⚠️ Important Safety Mandate
**ElevateOS is NOT a replacement for certified elevator safety systems, statutory inspection protocols, machine-room emergency controls, physical safety-chains, or certified fire-service modes.**
- The platform operates on a **whitelisted, permission-controlled, and verified** remote command lifecycle.
- Local elevator controllers retain 100% autonomous, safe operation in the event of cloud, internet, or gateway failure.
- Physical integration is strictly isolated behind an **OEM Adapter Interface**. During testing and development, operations run through an integrated **Deterministic Elevator Physics Simulator**.

---

## Key Pillars

1. **MONITOR**: Live elevator telemetry (floor position, velocity, door state, motor current/temp, load percentage, safety-chain status, gateway health, real-time event logs, and 24h/7d/30d historical trends).
2. **OPERATE**: Floor landing calls, VIP/destination dispatch, service elevator bookings (moving, furniture delivery, maintenance), command queues, and physical-state verification.
3. **MAINTAIN**: Preventive maintenance schedules, breakdown work orders, digital inspection checklists, technician assignment, spare parts tracking, SLA compliance, and predictive health indicators.
4. **MANAGE**: Multi-tenant organizations, buildings, wings, floors, elevator groups, controllers, gateways, users, 12 RBAC roles with scope-based permissions, and immutable audit logs.

---

## Repository Structure

```
smart-elevator-platform/
├── apps/
│   ├── web/               # Next.js 15+ frontend portal (Role-dedicated dashboards & Shaft visualizer)
│   ├── api/               # NestJS modular backend (Prisma, PostgreSQL, TimescaleDB, BullMQ, Redis)
│   └── iot-gateway/       # Node.js IoT service (EMQX MQTT client, OEM adapters, Physics simulator)
├── packages/
│   ├── types/             # Shared TypeScript schemas & DTOs
│   ├── validation/        # Shared Zod validation schemas
│   └── shared/            # Common constants, error definitions & enums
├── infrastructure/
│   ├── docker/            # Docker Compose & multi-stage Dockerfiles
│   ├── nginx/             # Nginx reverse proxy configuration
│   └── monitoring/        # Prometheus & Grafana definitions
└── docs/                  # Architecture, database, API, and IoT documentation
```

---

## Multi-Tenant Hierarchy

```
Super Admin (Platform Level)
    └── Organisation (Tenant Level)
           └── Buildings
                 └── Wings / Towers
                       └── Floors
                             └── Elevators (Linked to Controllers & Gateways)
```

Tenant isolation is strictly enforced at the database repository level via scoped queries:
`WHERE id = :id AND organisation_id = :tenantId`.

---

## Getting Started

### Prerequisites
- Node.js >= 20.x (v24.x recommended)
- Docker & Docker Compose
- PostgreSQL 16+ (or TimescaleDB)
- Redis 7+

### Environment Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Install workspace dependencies
npm install

# 3. Start infrastructure (Postgres, Redis, EMQX)
docker compose up -d

# 4. Run database migrations
cd apps/api && npx prisma migrate dev

# 5. Start development servers
npm run dev
```

---

## Role-Dedicated Portals
- **Super Admin**: Platform overview, tenant management, subscription limits, cross-tenant gateway registry, platform health.
- **Organisation Admin**: Organization dashboard, buildings, elevators, user management, bookings, maintenance, audit logs.
- **Building Manager**: Building-scoped live monitoring, floor access rules, call management, booking approvals, visitors.
- **Control Room / Security**: Continuous multi-elevator monitoring grid, live fault streams, emergency event escalations.
- **Resident / End User**: Browser portal for calling elevators, checking arrival ETA, service elevator bookings, complaints.
- **Technician**: Mobile/tablet responsive work orders, step-by-step inspection checklists, fault diagnosis, spare parts consumption.
- **Auditor**: Read-only compliance, command history, maintenance logs, statutory inspection records.

