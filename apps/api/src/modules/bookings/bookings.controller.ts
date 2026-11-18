import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { BookingStatus } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List elevator reservations' })
  async listAll(@Request() req: any, @Query('buildingId') buildingId?: string) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.bookingsService.findAll(orgId, buildingId);
  }

  @Post()
  @ApiOperation({ summary: 'Create elevator service booking request' })
  async create(@Request() req: any, @Body() body: any) {
    return this.bookingsService.create({
      ...body,
      organisationId: req.user.organisationId,
      userId: req.user.id,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve or reject booking reservation' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.bookingsService.updateStatus(id, status, req.user.id, notes);
  }
}

