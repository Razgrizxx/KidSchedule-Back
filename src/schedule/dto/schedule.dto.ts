import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  Matches,
} from 'class-validator';
import { CustodyPattern } from '@prisma/client';

export class CreateScheduleDto {
  @IsUUID()
  childId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CustodyPattern)
  pattern: CustodyPattern;

  @IsISO8601()
  startDate: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(730)
  durationDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  exchangeDay?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'exchangeTime must be HH:MM',
  })
  exchangeTime?: string;

  @IsOptional()
  @IsUUID()
  parent1Id?: string;

  @IsOptional()
  @IsUUID()
  parent2Id?: string;
}
