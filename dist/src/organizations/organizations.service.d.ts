import { PrismaService } from '../prisma/prisma.service';
import { BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateOrgDto, CreateOrgEventDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateMemberRoleDto } from './dto/organization.dto';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateInviteCode;
    private getMembership;
    assertActiveMember(orgId: string, userId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    }>;
    private assertManager;
    create(userId: string, dto: CreateOrgDto): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            userId: string;
            joinedAt: Date;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            organizationId: string;
            approvedById: string | null;
            approvedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isPublic: boolean;
        inviteCode: string;
        adminId: string;
    }>;
    joinByCode(userId: string, dto: JoinOrgDto): Promise<{
        pendingApproval: boolean;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        name?: string | undefined;
        description?: string | null | undefined;
        type?: import("@prisma/client").$Enums.OrgType | undefined;
        isPublic?: boolean | undefined;
        inviteCode?: string | undefined;
        adminId?: string | undefined;
    }>;
    findMine(userId: string): Promise<{
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        _count: {
            members: number;
            events: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isPublic: boolean;
        inviteCode: string;
        adminId: string;
    }[]>;
    findOne(orgId: string, userId: string): Promise<{
        myRole: import("@prisma/client").$Enums.OrgRole;
        myStatus: import("@prisma/client").$Enums.OrgMemberStatus;
        members: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            userId: string;
            joinedAt: Date;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            organizationId: string;
            approvedById: string | null;
            approvedAt: Date | null;
        })[];
        _count: {
            events: number;
            announcements: number;
        };
        venues: {
            id: string;
            createdAt: Date;
            name: string;
            notes: string | null;
            address: string | null;
            mapUrl: string | null;
            organizationId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isPublic: boolean;
        inviteCode: string;
        adminId: string;
    }>;
    leave(orgId: string, userId: string): Promise<{
        message: string;
    }>;
    remove(orgId: string, userId: string): Promise<{
        message: string;
    }>;
    approveMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    }>;
    rejectMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(orgId: string, targetUserId: string, adminId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    }>;
    removeMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        message: string;
    }>;
    findDirectory(orgId: string, userId: string, search?: string): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    })[]>;
    private readonly EVENT_INCLUDE;
    createEvent(orgId: string, userId: string, dto: CreateOrgEventDto): Promise<{
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        venue: {
            id: string;
            createdAt: Date;
            name: string;
            notes: string | null;
            address: string | null;
            mapUrl: string | null;
            organizationId: string;
        } | null;
        _count: {
            rsvps: number;
        };
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            notes: string | null;
            orgEventId: string;
        })[];
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
        venueId: string | null;
        maxCapacity: number | null;
        organizationId: string;
        createdById: string;
    }>;
    bulkCreateEvents(orgId: string, userId: string, dto: BulkCreateOrgEventsDto): Promise<{
        created: number;
        events: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.EventType;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            venueId: string | null;
            maxCapacity: number | null;
            organizationId: string;
            createdById: string;
        }[];
    }>;
    findEvents(orgId: string, userId: string, month?: string): Promise<({
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        venue: {
            id: string;
            createdAt: Date;
            name: string;
            notes: string | null;
            address: string | null;
            mapUrl: string | null;
            organizationId: string;
        } | null;
        _count: {
            rsvps: number;
        };
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            notes: string | null;
            orgEventId: string;
        })[];
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
        venueId: string | null;
        maxCapacity: number | null;
        organizationId: string;
        createdById: string;
    })[]>;
    deleteEvent(orgId: string, eventId: string, userId: string): Promise<{
        message: string;
    }>;
    findAllMyOrgEvents(userId: string, month?: string): Promise<({
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
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
        venueId: string | null;
        maxCapacity: number | null;
        organizationId: string;
        createdById: string;
    })[]>;
    upsertRsvp(orgId: string, eventId: string, userId: string, dto: RsvpDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.RsvpStatus;
        notes: string | null;
        orgEventId: string;
    }>;
    getEventRsvps(orgId: string, eventId: string, userId: string): Promise<{
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            notes: string | null;
            orgEventId: string;
        }) | null;
    }>;
    createVenue(orgId: string, userId: string, dto: CreateVenueDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
        organizationId: string;
    }>;
    findVenues(orgId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
        organizationId: string;
    }[]>;
    deleteVenue(orgId: string, venueId: string, userId: string): Promise<{
        message: string;
    }>;
    createAnnouncement(orgId: string, userId: string, dto: CreateAnnouncementDto): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        title: string;
        pinned: boolean;
        organizationId: string;
        authorId: string;
    }>;
    findAnnouncements(orgId: string, userId: string): Promise<({
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        title: string;
        pinned: boolean;
        organizationId: string;
        authorId: string;
    })[]>;
    deleteAnnouncement(orgId: string, announcementId: string, userId: string): Promise<{
        message: string;
    }>;
    getPublicCalendar(orgId: string): Promise<{
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
            type: import("@prisma/client").$Enums.EventType;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            notes: string | null;
            venueId: string | null;
            maxCapacity: number | null;
            organizationId: string;
            createdById: string;
        })[];
    }>;
    generateIcs(orgId: string, userId: string): Promise<string>;
}
