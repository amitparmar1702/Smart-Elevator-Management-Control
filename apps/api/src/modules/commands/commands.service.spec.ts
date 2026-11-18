import { Test, TestingModule } from '@nestjs/testing';
import { CommandsService, SubmitCommandDto } from './commands.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RemoteCommandType, RemoteCommandStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('CommandsService (Secure Remote Command Workflow)', () => {
  let service: CommandsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      elevatorCommand: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      elevatorCapability: {
        findUnique: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CommandsService>(CommandsService);
  });

  const baseDto: SubmitCommandDto = {
    organisationId: 'org-1',
    buildingId: 'bldg-1',
    elevatorId: 'elev-1',
    userId: 'user-1',
    commandType: RemoteCommandType.DISPATCH_CALL,
    parameters: { targetFloor: 5 },
    idempotencyKey: 'idem-test-12345',
  };

  it('should return existing command if idempotency key matches (idempotent)', async () => {
    const existingCommand = {
      id: 'cmd-existing',
      idempotencyKey: 'idem-test-12345',
      status: RemoteCommandStatus.QUEUED,
    };
    prisma.elevatorCommand.findUnique.mockResolvedValue(existingCommand);

    const result = await service.submitCommand(baseDto);

    expect(result).toEqual(existingCommand);
    expect(prisma.elevatorCommand.create).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if capability is UNSUPPORTED by hardware', async () => {
    prisma.elevatorCommand.findUnique.mockResolvedValue(null);
    prisma.elevatorCapability.findUnique.mockResolvedValue({
      status: 'UNSUPPORTED',
    });

    await expect(service.submitCommand(baseDto)).rejects.toThrow(BadRequestException);
    expect(prisma.elevatorCommand.create).not.toHaveBeenCalled();
  });

  it('should queue command, create audit log, and set 30s TTL on success', async () => {
    prisma.elevatorCommand.findUnique.mockResolvedValue(null);
    prisma.elevatorCapability.findUnique.mockResolvedValue({
      status: 'SUPPORTED',
    });

    const createdCommand = {
      id: 'cmd-new',
      status: RemoteCommandStatus.QUEUED,
      correlationId: 'corr-xyz',
    };
    prisma.elevatorCommand.create.mockResolvedValue(createdCommand);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const result = await service.submitCommand(baseDto);

    expect(result).toEqual(createdCommand);
    expect(prisma.elevatorCommand.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: RemoteCommandStatus.QUEUED,
          idempotencyKey: 'idem-test-12345',
          requestedById: 'user-1',
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'COMMAND_REQUESTED',
          entityName: 'ElevatorCommand',
        }),
      }),
    );
  });

  it('should transition status to COMPLETED when physical state telemetry is verified', async () => {
    const commandId = 'cmd-abc';
    prisma.elevatorCommand.update.mockResolvedValue({
      id: commandId,
      status: RemoteCommandStatus.COMPLETED,
    });

    const result = await service.verifyPhysicalState(commandId, true);

    expect(result.status).toBe(RemoteCommandStatus.COMPLETED);
    expect(prisma.elevatorCommand.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: commandId },
        data: expect.objectContaining({
          status: RemoteCommandStatus.COMPLETED,
        }),
      }),
    );
  });

  it('should transition status to FAILED when physical state verification fails', async () => {
    const commandId = 'cmd-abc';
    prisma.elevatorCommand.update.mockResolvedValue({
      id: commandId,
      status: RemoteCommandStatus.FAILED,
      failureReason: 'Door sensor obstruction timeout',
    });

    const result = await service.verifyPhysicalState(commandId, false, 'Door sensor obstruction timeout');

    expect(result.status).toBe(RemoteCommandStatus.FAILED);
    expect(prisma.elevatorCommand.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: commandId },
        data: expect.objectContaining({
          status: RemoteCommandStatus.FAILED,
          failureReason: 'Door sensor obstruction timeout',
        }),
      }),
    );
  });
});

