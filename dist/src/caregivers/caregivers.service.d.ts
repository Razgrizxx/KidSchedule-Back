import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { MailService } from '../mail/mail.service';
import { CreateCaregiverDto, UpdateCaregiverDto } from './dto/caregiver.dto';
export declare class CaregiversService {
    private prisma;
    private familyService;
    private mail;
    private config;
    constructor(prisma: PrismaService, familyService: FamilyService, mail: MailService, config: ConfigService);
    create(familyId: string, userId: string, dto: CreateCaregiverDto): Promise<{
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
    findAll(familyId: string, userId: string): Promise<({
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
    findOne(familyId: string, caregiverId: string, userId: string): Promise<{
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
    update(familyId: string, caregiverId: string, userId: string, dto: UpdateCaregiverDto): Promise<{
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
    remove(familyId: string, caregiverId: string, userId: string): Promise<{
        message: string;
    }>;
    assignToChild(familyId: string, caregiverId: string, childId: string, userId: string): Promise<{
        id: string;
        childId: string;
        caregiverId: string;
        assignedAt: Date;
    }>;
    unassignFromChild(familyId: string, caregiverId: string, childId: string, userId: string): Promise<{
        message: string;
    }>;
    resolveByToken(token: string): Promise<{
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
    private sendCaregiverEmail;
    private calculateExpiry;
}
