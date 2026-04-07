import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ExpenseCategory, RecurringFrequency } from '@prisma/client';

export class CreateRecurringExpenseDto {
  @IsOptional()
  @IsUUID()
  childId?: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  splitRatio?: number;
}

export class UpdateRecurringExpenseDto extends PartialType(CreateRecurringExpenseDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
