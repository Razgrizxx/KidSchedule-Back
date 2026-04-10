import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateFamilySettingsDto } from './dto/update-family-settings.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
export declare class SettingsService {
    private prisma;
    private familyService;
    private cloudinary;
    constructor(prisma: PrismaService, familyService: FamilyService, cloudinary: CloudinaryService);
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
    registerFcmToken(userId: string, token: string): Promise<{
        ok: boolean;
    }>;
    removeFcmToken(userId: string, token: string): Promise<{
        ok: boolean;
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        avatarUrl: string | null;
    }>;
}
