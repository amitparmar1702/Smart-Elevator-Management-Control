import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { RoleType } from '@prisma/client';

describe('TenantGuard (Multi-Tenant Isolation)', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  function createMockContext(user: any, params = {}, query = {}, body = {}): ExecutionContext {
    const request: any = {
      user,
      params,
      query,
      body,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should throw ForbiddenException if user session is missing', () => {
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN access across any tenant', () => {
    const context = createMockContext(
      { id: 'admin-1', role: RoleType.SUPER_ADMIN, organisationId: 'org-platform' },
      { organisationId: 'org-customer-a' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow PLATFORM_SUPPORT access across any tenant', () => {
    const context = createMockContext(
      { id: 'support-1', role: RoleType.PLATFORM_SUPPORT, organisationId: 'org-platform' },
      { orgId: 'org-customer-b' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow ORGANISATION_ADMIN access within their own organisation', () => {
    const user = { id: 'user-a', role: RoleType.ORGANISATION_ADMIN, organisationId: 'org-customer-a' };
    const context = createMockContext(user, { organisationId: 'org-customer-a' });
    const canActivate = guard.canActivate(context);
    expect(canActivate).toBe(true);
    expect((context.switchToHttp().getRequest() as any).tenantId).toBe('org-customer-a');
  });

  it('should REJECT ORGANISATION_ADMIN attempting to query another organisation via params', () => {
    const user = { id: 'user-a', role: RoleType.ORGANISATION_ADMIN, organisationId: 'org-customer-a' };
    const context = createMockContext(user, { organisationId: 'org-customer-b' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should REJECT ORGANISATION_ADMIN attempting to query another organisation via query string', () => {
    const user = { id: 'user-a', role: RoleType.ORGANISATION_ADMIN, organisationId: 'org-customer-a' };
    const context = createMockContext(user, {}, { organisationId: 'org-customer-b' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should REJECT ORGANISATION_ADMIN attempting to inject another organisation via body', () => {
    const user = { id: 'user-a', role: RoleType.ORGANISATION_ADMIN, organisationId: 'org-customer-a' };
    const context = createMockContext(user, {}, {}, { organisationId: 'org-customer-b' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

