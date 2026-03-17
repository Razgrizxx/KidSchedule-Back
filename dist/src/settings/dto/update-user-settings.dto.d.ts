import { AppearanceTheme, TimeFormat } from '@prisma/client';
export declare class UpdateUserSettingsDto {
  timeFormat?: TimeFormat;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  appearance?: AppearanceTheme;
}
