import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { OrgRole, OrgType, RsvpStatus } from '@prisma/client';

export class CreateOrgDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsEnum(OrgType)
  type: OrgType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class JoinOrgDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}

export class CreateOrgEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  startAt: string;

  @IsString()
  @IsNotEmpty()
  endAt: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  venueId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;
}

export class BulkCreateOrgEventsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  dates: string[]; // ISO date strings, one event per date

  @IsString()
  @IsOptional()
  startTime?: string; // "HH:MM"

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  venueId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;
}

export class UpdateOrgDto {
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateMemberRoleDto {
  @IsEnum(OrgRole)
  role: OrgRole;
}

export class RsvpDto {
  @IsEnum(RsvpStatus)
  status: RsvpStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  mapUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  pinned?: boolean;
}
