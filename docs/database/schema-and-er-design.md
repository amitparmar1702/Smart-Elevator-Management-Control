# ElevateOS - Database Architecture & Entity Relationship Design

## 1. Storage Strategy
- **PostgreSQL 16+**: ACID relational core for organizations, buildings, floors, elevators, users, RBAC, commands, bookings, maintenance work orders, spare parts, and audit logs.
- **TimescaleDB Extension**: High-volume telemetry readings hypertable partitioned by time (e.g. 1-day chunks) with automated data compression and configurable retention policies (e.g., 90-day hot retention).
- **Redis 7+**: Transient command state, idempotency locks, BullMQ job queues, rate limiting, and real-time session tracking.

---

## 2. Entity Groups & Schemas

### 2.1 Multi-Tenancy & User Identity
- `organisations`: `id` (UUID PK), `name`, `slug` (unique), `contact_email`, `status` (`ACTIVE`, `SUSPENDED`), `created_at`, `updated_at`.
- `subscriptions`: `id` (UUID PK), `organisation_id` (FK), `plan_name` (`BASIC`, `PROFESSIONAL`, `ENTERPRISE`), `max_elevators`, `max_buildings`, `start_date`, `expiry_date`, `is_active`.
- `users`: `id` (UUID PK), `organisation_id` (FK, nullable for SuperAdmin), `email` (unique), `password_hash`, `first_name`, `last_name`, `phone_number`, `status` (`ACTIVE`, `INVITED`, `SUSPENDED`), `mfa_enabled`, `mfa_secret`, `created_at`, `updated_at`.
- `roles`: `id` (UUID PK), `name` (`SUPER_ADMIN`, `ORG_ADMIN`, `BUILDING_MANAGER`, `SECURITY_OPERATOR`, `RESIDENT`, `TECHNICIAN`, etc.), `is_system`, `scope_level` (`GLOBAL`, `ORGANISATION`, `BUILDING`, `ELEVATOR`).
- `permissions`: `id` (UUID PK), `key` (e.g. `elevators:read`, `commands:dispatch`, `maintenance:approve`), `module`, `description`.
- `role_permissions`: `role_id` (FK), `permission_id` (FK) - Composite PK.
- `user_roles`: `id` (UUID PK), `user_id` (FK), `role_id` (FK), `organisation_id` (FK).
- `user_building_access`: `user_id` (FK), `building_id` (FK) - Composite PK.
- `user_elevator_access`: `user_id` (FK), `elevator_id` (FK) - Composite PK.
- `user_floor_access`: `user_id` (FK), `floor_id` (FK) - Composite PK.
- `user_devices`: `id` (UUID PK), `user_id` (FK), `device_name`, `browser_type`, `ip_address`, `push_token`, `last_seen_at`.
- `user_sessions`: `id` (UUID PK), `user_id` (FK), `token_hash`, `ip_address`, `user_agent`, `expires_at`, `revoked_at`.

### 2.2 Facility Hierarchy & Elevator Assets
- `buildings`: `id` (UUID PK), `organisation_id` (FK), `name`, `code`, `address_line1`, `city`, `state`, `postal_code`, `timezone`, `latitude`, `longitude`, `created_at`.
- `building_wings`: `id` (UUID PK), `building_id` (FK), `name` (e.g., "North Tower", "Wing A").
- `floors`: `id` (UUID PK), `building_id` (FK), `wing_id` (FK nullable), `floor_number` (Int), `display_name` (e.g., "Basement 2", "Ground", "Floor 12"), `is_restricted`.
- `elevators`: `id` (UUID PK), `organisation_id` (FK), `building_id` (FK), `wing_id` (FK nullable), `asset_code` (e.g., "ELV-NT-01"), `name`, `manufacturer` (e.g., "KONE", "Otis", "Schindler"), `model`, `serial_number`, `installation_year`, `capacity_kg`, `max_passengers`, `rated_speed_mps`, `status` (`RUNNING`, `IDLE`, `WARNING`, `FAULT`, `MAINTENANCE`, `OFFLINE`, `EMERGENCY`), `current_floor`, `current_direction` (`UP`, `DOWN`, `STATIONARY`), `door_state` (`OPEN`, `CLOSED`, `OPENING`, `CLOSING`), `created_at`.
- `elevator_floors`: `elevator_id` (FK), `floor_id` (FK), `is_service_floor` (Bool) - Composite PK.
- `elevator_groups`: `id` (UUID PK), `building_id` (FK), `name` (e.g., "Low-Rise Bank"), `dispatch_strategy` (`ETA_MINIMAL`, `ENERGY_OPTIMAL`).
- `elevator_group_members`: `group_id` (FK), `elevator_id` (FK) - Composite PK.
- `controllers`: `id` (UUID PK), `elevator_id` (FK unique), `controller_type`, `firmware_version`, `hardware_version`, `bus_protocol` (`MODBUS_RTU`, `CANBUS`, `PROPRIETARY_API`), `ip_address`.
- `gateways`: `id` (UUID PK), `controller_id` (FK unique), `device_identifier` (MAC/UUID), `firmware_version`, `status` (`ONLINE`, `OFFLINE`, `DEGRADED`), `last_heartbeat_at`, `tls_fingerprint`.
- `gateway_credentials`: `id` (UUID PK), `gateway_id` (FK), `public_key_cert`, `hashed_token`, `revoked`.
- `elevator_capabilities`: `id` (UUID PK), `elevator_id` (FK), `capability_key` (`LANDING_CALL`, `DESTINATION_DISPATCH`, `REMOTE_PARKING`, `SERVICE_MODE`, `DOOR_LOCK`), `status` (`SUPPORTED`, `UNSUPPORTED`, `OEM_DEPENDENT`, `SENSOR_REQUIRED`).

