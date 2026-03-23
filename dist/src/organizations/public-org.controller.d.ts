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
                name: string;
                createdAt: Date;
                organizationId: string;
                notes: string | null;
                address: string | null;
                mapUrl: string | null;
            } | null;
        } & {
            id: string;
            type: import("@prisma/client").$Enums.EventType;
            createdAt: Date;
            updatedAt: Date;
            startAt: Date;
            organizationId: string;
            createdById: string;
            title: string;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            venueId: string | null;
            maxCapacity: number | null;
        })[];
    }>;
}
