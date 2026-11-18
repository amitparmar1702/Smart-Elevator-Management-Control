import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FaultsService } from './faults.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Faults & Alarms')
@Controller('faults')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class FaultsController {
  constructor(private readonly faultsService: FaultsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active equipment faults' })
  async getActiveFaults(@Request() req: any) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.faultsService.findActiveFaults(orgId);
  }

  @Get('alarms')
  @ApiOperation({ summary: 'Get active alarm events' })
  async getAlarms(@Request() req: any) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.faultsService.findAlarms(orgId);
  }

  @Post('alarms/:id/acknowledge')
  @ApiOperation({ summary: 'Operator acknowledgement of alarm' })
  async ackAlarm(@Param('id') id: string, @Request() req: any) {
    return this.faultsService.acknowledgeAlarm(id, req.user.id);
  }
}

