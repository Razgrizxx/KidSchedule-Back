import {
  IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, IsEmail, IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { EmergencyContactRole } from '@prisma/client';

export class CreateEmergencyContactDto {
  @IsUUID()
  childId: string;

  @IsEnum(EmergencyContactRole)
  role: EmergencyContactRole;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateEmergencyContactDto extends PartialType(CreateEmergencyContactDto) {}
