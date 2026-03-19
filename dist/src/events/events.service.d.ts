import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsService {
    private prisma;
    private familyService;
    constructor(prisma: PrismaService, familyService: FamilyService);
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
        type: import("@prisma/client").$Enums.EventType;
        title: string;
        startAt: Date;
        endAt: Date;
        allDay: boolean;
        notes: string | null;
        assignedToId: string | null;
    }>;
    remove(familyId: string, eventId: string, userId: string): Promise<{
        message: string;
    }>;
}
