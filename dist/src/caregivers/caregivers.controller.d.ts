import { CaregiversService } from './caregivers.service';
import { CreateCaregiverDto, UpdateCaregiverDto } from './dto/caregiver.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class CaregiversController {
    private caregiversService;
    constructor(caregiversService: CaregiversService);
    create(user: AuthUser, familyId: string, dto: CreateCaregiverDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        inviteToken: string | null;
        linkExpiresAt: Date | null;
        createdBy: string;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<({
        children: ({
            child: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                familyId: string;
                dateOfBirth: Date;
                color: string;
            };
        } & {
            id: string;
            childId: string;
            caregiverId: string;
            assignedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        inviteToken: string | null;
        linkExpiresAt: Date | null;
        createdBy: string;
    })[]>;
    findOne(user: AuthUser, familyId: string, caregiverId: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        inviteToken: string | null;
        linkExpiresAt: Date | null;
        createdBy: string;
    }>;
    update(user: AuthUser, familyId: string, caregiverId: string, dto: UpdateCaregiverDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string | null;
        relationship: string | null;
        visibility: import("@prisma/client").$Enums.CaregiverVisibility;
        linkExpiry: import("@prisma/client").$Enums.CaregiverLinkExpiry;
        canViewCalendar: boolean;
        canViewHealthInfo: boolean;
        canViewEmergencyContacts: boolean;
        canViewAllergies: boolean;
        inviteToken: string | null;
        linkExpiresAt: Date | null;
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
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            dateOfBirth: Date;
            color: string;
        }[];
    }>;
}
