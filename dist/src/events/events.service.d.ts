import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { BulkImportDto, CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsService {
    private prisma;
    private familyService;
    private eventEmitter;
    constructor(prisma: PrismaService, familyService: FamilyService, eventEmitter: EventEmitter2);
    create(familyId: string, userId: string, dto: CreateEventDto): Promise<{
        assignedTo: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        caregiver: {
            id: string;
            name: string;
        } | null;
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
    } & {
        id: string;
        title: string;
        type: import("@prisma/client").$Enums.EventType;
        visibility: import("@prisma/client").$Enums.EventVisibility;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        repeat: import("@prisma/client").$Enums.RepeatPattern;
        notes: string | null;
        googleEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
        assignedToId: string | null;
        caregiverId: string | null;
    }>;
    findAll(familyId: string, userId: string, month?: string): Promise<({
        assignedTo: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        caregiver: {
            id: string;
            name: string;
        } | null;
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
    } & {
        id: string;
        title: string;
        type: import("@prisma/client").$Enums.EventType;
        visibility: import("@prisma/client").$Enums.EventVisibility;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        repeat: import("@prisma/client").$Enums.RepeatPattern;
        notes: string | null;
        googleEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
        assignedToId: string | null;
        caregiverId: string | null;
    })[]>;
    update(familyId: string, eventId: string, userId: string, dto: UpdateEventDto): Promise<{
        assignedTo: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
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
    } & {
        id: string;
        title: string;
        type: import("@prisma/client").$Enums.EventType;
        visibility: import("@prisma/client").$Enums.EventVisibility;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        repeat: import("@prisma/client").$Enums.RepeatPattern;
        notes: string | null;
        googleEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
        assignedToId: string | null;
        caregiverId: string | null;
    }>;
    getHolidays(familyId: string, userId: string, year: number, country?: string): Promise<{
        isTransitionDay: boolean;
        id: string;
        date: string;
        name: string;
        country: "AR" | "US";
        category: "NATIONAL" | "SCHOOL";
    }[]>;
    bulkCreate(familyId: string, userId: string, dto: BulkImportDto): Promise<{
        created: number;
        skipped: number;
    }>;
    remove(familyId: string, eventId: string, userId: string): Promise<{
        message: string;
    }>;
}
