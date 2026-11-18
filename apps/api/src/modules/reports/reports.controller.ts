import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Analytics & Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('analytics/fleet')
  @ApiOperation({ summary: 'Get overall fleet analytics, availability trend and energy metrics' })
  async getFleetAnalytics(@Request() req: any) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.reportsService.getFleetAnalytics(orgId);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export operational or compliance report to PDF/Excel' })
  async exportReport(@Body() body: { reportType: string; format: 'PDF' | 'EXCEL' }) {
    return this.reportsService.exportReport(body.reportType, body.format);
  }
}

