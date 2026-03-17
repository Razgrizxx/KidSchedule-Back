import { CustodyPattern } from '@prisma/client';
export declare class CreateScheduleDto {
    childId: string;
    name: string;
    pattern: CustodyPattern;
    startDate: string;
    durationDays?: number;
    exchangeDay?: number;
    exchangeTime?: string;
    parent1Id?: string;
    parent2Id?: string;
}
