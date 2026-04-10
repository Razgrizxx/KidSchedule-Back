import { EventsService } from './events.service';
import { BulkImportDto, CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    create(user: AuthUser, familyId: string, dto: CreateEventDto): Promise<{
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
        outlookEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
        assignedToId: string | null;
        caregiverId: string | null;
    }>;
    findAll(user: AuthUser, familyId: string, month?: string): Promise<({
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
        outlookEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
        assignedToId: string | null;
        caregiverId: string | null;
    })[]>;
    update(user: AuthUser, familyId: string, eventId: string, dto: UpdateEventDto): Promise<{
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
        outlookEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
        assignedToId: string | null;
        caregiverId: string | null;
    }>;
    getHolidays(user: AuthUser, familyId: string, yearStr?: string, country?: string): Promise<{
        isTransitionDay: boolean;
        id: string;
        date: string;
        name: string;
        country: "AR" | "US";
        category: "NATIONAL" | "SCHOOL";
    }[]>;
    extractFromImage(user: AuthUser, familyId: string, file: Express.Multer.File): Promise<any[]>;
    bulkCreate(user: AuthUser, familyId: string, dto: BulkImportDto): Promise<{
        created: number;
        skipped: number;
    }>;
    remove(user: AuthUser, familyId: string, eventId: string): Promise<{
        message: string;
    }>;
}
