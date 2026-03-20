import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMomentDto {
  @IsOptional()
  @IsUUID()
  childId?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
