import { OrgRole, OrgType, RsvpStatus } from '@prisma/client';
export declare class CreateOrgEntityDto {
    name: string;
    type: OrgType;
    description?: string;
}
export declare class CreateOrgDto {
    name: string;
    type: OrgType;
    description?: string;
    isPublic?: boolean;
    entityId?: string;
}
export declare class JoinOrgDto {
    inviteCode: string;
}
export declare class CreateOrgEventDto {
    title: string;
    startAt: string;
    endAt: string;
    allDay?: boolean;
    notes?: string;
    venueId?: string;
    maxCapacity?: number;
}
export declare class BulkCreateOrgEventsDto {
    title: string;
    dates: string[];
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    venueId?: string;
    maxCapacity?: number;
}
export declare class UpdateOrgDto {
    isPublic?: boolean;
}
export declare class UpdateMemberRoleDto {
    role: OrgRole;
}
export declare class CreateCustomRoleDto {
    name: string;
    canCreateEvents?: boolean;
    canCreateAnnouncements?: boolean;
    canCreateVenues?: boolean;
}
export declare class UpdateCustomRoleDto {
    name?: string;
    canCreateEvents?: boolean;
    canCreateAnnouncements?: boolean;
    canCreateVenues?: boolean;
}
export declare class AssignCustomRoleDto {
    customRoleId?: string | null;
}
export declare class RsvpDto {
    status: RsvpStatus;
    notes?: string;
}
export declare class CreateVenueDto {
    name: string;
    address?: string;
    mapUrl?: string;
    notes?: string;
}
export declare class CreateAnnouncementDto {
    title: string;
    content: string;
    pinned?: boolean;
}
export declare class CreateOrgRosterDto {
    firstName: string;
    lastName: string;
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
    notes?: string;
    linkedChildId?: string;
}
