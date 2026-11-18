# ElevateOS - Deployment, Infrastructure & Production Readiness

## 1. Container Architecture & Docker Compose
ElevateOS uses multi-stage Docker builds to produce slim, secure container images.

### Services:
1. `elevateos-web`: Next.js production frontend (Node Alpine runtime, optimized standalone output).
2. `elevateos-api`: NestJS core API service (Node Alpine, production dependencies only).
3. `elevateos-iot`: IoT Gateway & MQTT ingestion worker + deterministic elevator simulator.
4. `elevateos-postgres`: PostgreSQL 16 with TimescaleDB extension.
5. `elevateos-redis`: Redis 7 Alpine with persistent append-only storage.
6. `elevateos-emqx`: EMQX 5.x MQTT broker (ports 1883 for MQTT, 8883 for MQTTS, 8083 for MQTT-over-WebSocket).
7. `elevateos-nginx`: Nginx reverse proxy with SSL termination, HTTP/2, and WebSocket proxying.
8. `elevateos-minio`: S3-compatible object storage for maintenance photos, manuals, and PDF reports.

---

## 2. Docker Compose Configuration Preview (`docker-compose.yml`)
Located at root repository, orchestrating container networking, volumes, environment variables, and health checks.

```yaml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: elevateos-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: elevateos_secret
      POSTGRES_DB: elevateos_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: elevateos-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  emqx:
    image: emqx/emqx:5.3.2
    container_name: elevateos-emqx
    restart: always
    ports:
      - "1883:1883"
      - "8883:8883"
      - "8083:8083"
      - "18083:18083" # EMQX Dashboard
    volumes:
      - emqx_data:/opt/emqx/data

volumes:
  postgres_data:
  redis_data:
  emqx_data:
```

---

## 3. Production Readiness & SLO Targets
- **Availability Target**: 99.9% monthly availability for the web monitoring portal.
- **Latency SLO**: Dashboard telemetry latency < 2000ms from sensor change to screen update.
- **Command Latency**: Controller acknowledgement < 5000ms.
- **Critical Incident Latency**: Automatic push notification & alert broadcast < 3000ms.
- **Database Backup Schedule**: Daily automated pg_dump with point-in-time recovery WAL archiving to encrypted S3 storage.
- **RPO / RTO**: RPO < 15 minutes, RTO < 2 hours.

