import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsISO8601,
  IsUUID,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { EventType, EventVisibility, RepeatPattern } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(EventType)
  type: EventType;

  @IsEnum(EventVisibility)
  visibility: EventVisibility;

  @IsISO8601()
  startAt: string;

  @IsISO8601()
  endAt: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsEnum(RepeatPattern)
  repeat: RepeatPattern;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  childIds: string[];
}
