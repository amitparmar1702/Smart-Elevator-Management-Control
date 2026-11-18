import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async findByOrganisation(organisationId: string) {
    return this.prisma.building.findMany({
      where: { organisationId },
      include: {
        wings: true,
        elevators: {
          select: {
            id: true,
            name: true,
            assetCode: true,
            status: true,
            currentFloor: true,
            currentDirection: true,
          },
        },
        _count: {
          select: {
            floors: true,
            elevators: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organisationId?: string) {
    const whereClause: any = { id };
    if (organisationId) {
      whereClause.organisationId = organisationId;
    }

    const building = await this.prisma.building.findFirst({
      where: whereClause,
      include: {
        wings: true,
        floors: {
          orderBy: { floorNumber: 'asc' },
        },
        elevators: {
          include: {
            controller: true,
            capabilities: true,
          },
        },
      },
    });

    if (!building) throw new NotFoundException(`Building ${id} not found`);
    return building;
  }
}

