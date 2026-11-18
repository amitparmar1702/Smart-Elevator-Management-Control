import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FaultsService {
  constructor(private prisma: PrismaService) {}

  async findActiveFaults(organisationId?: string) {
    const where: any = { isActive: true };
    if (organisationId) where.organisationId = organisationId;

    return this.prisma.faultEvent.findMany({
      where,
      include: {
        elevator: { select: { id: true, name: true, assetCode: true, building: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async findAlarms(organisationId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;

    return this.prisma.alarmEvent.findMany({
      where,
      include: {
        elevator: { select: { id: true, name: true, assetCode: true } },
        acknowledgedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async acknowledgeAlarm(alarmId: string, userId: string) {
    return this.prisma.alarmEvent.update({
      where: { id: alarmId },
      data: {
        acknowledgedByUserId: userId,
        acknowledgedAt: new Date(),
      },
    });
  }
}

