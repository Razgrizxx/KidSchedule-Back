import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
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

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  splitRatio?: number;
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
