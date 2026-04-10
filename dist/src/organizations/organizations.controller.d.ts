import type { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { AssignCustomRoleDto, BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateCustomRoleDto, CreateOrgDto, CreateOrgEntityDto, CreateOrgEventDto, CreateOrgRosterDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateCustomRoleDto, UpdateMemberRoleDto, UpdateOrgDto } from './dto/organization.dto';
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
            joinedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            organizationId: string;
            approvedById: string | null;
            approvedAt: Date | null;
            customRoleId: string | null;
        })[];
        entity: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        inviteCode: string;
        adminId: string;
        isPublic: boolean;
        entityId: string | null;
    }>;
    join(user: AuthUser, dto: JoinOrgDto): Promise<{
        pendingApproval: boolean;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        name?: string | undefined;
        type?: import("@prisma/client").$Enums.OrgType | undefined;
        description?: string | null | undefined;
        inviteCode?: string | undefined;
        adminId?: string | undefined;
        isPublic?: boolean | undefined;
        entityId?: string | null | undefined;
    }>;
    findMine(user: AuthUser): Promise<{
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        _count: {
            events: number;
            members: number;
        };
        entity: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        inviteCode: string;
        adminId: string;
        isPublic: boolean;
        entityId: string | null;
    }[]>;
    findMyEntities(user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdById: string;
    }[]>;
    createEntity(user: AuthUser, dto: CreateOrgEntityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdById: string;
    }>;
    updateEntity(user: AuthUser, entityId: string, dto: CreateOrgEntityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdById: string;
    }>;
    deleteEntity(user: AuthUser, entityId: string): Promise<{
        message: string;
    }>;
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
        organizationId: string;
        createdById: string;
        maxCapacity: number | null;
        venueId: string | null;
    })[]>;
    findOne(user: AuthUser, id: string): Promise<{
        myRole: import("@prisma/client").$Enums.OrgRole;
        myStatus: import("@prisma/client").$Enums.OrgMemberStatus;
        myCustomRole: {
            id: string;
            createdAt: Date;
            name: string;
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        } | null;
        _count: {
            events: number;
            announcements: number;
        };
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
                organizationId: string;
                canCreateEvents: boolean;
                canCreateAnnouncements: boolean;
                canCreateVenues: boolean;
            } | null;
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            joinedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            organizationId: string;
            approvedById: string | null;
            approvedAt: Date | null;
            customRoleId: string | null;
        })[];
        venues: {
            id: string;
            createdAt: Date;
            name: string;
            notes: string | null;
            organizationId: string;
            address: string | null;
            mapUrl: string | null;
        }[];
        customRoles: {
            id: string;
            createdAt: Date;
            name: string;
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        inviteCode: string;
        adminId: string;
        isPublic: boolean;
        entityId: string | null;
    }>;
    update(user: AuthUser, id: string, dto: UpdateOrgDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        inviteCode: string;
        adminId: string;
        isPublic: boolean;
        entityId: string | null;
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
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        } | null;
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        joinedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
        customRoleId: string | null;
    })[]>;
    approveMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        joinedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
        customRoleId: string | null;
    }>;
    rejectMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(user: AuthUser, id: string, targetUserId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        joinedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
        customRoleId: string | null;
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
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        } | null;
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        joinedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
        customRoleId: string | null;
    }>;
    listRoles(user: AuthUser, id: string): Promise<({
        _count: {
            members: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    })[]>;
    createRole(user: AuthUser, id: string, dto: CreateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    }>;
    updateRole(user: AuthUser, id: string, roleId: string, dto: UpdateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    }>;
    deleteRole(user: AuthUser, id: string, roleId: string): Promise<{
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
            createdAt: Date;
            name: string;
            notes: string | null;
            organizationId: string;
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
        organizationId: string;
        createdById: string;
        maxCapacity: number | null;
        venueId: string | null;
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
            organizationId: string;
            createdById: string;
            maxCapacity: number | null;
            venueId: string | null;
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
            createdAt: Date;
            name: string;
            notes: string | null;
            organizationId: string;
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
        organizationId: string;
        createdById: string;
        maxCapacity: number | null;
        venueId: string | null;
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
        organizationId: string;
        address: string | null;
        mapUrl: string | null;
    }>;
    findVenues(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        organizationId: string;
        address: string | null;
        mapUrl: string | null;
    }[]>;
    updateVenue(user: AuthUser, id: string, venueId: string, dto: CreateVenueDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        organizationId: string;
        address: string | null;
        mapUrl: string | null;
    }>;
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
        organizationId: string;
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
        content: string;
        title: string;
        organizationId: string;
        pinned: boolean;
        authorId: string;
    })[]>;
    deleteAnnouncement(user: AuthUser, id: string, announcementId: string): Promise<{
        message: string;
    }>;
    getMembersChildren(user: AuthUser, id: string): Promise<{
        parent: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        child: {
            id: string;
            firstName: string;
            lastName: string;
            color: string;
        };
    }[]>;
    getRoster(user: AuthUser, id: string): Promise<({
        linkedChild: ({
            family: {
                members: {
                    user: {
                        id: string;
                        email: string;
                        firstName: string;
                        lastName: string;
                    };
                }[];
            };
        } & {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            dateOfBirth: Date;
            color: string;
        }) | null;
        linkedUser: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        inviteToken: string | null;
        notes: string | null;
        orgId: string;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
        linkedUserId: string | null;
    })[]>;
    addToRoster(user: AuthUser, id: string, dto: CreateOrgRosterDto): Promise<{
        linkedChild: {
            id: string;
            firstName: string;
            lastName: string;
            color: string;
        } | null;
        linkedUser: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        inviteToken: string | null;
        notes: string | null;
        orgId: string;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
        linkedUserId: string | null;
    }>;
    removeFromRoster(user: AuthUser, id: string, rosterId: string): Promise<{
        message: string;
    }>;
    sendRosterInvite(user: AuthUser, id: string, rosterId: string): Promise<{
        message: string;
    }>;
    exportIcs(user: AuthUser, id: string, res: Response): Promise<void>;
}
