import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateOrgDto, CreateOrgEventDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateMemberRoleDto, UpdateOrgDto } from './dto/organization.dto';
export declare class OrganizationsService {
    private prisma;
    private mail;
    private config;
    constructor(prisma: PrismaService, mail: MailService, config: ConfigService);
    private generateInviteCode;
    private getMembership;
    assertActiveMember(orgId: string, userId: string): Promise<{
        id: string;
        userId: string;
        organizationId: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        joinedAt: Date;
    }>;
    private assertManager;
    create(userId: string, dto: CreateOrgDto): Promise<{
        members: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
            };
        } & {
            id: string;
            userId: string;
            organizationId: string;
            role: import("@prisma/client").$Enums.OrgRole;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            approvedById: string | null;
            approvedAt: Date | null;
            joinedAt: Date;
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
    updateOrg(orgId: string, userId: string, dto: UpdateOrgDto): Promise<{
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
    joinByCode(userId: string, dto: JoinOrgDto): Promise<{
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
    findMine(userId: string): Promise<{
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
    findOne(orgId: string, userId: string): Promise<{
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
            userId: string;
            organizationId: string;
            role: import("@prisma/client").$Enums.OrgRole;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            approvedById: string | null;
            approvedAt: Date | null;
            joinedAt: Date;
        })[];
        venues: {
            id: string;
            organizationId: string;
            name: string;
            createdAt: Date;
            address: string | null;
            mapUrl: string | null;
            notes: string | null;
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
    leave(orgId: string, userId: string): Promise<{
        message: string;
    }>;
    remove(orgId: string, userId: string): Promise<{
        message: string;
    }>;
    approveMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        id: string;
        userId: string;
        organizationId: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        joinedAt: Date;
    }>;
    rejectMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(orgId: string, targetUserId: string, adminId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        userId: string;
        organizationId: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        joinedAt: Date;
    }>;
    removeMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        message: string;
    }>;
    findDirectory(orgId: string, userId: string, search?: string): Promise<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        organizationId: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        joinedAt: Date;
    })[]>;
    private readonly EVENT_INCLUDE;
    createEvent(orgId: string, userId: string, dto: CreateOrgEventDto): Promise<{
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        _count: {
            rsvps: number;
        };
        venue: {
            id: string;
            organizationId: string;
            name: string;
            createdAt: Date;
            address: string | null;
            mapUrl: string | null;
            notes: string | null;
        } | null;
        rsvps: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            orgEventId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        maxCapacity: number | null;
        createdById: string;
        venueId: string | null;
    }>;
    bulkCreateEvents(orgId: string, userId: string, dto: BulkCreateOrgEventsDto): Promise<{
        created: number;
        events: {
            id: string;
            organizationId: string;
            type: import("@prisma/client").$Enums.EventType;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            maxCapacity: number | null;
            createdById: string;
            venueId: string | null;
        }[];
    }>;
    findEvents(orgId: string, userId: string, month?: string): Promise<({
        organization: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        };
        _count: {
            rsvps: number;
        };
        venue: {
            id: string;
            organizationId: string;
            name: string;
            createdAt: Date;
            address: string | null;
            mapUrl: string | null;
            notes: string | null;
        } | null;
        rsvps: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            orgEventId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        maxCapacity: number | null;
        createdById: string;
        venueId: string | null;
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
        organizationId: string;
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        maxCapacity: number | null;
        createdById: string;
        venueId: string | null;
    })[]>;
    upsertRsvp(orgId: string, eventId: string, userId: string, dto: RsvpDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.RsvpStatus;
        createdAt: Date;
        updatedAt: Date;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            createdAt: Date;
            updatedAt: Date;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            createdAt: Date;
            updatedAt: Date;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            createdAt: Date;
            updatedAt: Date;
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
            userId: string;
            status: import("@prisma/client").$Enums.RsvpStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            orgEventId: string;
        }) | null;
    }>;
    createVenue(orgId: string, userId: string, dto: CreateVenueDto): Promise<{
        id: string;
        organizationId: string;
        name: string;
        createdAt: Date;
        address: string | null;
        mapUrl: string | null;
        notes: string | null;
    }>;
    findVenues(orgId: string, userId: string): Promise<{
        id: string;
        organizationId: string;
        name: string;
        createdAt: Date;
        address: string | null;
        mapUrl: string | null;
        notes: string | null;
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
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        pinned: boolean;
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
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        pinned: boolean;
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
            notes: string | null;
            title: string;
            startAt: Date;
            endAt: Date;
            allDay: boolean;
            maxCapacity: number | null;
            createdById: string;
            venueId: string | null;
        })[];
    }>;
    generateIcs(orgId: string, userId: string): Promise<string>;
}
