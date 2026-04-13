import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateHandoffDto {
  @IsUUID()
  childId: string;

  @IsDateString()
  handoffAt: string;

  @IsUUID()
  toParentId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmHandoffDto {
  // Empty body — the actor is taken from the JWT token
}
