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
        }[];
        contacts: any[];
    }>;
}
