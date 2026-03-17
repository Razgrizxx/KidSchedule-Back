import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { UpdateFamilySettingsDto } from './dto/update-family-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
export declare class SettingsService {
    private prisma;
    private familyService;
    constructor(prisma: PrismaService, familyService: FamilyService);
    getFamilySettings(familyId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        timezone: string;
        transitionDay: string;
        transitionTime: string;
        weekStartsOn: string;
    }>;
    updateFamilySettings(familyId: string, userId: string, dto: UpdateFamilySettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        timezone: string;
        transitionDay: string;
        transitionTime: string;
        weekStartsOn: string;
    }>;
    getUserSettings(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        timeFormat: import("@prisma/client").$Enums.TimeFormat;
        emailNotifications: boolean;
        pushNotifications: boolean;
        appearance: import("@prisma/client").$Enums.AppearanceTheme;
    }>;
    updateUserSettings(userId: string, dto: UpdateUserSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        timeFormat: import("@prisma/client").$Enums.TimeFormat;
        emailNotifications: boolean;
        pushNotifications: boolean;
        appearance: import("@prisma/client").$Enums.AppearanceTheme;
    }>;
}
