import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/schedule.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class ScheduleController {
    private scheduleService;
    constructor(scheduleService: ScheduleService);
    create(user: AuthUser, familyId: string, dto: CreateScheduleDto): Promise<{
        schedule: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            familyId: string;
            childId: string;
            pattern: import("@prisma/client").$Enums.CustodyPattern;
            startDate: Date;
            durationDays: number;
            exchangeDay: number | null;
            exchangeTime: string | null;
            parent1Id: string | null;
            parent2Id: string | null;
            isActive: boolean;
        };
        eventsGenerated: number;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<({
        child: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            dateOfBirth: Date;
            color: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        pattern: import("@prisma/client").$Enums.CustodyPattern;
        startDate: Date;
        durationDays: number;
        exchangeDay: number | null;
        exchangeTime: string | null;
        parent1Id: string | null;
        parent2Id: string | null;
        isActive: boolean;
    })[]>;
    getCalendar(user: AuthUser, familyId: string, year: number, month: number): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        scheduleId: string;
        date: Date;
        custodianId: string;
        isOverride: boolean;
        googleEventId: string | null;
        outlookEventId: string | null;
    })[]>;
    overrideDay(user: AuthUser, familyId: string, scheduleId: string, body: {
        date: string;
        custodianId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        scheduleId: string;
        date: Date;
        custodianId: string;
        isOverride: boolean;
        googleEventId: string | null;
        outlookEventId: string | null;
    }>;
}
