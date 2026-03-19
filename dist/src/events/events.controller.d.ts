import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    create(user: AuthUser, familyId: string, dto: CreateEventDto): Promise<{
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
        type: import("@prisma/client").$Enums.EventType;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        assignedToId: string | null;
    }>;
    findAll(user: AuthUser, familyId: string, month?: string): Promise<({
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
        type: import("@prisma/client").$Enums.EventType;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        assignedToId: string | null;
    })[]>;
    update(user: AuthUser, familyId: string, eventId: string, dto: UpdateEventDto): Promise<{
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
        type: import("@prisma/client").$Enums.EventType;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        assignedToId: string | null;
    }>;
    remove(user: AuthUser, familyId: string, eventId: string): Promise<{
        message: string;
    }>;
}
