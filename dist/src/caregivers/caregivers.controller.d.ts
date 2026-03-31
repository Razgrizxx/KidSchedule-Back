import { CaregiversService } from './caregivers.service';
import { CreateCaregiverDto, UpdateCaregiverDto } from './dto/caregiver.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class CaregiversController {
    private caregiversService;
    constructor(caregiversService: CaregiversService);
    create(user: AuthUser, familyId: string, dto: CreateCaregiverDto): Promise<{
        id: string;
        familyId: string | null;
        name: string;
        phone: string | null;
        email: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        inviteToken: string | null;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        linkExpiresAt: Date | null;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<({
        children: ({
            child: {
                id: string;
                familyId: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                dateOfBirth: Date;
                color: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            childId: string;
            caregiverId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        familyId: string | null;
        name: string;
        phone: string | null;
        email: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        inviteToken: string | null;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        linkExpiresAt: Date | null;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    })[]>;
    findOne(user: AuthUser, familyId: string, caregiverId: string): Promise<{
        id: string;
        familyId: string | null;
        name: string;
        phone: string | null;
        email: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        inviteToken: string | null;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        linkExpiresAt: Date | null;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    update(user: AuthUser, familyId: string, caregiverId: string, dto: UpdateCaregiverDto): Promise<{
        id: string;
        familyId: string | null;
        name: string;
        phone: string | null;
        email: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        inviteToken: string | null;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        linkExpiresAt: Date | null;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    remove(user: AuthUser, familyId: string, caregiverId: string): Promise<{
        message: string;
    }>;
    assignToChild(user: AuthUser, familyId: string, caregiverId: string, childId: string): Promise<{
        id: string;
        childId: string;
        caregiverId: string;
        assignedAt: Date;
    }>;
    unassignFromChild(user: AuthUser, familyId: string, caregiverId: string, childId: string): Promise<{
        message: string;
    }>;
}
export declare class CaregiverInviteController {
    private caregiversService;
    constructor(caregiversService: CaregiversService);
    resolveToken(token: string): Promise<{
        name: string;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        children: {
            id: string;
            familyId: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            color: string;
            avatarUrl: string | null;
        }[];
    }>;
}
