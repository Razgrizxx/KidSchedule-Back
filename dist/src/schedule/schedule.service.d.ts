import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { ScheduleGeneratorService } from './schedule-generator.service';
import { AuditService } from '../audit/audit.service';
import { CreateScheduleDto } from './dto/schedule.dto';
export declare class ScheduleService {
    private prisma;
    private familyService;
    private generator;
    private audit;
    constructor(prisma: PrismaService, familyService: FamilyService, generator: ScheduleGeneratorService, audit: AuditService);
    create(familyId: string, userId: string, dto: CreateScheduleDto): Promise<{
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
    findAll(familyId: string, userId: string): Promise<({
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
    getCalendar(familyId: string, userId: string, year: number, month: number): Promise<({
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
    overrideDay(familyId: string, scheduleId: string, date: string, custodianId: string, userId: string): Promise<{
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
