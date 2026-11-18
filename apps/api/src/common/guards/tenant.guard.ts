import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleType } from '@prisma/client';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User session required for tenant scoping');
    }

    // Super Admin has global scope
    if (user.role === RoleType.SUPER_ADMIN || user.role === RoleType.PLATFORM_SUPPORT) {
      return true;
    }

    const requestedOrgId =
      request.params?.organisationId ||
      request.params?.orgId ||
      request.query?.organisationId ||
      request.body?.organisationId;

    if (requestedOrgId && requestedOrgId !== user.organisationId) {
      throw new ForbiddenException('Tenant boundary violation. Cross-tenant access is strictly prohibited.');
    }

    // Bind current user's organisationId into request context for repository queries
    request.tenantId = user.organisationId;
    return true;
  }
}

