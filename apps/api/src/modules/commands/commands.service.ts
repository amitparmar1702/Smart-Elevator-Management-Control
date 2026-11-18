import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RemoteCommandType, RemoteCommandStatus } from '@prisma/client';

export interface SubmitCommandDto {
  organisationId: string;
  buildingId: string;
  elevatorId: string;
  userId: string;
  commandType: RemoteCommandType;
  parameters: Record<string, any>;
  idempotencyKey: string;
}

@Injectable()
export class CommandsService {
  constructor(private prisma: PrismaService) {}

  async submitCommand(dto: SubmitCommandDto) {
    // 1. Idempotency Check: Prevent duplicate submissions
    const existing = await this.prisma.elevatorCommand.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    // 2. Validate elevator capability
    const capabilityKey =
      dto.commandType === RemoteCommandType.DISPATCH_CALL
        ? 'DESTINATION_DISPATCH'
        : dto.commandType === RemoteCommandType.PARK_FLOOR
        ? 'REMOTE_PARKING'
        : dto.commandType === RemoteCommandType.DOOR_HOLD
        ? 'DOOR_HOLD'
        : 'SERVICE_MODE';

    const capability = await this.prisma.elevatorCapability.findUnique({
      where: {
        elevatorId_capabilityKey: {
          elevatorId: dto.elevatorId,
          capabilityKey,
        },
      },
    });

    if (capability && capability.status === 'UNSUPPORTED') {
      throw new BadRequestException(
        `Command ${dto.commandType} is not supported by this elevator controller hardware`,
      );
    }

    // 3. Create command with 30-second TTL
    const correlationId = 'corr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const expiresAt = new Date(Date.now() + 30 * 1000);

    const command = await this.prisma.elevatorCommand.create({
      data: {
        organisationId: dto.organisationId,
        buildingId: dto.buildingId,
        elevatorId: dto.elevatorId,
        requestedById: dto.userId,
        commandType: dto.commandType,
        parameters: dto.parameters,
        correlationId,
        idempotencyKey: dto.idempotencyKey,
        status: RemoteCommandStatus.QUEUED,
        expiresAt,
        events: {
          create: {
            eventType: 'COMMAND_QUEUED',
            payload: { parameters: dto.parameters },
          },
        },
      },
    });

    // Record in Audit Log
    await this.prisma.auditLog.create({
      data: {
        organisationId: dto.organisationId,
        userId: dto.userId,
        action: 'COMMAND_REQUESTED',
        entityName: 'ElevatorCommand',
        entityId: command.id,
        correlationId,
        afterState: { type: dto.commandType, params: dto.parameters },
      },
    });

    return command;
  }

  async findByElevator(elevatorId: string) {
    return this.prisma.elevatorCommand.findMany({
      where: { elevatorId },
      include: {
        requestedBy: { select: { firstName: true, lastName: true, email: true } },
        approvals: true,
        events: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async verifyPhysicalState(commandId: string, verified: boolean, reason?: string) {
    const status = verified ? RemoteCommandStatus.COMPLETED : RemoteCommandStatus.FAILED;
    return this.prisma.elevatorCommand.update({
      where: { id: commandId },
      data: {
        status,
        failureReason: reason,
        completedAt: new Date(),
        events: {
          create: {
            eventType: verified ? 'PHYSICAL_VERIFIED' : 'VERIFICATION_FAILED',
            payload: { reason },
          },
        },
      },
    });
  }
}

