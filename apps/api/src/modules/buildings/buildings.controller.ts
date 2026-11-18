import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Buildings')
@Controller('buildings')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  @ApiOperation({ summary: 'List buildings belonging to the user tenant organisation' })
  async listForTenant(@Request() req: any) {
    return this.buildingsService.findByOrganisation(req.user.organisationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building details, wings, floors, and elevators' })
  async getDetails(@Param('id') id: string, @Request() req: any) {
    return this.buildingsService.findOne(id, req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId);
  }
}

