import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Organisations')
@Controller('organisations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganisationsController {
  constructor(private readonly orgService: OrganisationsService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.PLATFORM_SUPPORT)
  @ApiOperation({ summary: 'List all customer organisations (Super Admin only)' })
  async listAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ORGANISATION_ADMIN)
  @ApiOperation({ summary: 'Get organisation details and subscription status' })
  async getDetails(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new customer organisation' })
  async create(@Body() body: { name: string; slug: string; contactEmail: string }) {
    return this.orgService.create(body);
  }
}

