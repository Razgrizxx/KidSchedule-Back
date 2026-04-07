import { IsDateString } from 'class-validator';

export class GenerateReportDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
