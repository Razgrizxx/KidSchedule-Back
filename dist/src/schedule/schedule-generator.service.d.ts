import { CustodyPattern } from '@prisma/client';
export interface DayAssignment {
    date: Date;
    custodianId: string;
}
export declare class ScheduleGeneratorService {
    generate(pattern: CustodyPattern, startDate: Date, durationDays: number, parent1Id: string, parent2Id: string): DayAssignment[];
    private getCustodian;
    private patternCycle;
    private getISOWeekNumber;
}
