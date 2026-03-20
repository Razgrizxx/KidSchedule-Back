import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChangeRequestType } from '@prisma/client';

export class CreateChangeRequestDto {
  @IsEnum(ChangeRequestType)
  type: ChangeRequestType;

  @IsOptional()
  @IsDateString()
  originalDate?: string;

  @IsDateString()
  requestedDate: string;

  @IsOptional()
  @IsDateString()
  requestedDateTo?: string;

  @IsOptional()
  @IsUUID()
  childId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RespondChangeRequestDto {
  @IsString()
  @IsNotEmpty()
  action: 'ACCEPTED' | 'DECLINED' | 'COUNTER_PROPOSED';

  @IsOptional()
  @IsDateString()
  counterDate?: string;

  @IsOptional()
  @IsString()
  counterReason?: string;
}
