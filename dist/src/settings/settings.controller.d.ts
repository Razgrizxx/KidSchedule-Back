import { SettingsService } from './settings.service';
import { UpdateFamilySettingsDto } from './dto/update-family-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getFamilySettings(familyId: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        timezone: string;
        transitionDay: string;
        transitionTime: string;
        weekStartsOn: string;
    }>;
    updateFamilySettings(familyId: string, user: AuthUser, dto: UpdateFamilySettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        timezone: string;
        transitionDay: string;
        transitionTime: string;
        weekStartsOn: string;
    }>;
    getUserSettings(user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        timeFormat: import("@prisma/client").$Enums.TimeFormat;
        emailNotifications: boolean;
        pushNotifications: boolean;
        appearance: import("@prisma/client").$Enums.AppearanceTheme;
    }>;
    updateUserSettings(user: AuthUser, dto: UpdateUserSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        timeFormat: import("@prisma/client").$Enums.TimeFormat;
        emailNotifications: boolean;
        pushNotifications: boolean;
        appearance: import("@prisma/client").$Enums.AppearanceTheme;
    }>;
    uploadAvatar(user: AuthUser, file: Express.Multer.File): Promise<{
        avatarUrl: string | null;
    }>;
}
