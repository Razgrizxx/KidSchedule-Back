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
    findAll(familyId: string, userId: string): Promise<({
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
    findOne(familyId: string, caregiverId: string, userId: string): Promise<{
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
    update(familyId: string, caregiverId: string, userId: string, dto: UpdateCaregiverDto): Promise<{
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
    private sendCaregiverEmail;
    private calculateExpiry;
}
