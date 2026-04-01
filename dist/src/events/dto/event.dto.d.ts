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
    caregiverId?: string;
    childIds: string[];
}
declare const UpdateEventDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEventDto>>;
export declare class UpdateEventDto extends UpdateEventDto_base {
}
export declare class BulkImportItemDto {
    title: string;
    date: string;
    type: string;
}
export declare class BulkImportDto {
    events: BulkImportItemDto[];
    childIds: string[];
    visibility: EventVisibility;
}
export {};
