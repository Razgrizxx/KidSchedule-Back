import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateFamilySettingsDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'transitionTime must be HH:MM' })
  transitionTime?: string;

  @IsOptional()
  @IsString()
  weekStartsOn?: string;
}
