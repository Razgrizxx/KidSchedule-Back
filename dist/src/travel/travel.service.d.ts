import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateTravelNoticeDto } from './dto/travel-notice.dto';
export declare class TravelService {
    private prisma;
    private notifications;
    private audit;
    constructor(prisma: PrismaService, notifications: NotificationsService, audit: AuditService);
    create(familyId: string, userId: string, dto: CreateTravelNoticeDto): Promise<{
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
        childId: string | null;
        notes: string | null;
        createdBy: string;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
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
        childId: string | null;
        notes: string | null;
        createdBy: string;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
    })[]>;
    acknowledge(familyId: string, id: string, userId: string): Promise<{
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
        childId: string | null;
        notes: string | null;
        createdBy: string;
        destination: string;
        departureDate: Date;
        returnDate: Date;
        contactPhone: string | null;
        contactEmail: string | null;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
    }>;
    remove(familyId: string, id: string, userId: string): Promise<void>;
}
