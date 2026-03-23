import type { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateOrgDto, CreateOrgEventDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateMemberRoleDto } from './dto/organization.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class OrganizationsController {
    private orgsService;
    constructor(orgsService: OrganizationsService);
    create(user: AuthUser, dto: CreateOrgDto): Promise<{
        members: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            approvedAt: Date | null;
            joinedAt: Date;
            userId: string;
            approvedById: string | null;
            organizationId: string;
        })[];
    } & {
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        inviteCode: string;
        isPublic: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        adminId: string;
    }>;
    join(user: AuthUser, dto: JoinOrgDto): Promise<{
        pendingApproval: boolean;
        id?: string | undefined;
        name?: string | undefined;
        type?: import("@prisma/client").$Enums.OrgType | undefined;
        inviteCode?: string | undefined;
        isPublic?: boolean | undefined;
        description?: string | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        adminId?: string | undefined;
    }>;
    findMine(user: AuthUser): Promise<{
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        _count: {
            members: number;
            events: number;
        };
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        inviteCode: string;
        isPublic: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        adminId: string;
    }[]>;
    findAllMyEvents(user: AuthUser, month?: string): Promise<({
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
    } & {
        id: string;
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        createdById: string;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        venueId: string | null;
        maxCapacity: number | null;
    })[]>;
    findOne(user: AuthUser, id: string): Promise<{
        myRole: import("@prisma/client").$Enums.OrgRole;
        myStatus: import("@prisma/client").$Enums.OrgMemberStatus;
        members: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            approvedAt: Date | null;
            joinedAt: Date;
            userId: string;
            approvedById: string | null;
            organizationId: string;
        })[];
        venues: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            notes: string | null;
            address: string | null;
            mapUrl: string | null;
        }[];
        _count: {
            events: number;
            announcements: number;
        };
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        inviteCode: string;
        isPublic: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        adminId: string;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    leave(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    directory(user: AuthUser, id: string, search?: string): Promise<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedAt: Date | null;
        joinedAt: Date;
        userId: string;
        approvedById: string | null;
        organizationId: string;
    })[]>;
    approveMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedAt: Date | null;
        joinedAt: Date;
        userId: string;
        approvedById: string | null;
        organizationId: string;
    }>;
    rejectMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(user: AuthUser, id: string, targetUserId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedAt: Date | null;
        joinedAt: Date;
        userId: string;
        approvedById: string | null;
        organizationId: string;
    }>;
    removeMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        message: string;
    }>;
    createEvent(user: AuthUser, id: string, dto: CreateOrgEventDto): Promise<{
        _count: {
            rsvps: number;
        };
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        venue: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            notes: string | null;
            address: string | null;
            mapUrl: string | null;
        } | null;
        rsvps: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RsvpStatus;
            userId: string;
            notes: string | null;
            orgEventId: string;
        })[];
    } & {
        id: string;
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        createdById: string;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        venueId: string | null;
        maxCapacity: number | null;
    }>;
    bulkCreateEvents(user: AuthUser, id: string, dto: BulkCreateOrgEventsDto): Promise<{
        created: number;
        events: {
            id: string;
            type: import("@prisma/client").$Enums.EventType;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            createdById: string;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            venueId: string | null;
            maxCapacity: number | null;
        }[];
    }>;
    findEvents(user: AuthUser, id: string, month?: string): Promise<({
        _count: {
            rsvps: number;
        };
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        venue: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            notes: string | null;
            address: string | null;
            mapUrl: string | null;
        } | null;
        rsvps: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RsvpStatus;
            userId: string;
            notes: string | null;
            orgEventId: string;
        })[];
    } & {
        id: string;
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        createdById: string;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        venueId: string | null;
        maxCapacity: number | null;
    })[]>;
    deleteEvent(user: AuthUser, id: string, eventId: string): Promise<{
        message: string;
    }>;
    upsertRsvp(user: AuthUser, id: string, eventId: string, dto: RsvpDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.RsvpStatus;
        userId: string;
        notes: string | null;
        orgEventId: string;
    }>;
    getEventRsvps(user: AuthUser, id: string, eventId: string): Promise<{
        yes: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RsvpStatus;
            userId: string;
            notes: string | null;
            orgEventId: string;
        })[];
        no: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RsvpStatus;
            userId: string;
            notes: string | null;
            orgEventId: string;
        })[];
        maybe: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RsvpStatus;
            userId: string;
            notes: string | null;
            orgEventId: string;
        })[];
        myRsvp: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RsvpStatus;
            userId: string;
            notes: string | null;
            orgEventId: string;
        }) | null;
    }>;
    createVenue(user: AuthUser, id: string, dto: CreateVenueDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        organizationId: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
    }>;
    findVenues(user: AuthUser, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        organizationId: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
    }[]>;
    deleteVenue(user: AuthUser, id: string, venueId: string): Promise<{
        message: string;
    }>;
    createAnnouncement(user: AuthUser, id: string, dto: CreateAnnouncementDto): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        title: string;
        content: string;
        pinned: boolean;
        authorId: string;
    }>;
    findAnnouncements(user: AuthUser, id: string): Promise<({
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        title: string;
        content: string;
        pinned: boolean;
        authorId: string;
    })[]>;
    deleteAnnouncement(user: AuthUser, id: string, announcementId: string): Promise<{
        message: string;
    }>;
    exportIcs(user: AuthUser, id: string, res: Response): Promise<void>;
}
