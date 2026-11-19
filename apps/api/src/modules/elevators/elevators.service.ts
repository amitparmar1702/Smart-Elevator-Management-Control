import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MOCK_ELEVATORS } from '../../common/mock-dataset';

@Injectable()
export class ElevatorsService {
  constructor(private prisma: PrismaService) {}

  async findByOrganisation(organisationId?: string, buildingId?: string) {
    try {
      const where: any = {};
      if (organisationId) where.organisationId = organisationId;
      if (buildingId) where.buildingId = buildingId;

      return await this.prisma.elevator.findMany({
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
    } catch {
      return MOCK_ELEVATORS.filter(
        (e) => (!organisationId || e.organisationId === organisationId) && (!buildingId || e.buildingId === buildingId)
      );
    }
  }

  async findOne(id: string) {
    try {
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

      if (elevator) return elevator;
    } catch {
      // fallback
    }

    const fallback = MOCK_ELEVATORS.find((e) => e.id === id);
    if (!fallback) throw new NotFoundException(`Elevator ${id} not found`);
    return fallback;
  }

  async getCapabilities(id: string) {
    try {
      return await this.prisma.elevatorCapability.findMany({
        where: { elevatorId: id },
      });
    } catch {
      const elv = MOCK_ELEVATORS.find((e) => e.id === id);
      return elv ? elv.capabilities : [];
    }
  }
}

