import type { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { AssignCustomRoleDto, BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateCustomRoleDto, CreateOrgDto, CreateOrgEntityDto, CreateOrgEventDto, CreateOrgRosterDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateCustomRoleDto, UpdateMemberRoleDto, UpdateOrgDto } from './dto/organization.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class OrganizationsController {
    private orgsService;
    constructor(orgsService: OrganizationsService);
    create(user: AuthUser, dto: CreateOrgDto): Promise<{
        entity: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        } | null;
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
            customRoleId: string | null;
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
        entityId: string | null;
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
        entityId?: string | null | undefined;
    }>;
    findMine(user: AuthUser): Promise<{
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        entity: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
        } | null;
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
        entityId: string | null;
    }[]>;
    findMyEntities(user: AuthUser): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }[]>;
    createEntity(user: AuthUser, dto: CreateOrgEntityDto): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    updateEntity(user: AuthUser, entityId: string, dto: CreateOrgEntityDto): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        type: import("@prisma/client").$Enums.EventType;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        organizationId: string;
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
        myCustomRole: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        } | null;
        members: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                avatarUrl: string | null;
            };
            customRole: {
                id: string;
                name: string;
                createdAt: Date;
                organizationId: string;
                canCreateEvents: boolean;
                canCreateAnnouncements: boolean;
                canCreateVenues: boolean;
            } | null;
        } & {
            id: string;
            role: import("@prisma/client").$Enums.OrgRole;
            status: import("@prisma/client").$Enums.OrgMemberStatus;
            approvedAt: Date | null;
            joinedAt: Date;
            userId: string;
            approvedById: string | null;
            customRoleId: string | null;
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
        customRoles: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
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
        entityId: string | null;
    }>;
    update(user: AuthUser, id: string, dto: UpdateOrgDto): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        inviteCode: string;
        isPublic: boolean;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        adminId: string;
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
            firstName: string;
            lastName: string;
            email: string;
            avatarUrl: string | null;
        };
        customRole: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        } | null;
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedAt: Date | null;
        joinedAt: Date;
        userId: string;
        approvedById: string | null;
        customRoleId: string | null;
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
        customRoleId: string | null;
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
        customRoleId: string | null;
        organizationId: string;
    }>;
    removeMember(user: AuthUser, id: string, targetUserId: string): Promise<{
        message: string;
    }>;
    assignCustomRole(user: AuthUser, id: string, targetUserId: string, dto: AssignCustomRoleDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        customRole: {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            canCreateEvents: boolean;
            canCreateAnnouncements: boolean;
            canCreateVenues: boolean;
        } | null;
    } & {
        id: string;
        role: import("@prisma/client").$Enums.OrgRole;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        approvedAt: Date | null;
        joinedAt: Date;
        userId: string;
        approvedById: string | null;
        customRoleId: string | null;
        organizationId: string;
    }>;
    listRoles(user: AuthUser, id: string): Promise<({
        _count: {
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    })[]>;
    createRole(user: AuthUser, id: string, dto: CreateCustomRoleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    }>;
    updateRole(user: AuthUser, id: string, roleId: string, dto: UpdateCustomRoleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
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
        createdById: string;
        organizationId: string;
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
            createdById: string;
            organizationId: string;
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
        createdById: string;
        organizationId: string;
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
    updateVenue(user: AuthUser, id: string, venueId: string, dto: CreateVenueDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        organizationId: string;
        notes: string | null;
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
    getMembersChildren(user: AuthUser, id: string): Promise<{
        parent: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
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
                        firstName: string;
                        lastName: string;
                        email: string;
                    };
                }[];
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            familyId: string;
            dateOfBirth: Date;
            color: string;
        }) | null;
        linkedUser: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        notes: string | null;
        orgId: string;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
        linkedUserId: string | null;
        inviteToken: string | null;
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
            firstName: string;
            lastName: string;
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        notes: string | null;
        orgId: string;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
        linkedUserId: string | null;
        inviteToken: string | null;
    }>;
    removeFromRoster(user: AuthUser, id: string, rosterId: string): Promise<{
        message: string;
    }>;
    sendRosterInvite(user: AuthUser, id: string, rosterId: string): Promise<{
        message: string;
    }>;
    exportIcs(user: AuthUser, id: string, res: Response): Promise<void>;
}
