import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ElevatorsService {
  constructor(private prisma: PrismaService) {}

  async findByOrganisation(organisationId?: string, buildingId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;
    if (buildingId) where.buildingId = buildingId;

    return this.prisma.elevator.findMany({
      where,
      include: {
        building: { select: { id: true, name: true, code: true } },
        controller: {
          include: { gateway: true },
        },
        capabilities: true,
      },
      orderBy: { assetCode: 'asc' },
    });
  }

  async findOne(id: string) {
    const elevator = await this.prisma.elevator.findUnique({
      where: { id },
      include: {
        building: true,
        wing: true,
        controller: {
          include: { gateway: true },
        },
        capabilities: true,
        floors: {
          include: { floor: true },
        },
        workOrders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        faultEvents: {
          where: { isActive: true },
        },
      },
    });

    if (!elevator) throw new NotFoundException(`Elevator ${id} not found`);
    return elevator;
  }

  async getCapabilities(id: string) {
    return this.prisma.elevatorCapability.findMany({
      where: { elevatorId: id },
    });
  }
}

