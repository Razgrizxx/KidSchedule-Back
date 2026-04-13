import { PrismaService } from '../prisma/prisma.service';
export declare class CaregiverPortalService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(token: string): Promise<{
        name: string;
        familyId: string | null;
        permissions: {
            canViewCalendar: boolean;
            canViewHealthInfo: boolean;
            canViewEmergencyContacts: boolean;
            canViewAllergies: boolean;
        };
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
        custodyEvents: {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string;
            scheduleId: string;
            date: Date;
            custodianId: string;
            isOverride: boolean;
            googleEventId: string | null;
            outlookEventId: string | null;
        }[];
        contacts: any[];
        assignedEvents: ({
            children: ({
                child: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    color: string;
                };
            } & {
                id: string;
                childId: string;
                eventId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            repeat: import("@prisma/client").$Enums.RepeatPattern;
            familyId: string;
            visibility: import("@prisma/client").$Enums.EventVisibility;
            createdBy: string;
            caregiverId: string | null;
            notes: string | null;
            type: import("@prisma/client").$Enums.EventType;
            googleEventId: string | null;
            outlookEventId: string | null;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            assignedToId: string | null;
        })[];
    }>;
}
