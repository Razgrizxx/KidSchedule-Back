import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { HealthRecordType, DocumentType, AllergySeverity } from '@prisma/client';

export class CreateHealthRecordDto {
  @IsUUID()
  childId: string;

  @IsEnum(HealthRecordType)
  type: HealthRecordType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateHealthRecordDto {
  @IsOptional()
  @IsEnum(HealthRecordType)
  type?: HealthRecordType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMedicationDto {
  @IsUUID()
  childId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  prescribedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMedicationDto {
  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateAllergyDto {
  @IsUUID()
  childId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AllergySeverity)
  severity: AllergySeverity;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDocumentDto {
  @IsUUID()
  childId: string;

  @IsOptional()
  @IsUUID()
  recordId?: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  title: string;
}
