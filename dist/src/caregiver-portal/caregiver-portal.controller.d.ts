import { CaregiverPortalService } from './caregiver-portal.service';
export declare class CaregiverPortalController {
    private service;
    constructor(service: CaregiverPortalService);
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
            familyId: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            color: string;
            avatarUrl: string | null;
        }[];
        custodyEvents: {
            id: string;
            familyId: string;
            createdAt: Date;
            childId: string;
            scheduleId: string;
            date: Date;
            custodianId: string;
            isOverride: boolean;
            googleEventId: string | null;
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
            familyId: string;
            createdBy: string;
            visibility: import("@prisma/client").$Enums.EventVisibility;
            createdAt: Date;
            updatedAt: Date;
            repeat: import("@prisma/client").$Enums.RepeatPattern;
            caregiverId: string | null;
            googleEventId: string | null;
            title: string;
            type: import("@prisma/client").$Enums.EventType;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            assignedToId: string | null;
        })[];
    }>;
}
