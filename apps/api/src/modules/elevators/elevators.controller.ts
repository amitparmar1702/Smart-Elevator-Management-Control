import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ElevatorsService } from './elevators.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Elevators')
@Controller('elevators')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class ElevatorsController {
  constructor(private readonly elevatorsService: ElevatorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all elevators for current tenant organisation' })
  @ApiQuery({ name: 'buildingId', required: false })
  async listAll(@Request() req: any, @Query('buildingId') buildingId?: string) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.elevatorsService.findByOrganisation(orgId, buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full elevator asset profile, controller and capabilities' })
  async getDetails(@Param('id') id: string) {
    return this.elevatorsService.findOne(id);
  }

  @Get(':id/capabilities')
  @ApiOperation({ summary: 'Get declared OEM capabilities matrix for an elevator' })
  async getCapabilities(@Param('id') id: string) {
    return this.elevatorsService.getCapabilities(id);
  }
}

