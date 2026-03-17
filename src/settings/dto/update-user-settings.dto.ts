import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AppearanceTheme, TimeFormat } from '@prisma/client';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsEnum(TimeFormat)
  timeFormat?: TimeFormat;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsEnum(AppearanceTheme)
  appearance?: AppearanceTheme;
}
