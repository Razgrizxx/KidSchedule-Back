import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AssignCustomRoleDto, BulkCreateOrgEventsDto, CreateAnnouncementDto, CreateCustomRoleDto, CreateOrgDto, CreateOrgEntityDto, CreateOrgEventDto, CreateOrgRosterDto, CreateVenueDto, JoinOrgDto, RsvpDto, UpdateCustomRoleDto, UpdateMemberRoleDto, UpdateOrgDto } from './dto/organization.dto';
export declare class OrganizationsService {
    private prisma;
    private mail;
    private config;
    constructor(prisma: PrismaService, mail: MailService, config: ConfigService);
    private generateInviteCode;
    private getMembership;
    assertActiveMember(orgId: string, userId: string): Promise<{
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
    private assertManager;
    private assertCanCreate;
    createEntity(userId: string, dto: CreateOrgEntityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdById: string;
    }>;
    findMyEntities(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdById: string;
    }[]>;
    updateEntity(entityId: string, userId: string, dto: Partial<CreateOrgEntityDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        createdById: string;
    }>;
    deleteEntity(entityId: string, userId: string): Promise<{
        message: string;
    }>;
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
            customRoleId: string | null;
            organizationId: string;
            approvedById: string | null;
            approvedAt: Date | null;
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
        isPublic: boolean;
        entityId: string | null;
        inviteCode: string;
        adminId: string;
    }>;
    updateOrg(orgId: string, userId: string, dto: UpdateOrgDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        isPublic: boolean;
        entityId: string | null;
        inviteCode: string;
        adminId: string;
    }>;
    joinByCode(userId: string, dto: JoinOrgDto): Promise<{
        pendingApproval: boolean;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        name?: string | undefined;
        type?: import("@prisma/client").$Enums.OrgType | undefined;
        description?: string | null | undefined;
        isPublic?: boolean | undefined;
        entityId?: string | null | undefined;
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
        isPublic: boolean;
        entityId: string | null;
        inviteCode: string;
        adminId: string;
    }[]>;
    findOne(orgId: string, userId: string): Promise<{
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
        type: import("@prisma/client").$Enums.OrgType;
        description: string | null;
        isPublic: boolean;
        entityId: string | null;
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
        customRoleId: string | null;
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
        customRoleId: string | null;
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
    }>;
    bulkCreateEvents(orgId: string, userId: string, dto: BulkCreateOrgEventsDto): Promise<{
        created: number;
        events: {
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
    updateVenue(orgId: string, venueId: string, userId: string, dto: CreateVenueDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        address: string | null;
        mapUrl: string | null;
        organizationId: string;
    }>;
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
        title: string;
        content: string;
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
        title: string;
        content: string;
        pinned: boolean;
        organizationId: string;
        authorId: string;
    })[]>;
    deleteAnnouncement(orgId: string, announcementId: string, userId: string): Promise<{
        message: string;
    }>;
    listCustomRoles(orgId: string, userId: string): Promise<({
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
    createCustomRole(orgId: string, userId: string, dto: CreateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
        organizationId: string;
    }>;
    updateCustomRole(orgId: string, roleId: string, userId: string, dto: UpdateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
        organizationId: string;
    }>;
    deleteCustomRole(orgId: string, roleId: string, userId: string): Promise<{
        message: string;
    }>;
    assignCustomRole(orgId: string, targetUserId: string, adminId: string, dto: AssignCustomRoleDto): Promise<{
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
    getMembersChildren(orgId: string, userId: string): Promise<{
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
    getRoster(orgId: string, userId: string): Promise<({
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
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
        orgId: string;
        linkedUserId: string | null;
    })[]>;
    addToRoster(orgId: string, userId: string, dto: CreateOrgRosterDto): Promise<{
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
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
        orgId: string;
        linkedUserId: string | null;
    }>;
    removeFromRoster(orgId: string, rosterId: string, userId: string): Promise<{
        message: string;
    }>;
    sendRosterInvite(orgId: string, rosterId: string, userId: string): Promise<{
        message: string;
    }>;
    getPortalData(token: string): Promise<{
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
    generateIcs(orgId: string, userId: string): Promise<string>;
}
