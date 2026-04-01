import type { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { AssignCustomRoleDto, BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateCustomRoleDto, CreateOrgDto, CreateOrgEventDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateCustomRoleDto, UpdateMemberRoleDto, UpdateOrgDto } from './dto/organization.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class OrganizationsController {
    private orgsService;
    constructor(orgsService: OrganizationsService);
    create(user: AuthUser, dto: CreateOrgDto): Promise<{
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
            customRoleId: string | null;
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
    join(user: AuthUser, dto: JoinOrgDto): Promise<{
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
    findMine(user: AuthUser): Promise<{
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
    findAllMyEvents(user: AuthUser, month?: string): Promise<({
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
    findOne(user: AuthUser, id: string): Promise<{
        myRole: import("@prisma/client").$Enums.OrgRole;
        myStatus: import("@prisma/client").$Enums.OrgMemberStatus;
        myCustomRole: {
            id: string;
            createdAt: Date;
            name: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
            organizationId: string;
        } | null;
        members: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
            customRole: {
                id: string;
                createdAt: Date;
                name: string;
                canCreateEvents: boolean;
                canCreateAnnouncements: boolean;
                canCreateVenues: boolean;
                organizationId: string;
            } | null;
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            userId: string;
            joinedAt: Date;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            customRoleId: string | null;
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
        customRoles: {
            id: string;
            createdAt: Date;
            name: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
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
    update(user: AuthUser, id: string, dto: UpdateOrgDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    leave(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    directory(user: AuthUser, id: string, search?: string): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        customRole: {
            id: string;
            createdAt: Date;
            name: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
            organizationId: string;
        } | null;
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        customRoleId: string | null;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    })[]>;
    approveMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        customRoleId: string | null;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    }>;
    rejectMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(user: AuthUser, id: string, targetUserId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        customRoleId: string | null;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    }>;
    removeMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        message: string;
    }>;
    assignCustomRole(user: AuthUser, id: string, targetUserId: string, dto: AssignCustomRoleDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        customRole: {
            id: string;
            createdAt: Date;
            name: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
            organizationId: string;
        } | null;
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        userId: string;
        joinedAt: Date;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        customRoleId: string | null;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
    }>;
    listRoles(user: AuthUser, id: string): Promise<({
        _count: {
            members: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
        organizationId: string;
    })[]>;
    createRole(user: AuthUser, id: string, dto: CreateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
        organizationId: string;
    }>;
    updateRole(user: AuthUser, id: string, roleId: string, dto: UpdateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
        organizationId: string;
    }>;
    deleteRole(user: AuthUser, id: string, roleId: string): Promise<{
        message: string;
    }>;
    createEvent(user: AuthUser, id: string, dto: CreateOrgEventDto): Promise<{
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
    bulkCreateEvents(user: AuthUser, id: string, dto: BulkCreateOrgEventsDto): Promise<{
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
    findEvents(user: AuthUser, id: string, month?: string): Promise<({
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
        userId: string;
        status: import("@prisma/client").$Enums.RsvpStatus;
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
    createVenue(user: AuthUser, id: string, dto: CreateVenueDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
        organizationId: string;
    }>;
    findVenues(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
        organizationId: string;
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
        content: string;
        title: string;
        pinned: boolean;
        organizationId: string;
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
        content: string;
        title: string;
        pinned: boolean;
        organizationId: string;
        authorId: string;
    })[]>;
    deleteAnnouncement(user: AuthUser, id: string, announcementId: string): Promise<{
        message: string;
    }>;
    exportIcs(user: AuthUser, id: string, res: Response): Promise<void>;
}