### 2.3 Operations: Calls, Bookings & Commands
- `elevator_calls`: `id` (UUID PK), `organisation_id` (FK), `building_id` (FK), `elevator_id` (FK nullable until dispatched), `requested_by_user_id` (FK), `pickup_floor`, `destination_floor` (nullable for landing calls), `call_type` (`LANDING`, `DESTINATION`, `VIP`), `status` (`REQUESTED`, `VALIDATED`, `DISPATCHED`, `ASSIGNED`, `ARRIVED`, `COMPLETED`, `CANCELLED`, `EXPIRED`), `created_at`, `arrived_at`, `completed_at`.
- `call_events`: `id` (UUID PK), `call_id` (FK), `event_type`, `description`, `timestamp`.
- `bookings`: `id` (UUID PK), `organisation_id` (FK), `building_id` (FK), `elevator_id` (FK), `user_id` (FK), `purpose` (`MOVING`, `FURNITURE_DELIVERY`, `GOODS`, `COMMERCIAL_DELIVERY`, `SERVICE_MAINTENANCE`), `start_time`, `end_time`, `contact_name`, `contact_phone`, `status` (`REQUESTED`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`), `rejection_reason`.
- `booking_approvals`: `id` (UUID PK), `booking_id` (FK), `approver_id` (FK), `decision` (`APPROVED`, `REJECTED`), `notes`, `created_at`.
- `access_policies`: `id` (UUID PK), `building_id` (FK), `floor_id` (FK), `role_id` (FK nullable), `time_window_start`, `time_window_end`, `requires_passcode`.
- `elevator_commands`: `id` (UUID PK), `organisation_id` (FK), `building_id` (FK), `elevator_id` (FK), `requested_by_id` (FK), `command_type` (`DISPATCH_CALL`, `PARK_FLOOR`, `SET_SERVICE_MODE`, `DOOR_HOLD`), `parameters` (JSONB), `correlation_id` (unique), `idempotency_key` (unique), `status` (`REQUESTED`, `VALIDATING`, `AWAITING_APPROVAL`, `QUEUED`, `SENT`, `ACKNOWLEDGED`, `EXECUTING`, `VERIFIED`, `COMPLETED`, `FAILED`, `EXPIRED`, `CANCELLED`), `expires_at`, `failure_reason`, `created_at`, `completed_at`.
- `command_approvals`: `id` (UUID PK), `command_id` (FK), `approver_id` (FK), `decision` (`APPROVED`, `REJECTED`), `created_at`.
- `command_events`: `id` (UUID PK), `command_id` (FK), `event_type`, `raw_payload` (JSONB), `timestamp`.

### 2.4 Maintenance, Checklists & Safety
- `maintenance_plans`: `id` (UUID PK), `organisation_id` (FK), `elevator_id` (FK), `title`, `frequency_type` (`MONTHLY`, `QUARTERLY`, `ANNUAL`), `interval_days`, `next_due_date`, `created_at`.
- `maintenance_work_orders`: `id` (UUID PK), `organisation_id` (FK), `building_id` (FK), `elevator_id` (FK), `plan_id` (FK nullable), `order_number` (unique), `type` (`PREVENTIVE`, `BREAKDOWN`, `INSPECTION`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`), `assigned_technician_id` (FK nullable), `status` (`SCHEDULED`, `DISPATCHED`, `IN_PROGRESS`, `AWAITING_PARTS`, `AWAITING_SUPERVISOR_APPROVAL`, `COMPLETED`, `CANCELLED`), `sla_deadline`, `started_at`, `completed_at`.
- `maintenance_checklists`: `id` (UUID PK), `work_order_id` (FK), `checklist_type` (`MOTOR`, `DOORS`, `BRAKES`, `SAFETY_GEAR`, `CABIN`), `signed_by_technician` (Bool), `technician_signature_timestamp`, `approved_by_supervisor_id` (FK nullable).
- `maintenance_checklist_results`: `id` (UUID PK), `checklist_id` (FK), `item_key`, `category`, `expected_standard`, `actual_reading`, `pass_fail_status` (`PASS`, `FAIL`, `ATTENTION_NEEDED`), `notes`, `photo_url`.
- `spare_parts`: `id` (UUID PK), `organisation_id` (FK), `name`, `part_sku` (unique), `manufacturer`, `stock_quantity`, `minimum_alert_threshold`, `unit_cost`.
- `maintenance_parts`: `id` (UUID PK), `work_order_id` (FK), `part_id` (FK), `quantity_used`, `cost_per_unit`.
- `maintenance_logs`: `id` (UUID PK), `elevator_id` (FK), `work_order_id` (FK nullable), `technician_id` (FK), `entry_type` (`INSPECTION`, `REPAIR`, `LUBRICATION`, `COMPONENT_REPLACEMENT`), `summary`, `created_at`.
- `service_contracts`: `id` (UUID PK), `organisation_id` (FK), `elevator_id` (FK), `vendor_name`, `contract_type` (`COMPREHENSIVE_AMC`, `NON_COMPREHENSIVE`), `start_date`, `expiry_date`, `sla_response_hours`, `sla_resolution_hours`.

