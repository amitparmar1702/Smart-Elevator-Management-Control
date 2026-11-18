import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganisationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organisation.findMany({
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
  }

  async findOne(id: string) {
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
    if (!org) throw new NotFoundException(`Organisation with ID ${id} not found`);
    return org;
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

