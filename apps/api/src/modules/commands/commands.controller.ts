import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandsService } from './commands.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Commands')
@Controller('commands')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit secure remote elevator command (Idempotency key required)' })
  async submitCommand(@Request() req: any, @Body() body: any) {
    return this.commandsService.submitCommand({
      ...body,
      organisationId: req.user.organisationId,
      userId: req.user.id,
    });
  }

  @Get('elevator/:elevatorId')
  @ApiOperation({ summary: 'Get command execution and physical-state verification history for an elevator' })
  async getElevatorCommands(@Param('elevatorId') elevatorId: string) {
    return this.commandsService.findByElevator(elevatorId);
  }
}

