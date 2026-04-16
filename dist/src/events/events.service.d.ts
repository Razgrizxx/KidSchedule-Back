import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { BulkImportDto, CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsService {
    private prisma;
    private familyService;
    private eventEmitter;
    private notifications;
    private audit;
    private readonly openai;
    constructor(prisma: PrismaService, familyService: FamilyService, eventEmitter: EventEmitter2, notifications: NotificationsService, audit: AuditService);
    create(familyId: string, userId: string, dto: CreateEventDto): Promise<{
        children: ({
            child: {
                id: string;
                firstName: string;
                lastName: string;
                color: string;
            };
        } & {
            id: string;
            childId: string;
            eventId: string;
        })[];
        caregiver: {
            id: string;
            name: string;
        } | null;
        assignedTo: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        repeat: import("@prisma/client").$Enums.RepeatPattern;
        familyId: string;
        visibility: import("@prisma/client").$Enums.EventVisibility;
        createdBy: string;
        caregiverId: string | null;
        notes: string | null;
        type: import("@prisma/client").$Enums.EventType;
        googleEventId: string | null;
        outlookEventId: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        assignedToId: string | null;
    }>;
    findAll(familyId: string, userId: string, month?: string): Promise<({
        children: ({
            child: {
                id: string;
                firstName: string;
                lastName: string;
                color: string;
            };
        } & {
            id: string;
            childId: string;
            eventId: string;
        })[];
        caregiver: {
            id: string;
            name: string;
        } | null;
        assignedTo: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        repeat: import("@prisma/client").$Enums.RepeatPattern;
        familyId: string;
        visibility: import("@prisma/client").$Enums.EventVisibility;
        createdBy: string;
        caregiverId: string | null;
        notes: string | null;
        type: import("@prisma/client").$Enums.EventType;
        googleEventId: string | null;
        outlookEventId: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        assignedToId: string | null;
    })[]>;
    update(familyId: string, eventId: string, userId: string, dto: UpdateEventDto): Promise<{
        children: ({
            child: {
                id: string;
                firstName: string;
                lastName: string;
                color: string;
            };
        } & {
            id: string;
            childId: string;
            eventId: string;
        })[];
        assignedTo: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        repeat: import("@prisma/client").$Enums.RepeatPattern;
        familyId: string;
        visibility: import("@prisma/client").$Enums.EventVisibility;
        createdBy: string;
        caregiverId: string | null;
        notes: string | null;
        type: import("@prisma/client").$Enums.EventType;
        googleEventId: string | null;
        outlookEventId: string | null;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        assignedToId: string | null;
    }>;
    getHolidays(familyId: string, userId: string, year: number, country?: string): Promise<import("./holidays.data").HolidayEntry[]>;
    bulkCreate(familyId: string, userId: string, dto: BulkImportDto): Promise<{
        created: number;
        skipped: number;
    }>;
    extractFromImage(familyId: string, userId: string, file: Express.Multer.File): Promise<any[]>;
    remove(familyId: string, eventId: string, userId: string): Promise<{
        message: string;
    }>;
}
