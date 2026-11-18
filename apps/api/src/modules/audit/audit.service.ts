import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(organisationId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async logAction(data: {
    organisationId?: string;
    userId?: string;
    action: string;
    entityName: string;
    entityId: string;
    beforeState?: any;
    afterState?: any;
    correlationId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        organisationId: data.organisationId,
        userId: data.userId,
        action: data.action,
        entityName: data.entityName,
        entityId: data.entityId,
        beforeState: data.beforeState,
        afterState: data.afterState,
        correlationId: data.correlationId,
      },
    });
  }
}

