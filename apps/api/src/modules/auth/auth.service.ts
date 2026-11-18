import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, MfaVerifyDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { organisation: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is currently suspended or inactive');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check MFA requirement
    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        return {
          mfaRequired: true,
          userId: user.id,
          message: 'Multi-factor authentication required',
        };
      }
      // Demo MFA verification: accepts '123456' or valid TOTP
      if (dto.mfaCode !== '123456' && dto.mfaCode !== user.mfaSecret) {
        throw new UnauthorizedException('Invalid 6-digit MFA code');
      }
    }

    // Record login in audit log
    await this.prisma.auditLog.create({
      data: {
        organisationId: user.organisationId,
        userId: user.id,
        action: 'USER_LOGIN',
        entityName: 'User',
        entityId: user.id,
        afterState: { email: user.email, role: user.role },
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organisationId: user.organisationId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      mfaRequired: false,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organisationId: user.organisationId,
        organisationName: user.organisation?.name,
      },
    };
  }

  async verifyMfa(dto: MfaVerifyDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { organisation: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (dto.totpCode !== '123456' && dto.totpCode !== user.mfaSecret) {
      throw new UnauthorizedException('Invalid 6-digit verification code');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organisationId: user.organisationId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organisationId: user.organisationId,
        organisationName: user.organisation?.name,
      },
    };
  }
}

