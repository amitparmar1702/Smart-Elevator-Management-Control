# ElevateOS - Security, RBAC & Tenant Isolation Strategy

## 1. Multi-Tenant Isolation Strategy

ElevateOS follows a **Shared Database, Multi-Tenant Partitioning Model** with mandatory tenant scoping at the ORM/data-access layer.

### 1.1 Guarantees:
1. **Tenant Separation**: Data belonging to Organisation A is mathematically quarantined from Organisation B.
2. **Defense-in-Depth Enforcement**:
   - **Network/Token Layer**: Every authenticated JWT carries `org_id` and permitted `scopes`.
   - **Guard Layer (`TenantGuard`)**: Verifies requested route parameters against user's JWT `org_id`.
   - **ORM Extension Layer (Prisma Client Extensions)**: Automatically injects `WHERE organisation_id = ctx.tenantId` into all database queries for tenant-owned tables.
   - **IDOR / BOLA Prevention**: Direct manipulation of UUIDs in URLs or query params (`/buildings/:id`, `/elevators/:id`) fails with 404/403 if the record does not belong to the caller's organization.
   - **WebSocket Room Layer**: Socket.IO channels only join `org:{user.orgId}` and assigned buildings. Cross-tenant broadcasts are strictly prohibited.

---

## 2. Role-Based Access Control (RBAC) Matrix

### 2.1 The 12 Supported Enterprise Roles:
1. `SUPER_ADMIN` (SA)
2. `PLATFORM_SUPPORT` (PS)
3. `ORGANISATION_ADMIN` (OA)
4. `BUILDING_MANAGER` (BM)
5. `FACILITY_MANAGER` (FM)
6. `SECURITY_OPERATOR` (SO)
7. `RESIDENT` (RES)
8. `TECHNICIAN` (TECH)
9. `TECHNICIAN_SUPERVISOR` (TS)
10. `SERVICE_VENDOR_ADMIN` (SVA)
11. `AUDITOR` (AUD)
12. `EMERGENCY_OPERATOR` (EO)

### 2.2 Permissions Matrix

| Module / Operation | Permission Key | SA | PS | OA | BM | FM | SO | RES | TECH | TS | SVA | AUD | EO |
|--------------------|----------------|:--:|:--:|:--:|:--:|:--:|:--:|:---:|:----:|:--:|:---:|:---:|:--:|
| **Platform Management** | `platform:manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Organisations** | `org:manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Buildings** | `buildings:manage` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Buildings** | `buildings:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage Elevators** | `elevators:manage` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Telemetry** | `telemetry:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Live Shaft Monitoring** | `shaft:monitor` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Request Landing Call** | `calls:landing` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Dispatch Destination** | `calls:dispatch` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Booking** | `bookings:create` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve Booking** | `bookings:approve`| ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Execute Remote Command** | `commands:execute`| ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve Remote Command** | `commands:approve`| ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Work Order** | `maintenance:create`| ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Execute Checklist** | `checklist:submit`| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Approve Service Report** | `maintenance:approve`| ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Acknowledge Alarms** | `alarms:ack` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Escalate Incident** | `incidents:escalate`| ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit Logs (Read)** | `audit:read` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Export Reports** | `reports:export` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

*\* Remote commands always require dual approval or whitelisted security policy; safety chain and fire switches cannot be overridden remotely.*

---

## 3. Data Protection & Cryptography
- **Passwords**: Hashed with Argon2id or bcrypt (cost factor: 12 rounds).
- **Transport Security**: TLS 1.3 enforced for all HTTPS and MQTT broker connections.
- **Tokens**: Access tokens expire in 15 minutes. Refresh tokens stored as secure, HTTP-only, SameSite cookies with server-side revocation lists in Redis.
- **Audit Immutability**: All sensitive operations (logins, command attempts, approvals, config changes) are recorded to an append-only audit trail table with client IP, user agent, before/after diffs, and distributed correlation IDs.

