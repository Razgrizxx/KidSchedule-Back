import { OrganizationsService } from './organizations.service';
export declare class PublicOrgController {
    private orgsService;
    constructor(orgsService: OrganizationsService);
    getPublicCalendar(id: string): Promise<{
        org: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        events: ({
            venue: {
                id: string;
                organizationId: string;
                name: string;
                createdAt: Date;
                address: string | null;
                mapUrl: string | null;
                notes: string | null;
            } | null;
        } & {
            id: string;
            organizationId: string;
            type: import("@prisma/client").$Enums.EventType;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            notes: string | null;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            maxCapacity: number | null;
            venueId: string | null;
        })[];
    }>;
    getPortal(token: string): Promise<{
        childName: string;
        org: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        events: ({
            venue: {
                id: string;
                organizationId: string;
                name: string;
                createdAt: Date;
                address: string | null;
                mapUrl: string | null;
                notes: string | null;
            } | null;
        } & {
            id: string;
            organizationId: string;
            type: import("@prisma/client").$Enums.EventType;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            notes: string | null;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            maxCapacity: number | null;
            venueId: string | null;
        })[];
    }>;
}
