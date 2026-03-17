import {
  IsDateString,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsHexColor()
  color: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateChildDto extends PartialType(CreateChildDto) {}
