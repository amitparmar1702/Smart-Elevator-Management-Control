import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MOCK_BUILDINGS } from '../../common/mock-dataset';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async findByOrganisation(organisationId: string) {
    try {
      return await this.prisma.building.findMany({
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
    } catch {
      return MOCK_BUILDINGS.filter((b) => !organisationId || b.organisationId === organisationId);
    }
  }

  async findOne(id: string, organisationId?: string) {
    try {
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

      if (building) return building;
    } catch {
      // fallback
    }

    const fallback = MOCK_BUILDINGS.find((b) => b.id === id);
    if (!fallback) throw new NotFoundException(`Building ${id} not found`);
    return fallback;
  }
}