### 2.5 Faults, Alarms & Incidents
- `fault_events`: `id` (UUID PK), `organisation_id` (FK), `elevator_id` (FK), `fault_code` (e.g., `E-301`, `MOTOR_OVERHEAT`), `severity` (`INFO`, `WARNING`, `CRITICAL`), `source` (`CONTROLLER`, `SENSOR`, `GATEWAY`), `is_active` (Bool), `detected_at`, `cleared_at`.
- `alarm_events`: `id` (UUID PK), `organisation_id` (FK), `elevator_id` (FK), `alarm_type` (`DOOR_OBSTRUCTION`, `OVERLOAD`, `SAFETY_CHAIN_OPEN`, `EMERGENCY_STOP`), `severity` (`WARNING`, `CRITICAL`), `details` (JSONB), `acknowledged_by_user_id` (FK nullable), `acknowledged_at`, `timestamp`.
- `incidents`: `id` (UUID PK), `organisation_id` (FK), `building_id` (FK), `elevator_id` (FK), `incident_number` (unique), `incident_type` (`PASSENGER_ENTRAPMENT`, `SAFETY_CHAIN_TRIP`, `FIRE_ALARM_EVACUATION`, `EQUIPMENT_BREAKDOWN`), `severity` (`P1_CRITICAL`, `P2_HIGH`, `P3_MEDIUM`, `P4_LOW`), `status` (`NEW`, `ASSIGNED`, `RESPONDING`, `CONTAINED`, `RESOLVED`, `CLOSED`), `assigned_to_user_id` (FK nullable), `passengers_trapped` (Int), `sla_deadline`, `resolved_at`.

### 2.6 Telemetry & Time-Series (TimescaleDB)
- `telemetry_readings` (Hypertable partitioned on `timestamp`):
  - `id` (BIGSERIAL), `elevator_id` (UUID), `timestamp` (TIMESTAMPTZ), `floor` (Float), `target_floor` (Int), `direction` (`UP`, `DOWN`, `STATIONARY`), `velocity_mps` (Float), `door_state` (`OPEN`, `CLOSED`, `OPENING`, `CLOSING`), `door_cycles_count` (Int), `load_kg` (Float), `load_percentage` (Float), `is_overloaded` (Bool), `motor_temp_celsius` (Float), `motor_current_amps` (Float), `vibration_rms` (Float), `controller_temp_celsius` (Float), `battery_voltage` (Float), `safety_chain_closed` (Bool), `emergency_stop_active` (Bool).
- `gateway_heartbeats`: `gateway_id` (UUID), `timestamp` (TIMESTAMPTZ), `cpu_usage_pct`, `memory_usage_pct`, `latency_ms`, `uptime_seconds`.

### 2.7 Audit, Logs & Notifications
- `audit_logs`: `id` (UUID PK), `organisation_id` (FK nullable), `user_id` (FK nullable), `action` (e.g. `USER_LOGIN`, `COMMAND_REQUESTED`, `BOOKING_APPROVED`, `INCIDENT_ESCALATED`), `entity_name`, `entity_id`, `before_state` (JSONB nullable), `after_state` (JSONB nullable), `ip_address`, `user_agent`, `correlation_id`, `created_at`.
- `notifications`: `id` (UUID PK), `organisation_id` (FK), `user_id` (FK), `channel` (`IN_APP`, `EMAIL`, `SMS`, `WHATSAPP`), `type` (`FAULT`, `ALARM`, `EMERGENCY`, `BOOKING`, `MAINTENANCE`, `SECURITY`), `title`, `message`, `is_read`, `delivery_status` (`PENDING`, `SENT`, `FAILED`), `created_at`.
- `notification_templates`: `id` (UUID PK), `template_key` (unique), `channel`, `subject_template`, `body_template`.

