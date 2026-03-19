import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CaregiverLinkExpiry, CaregiverVisibility } from '@prisma/client';

export class CreateCaregiverDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsEnum(CaregiverVisibility)
  visibility!: CaregiverVisibility;

  @IsEnum(CaregiverLinkExpiry)
  linkExpiry!: CaregiverLinkExpiry;

  @IsOptional()
  @IsBoolean()
  canViewCalendar?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewHealthInfo?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewEmergencyContacts?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewAllergies?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}

export class UpdateCaregiverDto extends PartialType(CreateCaregiverDto) {}
