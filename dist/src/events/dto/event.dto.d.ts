import { EventType, EventVisibility, RepeatPattern } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    type: EventType;
    visibility: EventVisibility;
    startAt: string;
    endAt: string;
    allDay?: boolean;
    repeat: RepeatPattern;
    notes?: string;
    assignedToId?: string;
    childIds: string[];
}
