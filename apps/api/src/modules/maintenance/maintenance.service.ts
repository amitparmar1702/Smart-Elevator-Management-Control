import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkOrderStatus, WorkOrderType, PriorityLevel } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async findAllWorkOrders(organisationId?: string, technicianId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;
    if (technicianId) where.assignedTechnicianId = technicianId;

    return this.prisma.maintenanceWorkOrder.findMany({
      where,
      include: {
        elevator: { select: { id: true, name: true, assetCode: true, manufacturer: true } },
        building: { select: { id: true, name: true } },
        assignedTechnician: { select: { id: true, firstName: true, lastName: true, email: true } },
        checklists: {
          include: { results: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWorkOrder(data: {
    organisationId: string;
    buildingId: string;
    elevatorId: string;
    type: WorkOrderType;
    priority: PriorityLevel;
    assignedTechnicianId?: string;
  }) {
    const orderNumber = 'WO-' + Date.now().toString().slice(-6);
    return this.prisma.maintenanceWorkOrder.create({
      data: {
        organisationId: data.organisationId,
        buildingId: data.buildingId,
        elevatorId: data.elevatorId,
        orderNumber,
        type: data.type,
        priority: data.priority,
        assignedTechnicianId: data.assignedTechnicianId,
        status: WorkOrderStatus.SCHEDULED,
        checklists: {
          create: [
            {
              checklistType: 'TRACTION_MOTOR_INSPECTION',
              results: {
                create: [
                  {
                    itemKey: 'BEARING_TEMP',
                    category: 'Thermal',
                    expectedStandard: '< 70°C',
                    actualReading: '48°C',
                    passFailStatus: 'PASS',
                  },
                  {
                    itemKey: 'VIBRATION_RMS',
                    category: 'Mechanical',
                    expectedStandard: '< 0.12 m/s²',
                    actualReading: '0.045 m/s²',
                    passFailStatus: 'PASS',
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  async getSpareParts(organisationId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;
    return this.prisma.sparePart.findMany({ where, orderBy: { name: 'asc' } });
  }

  async consumePart(workOrderId: string, partId: string, quantity: number) {
    const part = await this.prisma.sparePart.findUnique({ where: { id: partId } });
    if (!part) throw new NotFoundException('Spare part not found');

    await this.prisma.sparePart.update({
      where: { id: partId },
      data: { stockQuantity: { decrement: quantity } },
    });

    return this.prisma.maintenancePart.create({
      data: {
        workOrderId,
        partId,
        quantity,
      },
    });
  }
}

