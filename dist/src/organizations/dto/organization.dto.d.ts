import { OrgRole, OrgType, RsvpStatus } from '@prisma/client';
export declare class CreateOrgDto {
    name: string;
    type: OrgType;
    description?: string;
    isPublic?: boolean;
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
export declare class UpdateMemberRoleDto {
    role: OrgRole;
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
