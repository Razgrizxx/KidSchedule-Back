import { TravelService } from './travel.service';
import { CreateTravelNoticeDto } from './dto/travel-notice.dto';
export declare class TravelController {
    private readonly service;
    constructor(service: TravelService);
    create(user: {
        id: string;
    }, familyId: string, dto: CreateTravelNoticeDto): Promise<{
        child: {
            id: string;
            firstName: string;
        } | null;
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.TravelNoticeStatus;
        childId: string | null;
        createdBy: string;
        notes: string | null;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
        rejectedBy: string | null;
        rejectedAt: Date | null;
        linkedEventId: string | null;
        acknowledgedBy: string | null;
    }>;
    findAll(familyId: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        acknowledger: {
            id: string;
            firstName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.TravelNoticeStatus;
        childId: string | null;
        createdBy: string;
        notes: string | null;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
        rejectedBy: string | null;
        rejectedAt: Date | null;
        linkedEventId: string | null;
        acknowledgedBy: string | null;
    })[]>;
    accept(user: {
        id: string;
    }, familyId: string, id: string): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        creator: {
            id: string;
            firstName: string;
        };
        acknowledger: {
            id: string;
            firstName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.TravelNoticeStatus;
        childId: string | null;
        createdBy: string;
        notes: string | null;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
        rejectedBy: string | null;
        rejectedAt: Date | null;
        linkedEventId: string | null;
        acknowledgedBy: string | null;
    }>;
    reject(user: {
        id: string;
    }, familyId: string, id: string): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        creator: {
            id: string;
            firstName: string;
        };
        acknowledger: {
            id: string;
            firstName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.TravelNoticeStatus;
        childId: string | null;
        createdBy: string;
        notes: string | null;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
        rejectedBy: string | null;
        rejectedAt: Date | null;
        linkedEventId: string | null;
        acknowledgedBy: string | null;
    }>;
    remove(user: {
        id: string;
    }, familyId: string, id: string): Promise<void>;
}
