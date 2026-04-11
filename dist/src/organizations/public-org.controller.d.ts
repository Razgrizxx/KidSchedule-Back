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
                address: string | null;
                mapUrl: string | null;
                organizationId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            type: import("@prisma/client").$Enums.EventType;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            venueId: string | null;
            maxCapacity: number | null;
            organizationId: string;
            createdById: string;
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
                address: string | null;
                mapUrl: string | null;
                organizationId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            type: import("@prisma/client").$Enums.EventType;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            venueId: string | null;
            maxCapacity: number | null;
            organizationId: string;
            createdById: string;
        })[];
    }>;
}
