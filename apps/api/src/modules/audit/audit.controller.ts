import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Audit Trail')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Query immutable business and operational audit logs' })
  async listAll(@Request() req: any) {
    const orgId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.organisationId;
    return this.auditService.findAll(orgId);
  }
}

