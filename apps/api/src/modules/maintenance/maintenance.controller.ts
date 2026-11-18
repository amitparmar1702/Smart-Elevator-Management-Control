import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('work-orders')
  @ApiOperation({ summary: 'List work orders' })
  async listWorkOrders(@Request() req: any, @Query('technicianId') techId?: string) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.maintenanceService.findAllWorkOrders(orgId, techId);
  }

  @Post('work-orders')
  @ApiOperation({ summary: 'Create maintenance work order' })
  async createWorkOrder(@Request() req: any, @Body() body: any) {
    return this.maintenanceService.createWorkOrder({
      ...body,
      organisationId: req.user.organisationId,
    });
  }

  @Get('spare-parts')
  @ApiOperation({ summary: 'List spare parts inventory' })
  async listSpareParts(@Request() req: any) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.maintenanceService.getSpareParts(orgId);
  }
}

