import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MOCK_ORGANISATIONS } from '../../common/mock-dataset';

@Injectable()
export class OrganisationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.organisation.findMany({
        include: {
          subscriptions: true,
          _count: {
            select: {
              buildings: true,
              elevators: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      return MOCK_ORGANISATIONS;
    }
  }

  async findOne(id: string) {
    try {
      const org = await this.prisma.organisation.findUnique({
        where: { id },
        include: {
          subscriptions: true,
          buildings: {
            include: {
              elevators: true,
            },
          },
          _count: {
            select: {
              elevators: true,
              users: true,
              workOrders: true,
            },
          },
        },
      });
      if (org) return org;
    } catch {
      // fallback
    }

    const fallback = MOCK_ORGANISATIONS.find((o) => o.id === id);
    if (!fallback) throw new NotFoundException(`Organisation with ID ${id} not found`);
    return fallback;
  }

  async create(data: { name: string; slug: string; contactEmail: string }) {
    return this.prisma.organisation.create({
      data: {
        name: data.name,
        slug: data.slug,
        contactEmail: data.contactEmail,
        subscriptions: {
          create: {
            plan: 'PROFESSIONAL',
            maxBuildings: 10,
            maxElevators: 50,
          },
        },
      },
      include: { subscriptions: true },
    });
  }
}

