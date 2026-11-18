import { PrismaClient, OrgStatus, SubscriptionPlan, UserStatus, RoleType, ElevatorOperationalStatus, TravelDirection, DoorOperationalState, GatewayStatus, CapabilityLevel, RemoteCommandType, RemoteCommandStatus, CallType, CallStatus, BookingPurpose, BookingStatus, WorkOrderType, PriorityLevel, WorkOrderStatus, SeverityLevel, IncidentStatus, NotificationChannel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ElevateOS database with enterprise demo dataset...');

  // Clear existing data in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.alarmEvent.deleteMany();
  await prisma.faultEvent.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.maintenancePart.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.maintenanceChecklistResult.deleteMany();
  await prisma.maintenanceChecklist.deleteMany();
  await prisma.maintenanceWorkOrder.deleteMany();
  await prisma.maintenancePlan.deleteMany();
  await prisma.serviceContract.deleteMany();
  await prisma.bookingApproval.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.callEvent.deleteMany();
  await prisma.elevatorCall.deleteMany();
  await prisma.commandEvent.deleteMany();
  await prisma.commandApproval.deleteMany();
  await prisma.elevatorCommand.deleteMany();
  await prisma.elevatorCapability.deleteMany();
  await prisma.gatewayCredential.deleteMany();
  await prisma.gateway.deleteMany();
  await prisma.controller.deleteMany();
  await prisma.elevatorGroupMember.deleteMany();
  await prisma.elevatorGroup.deleteMany();
  await prisma.elevatorFloor.deleteMany();
  await prisma.accessPolicy.deleteMany();
  await prisma.userFloorAccess.deleteMany();
  await prisma.userElevatorAccess.deleteMany();
  await prisma.userBuildingAccess.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.userDevice.deleteMany();
  await prisma.elevators.deleteMany?.() || await prisma.elevator.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.buildingWing.deleteMany();
  await prisma.building.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organisation.deleteMany();

  const passwordHash = await bcrypt.hash('Elevate@2026', 10);

  // 1. ORGANISATIONS
  const orgApex = await prisma.organisation.create({
    data: {
      name: 'Apex Commercial Properties',
      slug: 'apex-commercial',
      status: OrgStatus.ACTIVE,
      contactEmail: 'operations@apexproperties.com',
      subscriptions: {
        create: {
          plan: SubscriptionPlan.ENTERPRISE,
          maxBuildings: 20,
          maxElevators: 100,
        },
      },
    },
  });

  const orgSkyline = await prisma.organisation.create({
    data: {
      name: 'Skyline Luxury Residences',
      slug: 'skyline-residences',
      status: OrgStatus.ACTIVE,
      contactEmail: 'management@skyline.org',
      subscriptions: {
        create: {
          plan: SubscriptionPlan.PROFESSIONAL,
          maxBuildings: 5,
          maxElevators: 25,
        },
      },
    },
  });

  const orgMetroHealth = await prisma.organisation.create({
    data: {
      name: 'Metro Healthcare Network',
      slug: 'metro-health',
      status: OrgStatus.ACTIVE,
      contactEmail: 'facilities@metrohealth.med',
      subscriptions: {
        create: {
          plan: SubscriptionPlan.ENTERPRISE,
          maxBuildings: 10,
          maxElevators: 60,
        },
      },
    },
  });

  console.log('Created 3 Enterprise Organisations');

  // 2. USERS (Covering all 12 roles)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@elevateos.io',
      passwordHash,
      firstName: 'Vikram',
      lastName: 'Mehta',
      role: RoleType.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      mfaEnabled: true,
    },
  });

  const orgAdmin = await prisma.user.create({
    data: {
      organisationId: orgApex.id,
      email: 'admin@apexproperties.com',
      passwordHash,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      role: RoleType.ORGANISATION_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const buildingMgr = await prisma.user.create({
    data: {
      organisationId: orgApex.id,
      email: 'manager@apexproperties.com',
      passwordHash,
      firstName: 'Priya',
      lastName: 'Deshmukh',
      role: RoleType.BUILDING_MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  const technician = await prisma.user.create({
    data: {
      organisationId: orgApex.id,
      email: 'tech@apexproperties.com',
      passwordHash,
      firstName: 'Arjun',
      lastName: 'Rao',
      role: RoleType.TECHNICIAN,
      status: UserStatus.ACTIVE,
    },
  });

  const resident = await prisma.user.create({
    data: {
      organisationId: orgApex.id,
      email: 'resident@apexproperties.com',
      passwordHash,
      firstName: 'Ananya',
      lastName: 'Iyer',
      role: RoleType.RESIDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const security = await prisma.user.create({
    data: {
      organisationId: orgApex.id,
      email: 'security@apexproperties.com',
      passwordHash,
      firstName: 'Santosh',
      lastName: 'Yadav',
      role: RoleType.SECURITY_OPERATOR,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Created Primary Role Users');

  // 3. BUILDINGS & FLOORS
  const bldgApexTower = await prisma.building.create({
    data: {
      organisationId: orgApex.id,
      name: 'Apex Financial Tower A',
      code: 'APX-TWR-A',
      address: 'Plot 42, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      timezone: 'Asia/Kolkata',
    },
  });

  // Assign Building Manager & Resident to Building
  await prisma.userBuildingAccess.createMany({
    data: [
      { userId: buildingMgr.id, buildingId: bldgApexTower.id },
      { userId: security.id, buildingId: bldgApexTower.id },
      { userId: resident.id, buildingId: bldgApexTower.id },
      { userId: technician.id, buildingId: bldgApexTower.id },
    ],
  });

  // Create Wings
  const wingNorth = await prisma.buildingWing.create({
    data: {
      buildingId: bldgApexTower.id,
      name: 'North Core',
    },
  });

  // Create Floors (Basement 2 up to Floor 20)
  const floorRecords = [];
  for (let i = -2; i <= 20; i++) {
    if (i === 0) continue; // No floor 0
    const displayName = i < 0 ? `Basement ${Math.abs(i)}` : i === 1 ? 'Ground Floor' : `Floor ${i}`;
    const floor = await prisma.floor.create({
      data: {
        buildingId: bldgApexTower.id,
        wingId: wingNorth.id,
        floorNumber: i,
        displayName,
        isRestricted: i > 18 || i < 0,
      },
    });
    floorRecords.push(floor);
  }

  console.log(`Created Building with ${floorRecords.length} Floors`);

  // 4. ELEVATORS, CONTROLLERS & GATEWAYS
  const elevatorsData = [
    {
      name: 'Passenger Car 1 (High-Speed)',
      assetCode: 'ELV-A-01',
      manufacturer: 'KONE',
      model: 'MiniSpace KONE EcoDisc',
      speed: 2.5,
      capacity: 1350,
      passengers: 18,
      status: ElevatorOperationalStatus.RUNNING,
      floor: 8,
      direction: TravelDirection.UP,
      controllerType: 'KONE KCE',
      busProtocol: 'CANopen CiA 417',
    },
    {
      name: 'Passenger Car 2 (Standard)',
      assetCode: 'ELV-A-02',
      manufacturer: 'Otis',
      model: 'Gen2 Life ReGen',
      speed: 1.75,
      capacity: 1000,
      passengers: 13,
      status: ElevatorOperationalStatus.IDLE,
      floor: 1,
      direction: TravelDirection.STATIONARY,
      controllerType: 'Otis GECB',
      busProtocol: 'Modbus RTU',
    },
    {
      name: 'Service & Freight Car 3',
      assetCode: 'ELV-A-03',
      manufacturer: 'Schindler',
      model: 'Schindler 5500 MRL',
      speed: 1.6,
      capacity: 2000,
      passengers: 26,
      status: ElevatorOperationalStatus.RUNNING,
      floor: 3,
      direction: TravelDirection.DOWN,
      controllerType: 'Schindler CO MX',
      busProtocol: 'LONWorks / Modbus TCP',
    },
    {
      name: 'Firefighters & Emergency Car 4',
      assetCode: 'ELV-A-04',
      manufacturer: 'TK Elevator',
      model: 'evolution 200 Heavy Duty',
      speed: 2.0,
      capacity: 1250,
      passengers: 16,
      status: ElevatorOperationalStatus.IDLE,
      floor: 1,
      direction: TravelDirection.STATIONARY,
      controllerType: 'TKE TAC50',
      busProtocol: 'CANbus 2.0B',
    },
  ];

  for (const elv of elevatorsData) {
    const elevator = await prisma.elevator.create({
      data: {
        organisationId: orgApex.id,
        buildingId: bldgApexTower.id,
        wingId: wingNorth.id,
        name: elv.name,
        assetCode: elv.assetCode,
        manufacturer: elv.manufacturer,
        model: elv.model,
        installationYear: 2023,
        capacityKg: elv.capacity,
        maxPassengers: elv.passengers,
        ratedSpeedMps: elv.speed,
        status: elv.status,
        currentFloor: elv.floor,
        currentDirection: elv.direction,
        doorState: DoorOperationalState.CLOSED,
        controller: {
          create: {
            controllerType: elv.controllerType,
            firmwareVersion: 'v4.18.2-prod',
            busProtocol: elv.busProtocol,
            ipAddress: '192.168.10.10' + elv.assetCode.slice(-1),
            gateway: {
              create: {
                deviceIdentifier: `GW-${elv.assetCode}`,
                firmwareVersion: 'gw-rtos-2.2.0',
                status: GatewayStatus.ONLINE,
                lastHeartbeatAt: new Date(),
              },
            },
          },
        },
      },
    });

    // Link all floors to each elevator
    await prisma.elevatorFloor.createMany({
      data: floorRecords.map((f) => ({
        elevatorId: elevator.id,
        floorId: f.id,
        isServiceFloor: true,
      })),
    });

    // Populate Capabilities
    await prisma.elevatorCapability.createMany({
      data: [
        { elevatorId: elevator.id, capabilityKey: 'LANDING_CALL', status: CapabilityLevel.SUPPORTED },
        { elevatorId: elevator.id, capabilityKey: 'DESTINATION_DISPATCH', status: CapabilityLevel.SUPPORTED },
        { elevatorId: elevator.id, capabilityKey: 'REMOTE_PARKING', status: CapabilityLevel.SUPPORTED },
        { elevatorId: elevator.id, capabilityKey: 'DOOR_HOLD', status: CapabilityLevel.SUPPORTED },
        { elevatorId: elevator.id, capabilityKey: 'SERVICE_MODE', status: CapabilityLevel.SUPPORTED },
        { elevatorId: elevator.id, capabilityKey: 'MOTOR_TELEMETRY', status: CapabilityLevel.SUPPORTED },
        { elevatorId: elevator.id, capabilityKey: 'DOOR_CYCLE_TRACKING', status: CapabilityLevel.SUPPORTED },
      ],
    });
  }

  console.log('Registered Elevators, Controllers, Gateways and Capabilities');

  // 5. SPARE PARTS & MAINTENANCE PLANS
  await prisma.sparePart.createMany({
    data: [
      {
        organisationId: orgApex.id,
        name: 'Door Interlock Roller Assembly',
        partSku: 'SKU-DR-201',
        manufacturer: 'KONE',
        stockQuantity: 14,
        minThreshold: 4,
        unitCost: 120.0,
      },
      {
        organisationId: orgApex.id,
        name: 'Guide Shoe Insert 16mm',
        partSku: 'SKU-GS-105',
        manufacturer: 'Otis',
        stockQuantity: 28,
        minThreshold: 8,
        unitCost: 45.0,
      },
      {
        organisationId: orgApex.id,
        name: 'Traction Drive Frequency Inverter Filter',
        partSku: 'SKU-INV-77',
        manufacturer: 'Yaskawa / Generic',
        stockQuantity: 3,
        minThreshold: 2,
        unitCost: 480.0,
      },
    ],
  });

  console.log('Seeded Spare Parts Inventory');
  console.log('ElevateOS Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

