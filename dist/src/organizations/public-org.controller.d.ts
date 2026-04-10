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
                createdAt: Date;
                name: string;
                notes: string | null;
                organizationId: string;
                address: string | null;
                mapUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.EventType;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            organizationId: string;
            createdById: string;
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
                createdAt: Date;
                name: string;
                notes: string | null;
                organizationId: string;
                address: string | null;
                mapUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.EventType;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            organizationId: string;
            createdById: string;
            maxCapacity: number | null;
            venueId: string | null;
        })[];
    }>;
}
