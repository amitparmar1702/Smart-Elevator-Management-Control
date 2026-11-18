import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@apexproperties.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Elevate@2026' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, example: '123456' })
  @IsOptional()
  @IsString()
  mfaCode?: string;
}

export class MfaVerifyDto {
  @ApiProperty({ example: 'usr-id-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  totpCode: string;
}

