import {
  IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID,
} from 'class-validator';

export class CreateTravelNoticeDto {
  @IsOptional()
  @IsUUID()
  childId?: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsDateString()
  departureDate: string;

  @IsDateString()
  returnDate: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
