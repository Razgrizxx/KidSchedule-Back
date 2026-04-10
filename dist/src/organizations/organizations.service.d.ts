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
        joinedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.OrgMemberStatus;
        organizationId: string;
        approvedById: string | null;
        approvedAt: Date | null;
        customRoleId: string | null;
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
    updateOrg(orgId: string, userId: string, dto: UpdateOrgDto): Promise<{
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
    joinByCode(userId: string, dto: JoinOrgDto): Promise<{
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
    findMine(userId: string): Promise<{
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
    findOne(orgId: string, userId: string): Promise<{
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
    leave(orgId: string, userId: string): Promise<{
        message: string;
    }>;
    remove(orgId: string, userId: string): Promise<{
        message: string;
    }>;
    approveMember(orgId: string, targetUserId: string, adminId: string): Promise<{
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
    rejectMember(orgId: string, targetUserId: string, adminId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(orgId: string, targetUserId: string, adminId: string, dto: UpdateMemberRoleDto): Promise<{
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
    private readonly EVENT_INCLUDE;
    createEvent(orgId: string, userId: string, dto: CreateOrgEventDto): Promise<{
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
            organizationId: string;
            createdById: string;
            maxCapacity: number | null;
            venueId: string | null;
        }[];
    }>;
    findEvents(orgId: string, userId: string, month?: string): Promise<({
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
        organizationId: string;
        createdById: string;
        maxCapacity: number | null;
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
        organizationId: string;
        address: string | null;
        mapUrl: string | null;
    }>;
    findVenues(orgId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        organizationId: string;
        address: string | null;
        mapUrl: string | null;
    }[]>;
    updateVenue(orgId: string, venueId: string, userId: string, dto: CreateVenueDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        notes: string | null;
        organizationId: string;
        address: string | null;
        mapUrl: string | null;
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
        content: string;
        title: string;
        organizationId: string;
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
        createdAt: Date;
        updatedAt: Date;
        content: string;
        title: string;
        organizationId: string;
        pinned: boolean;
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
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    })[]>;
    createCustomRole(orgId: string, userId: string, dto: CreateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
    }>;
    updateCustomRole(orgId: string, roleId: string, userId: string, dto: UpdateCustomRoleDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
        canCreateEvents: boolean;
        canCreateAnnouncements: boolean;
        canCreateVenues: boolean;
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
        orgId: string;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
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
        orgId: string;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        linkedChildId: string | null;
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
    generateIcs(orgId: string, userId: string): Promise<string>;
}
