"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const schedule_generator_service_1 = require("./schedule-generator.service");
let ScheduleService = class ScheduleService {
    prisma;
    familyService;
    generator;
    constructor(prisma, familyService, generator) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.generator = generator;
    }
    async create(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const child = await this.prisma.child.findFirst({
            where: { id: dto.childId, familyId },
        });
        if (!child)
            throw new common_1.NotFoundException('Child not found in this family');
        const parent1Id = dto.parent1Id ?? userId;
        const parent2Id = dto.parent2Id;
        if (!parent2Id)
            throw new common_1.BadRequestException('parent2Id is required');
        const familySettings = await this.prisma.familySettings.findUnique({
            where: { familyId },
        });
        const WEEKDAY = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
        };
        const exchangeDay = dto.exchangeDay ??
            (familySettings?.transitionDay != null
                ? (WEEKDAY[familySettings.transitionDay] ?? undefined)
                : undefined);
        const exchangeTime = dto.exchangeTime ?? familySettings?.transitionTime ?? undefined;
        await this.prisma.schedule.updateMany({
            where: { childId: dto.childId, familyId, isActive: true },
            data: { isActive: false },
        });
        const durationDays = dto.durationDays ?? 365;
        const schedule = await this.prisma.schedule.create({
            data: {
                familyId,
                childId: dto.childId,
                name: dto.name,
                pattern: dto.pattern,
                startDate: new Date(dto.startDate),
                durationDays,
                exchangeDay,
                exchangeTime,
                parent1Id,
                parent2Id,
            },
        });
        const assignments = this.generator.generate(dto.pattern, new Date(dto.startDate), durationDays, parent1Id, parent2Id);
        const chunkSize = 100;
        for (let i = 0; i < assignments.length; i += chunkSize) {
            const chunk = assignments.slice(i, i + chunkSize);
            await this.prisma.custodyEvent.createMany({
                data: chunk.map((a) => ({
                    scheduleId: schedule.id,
                    childId: dto.childId,
                    familyId,
                    date: a.date,
                    custodianId: a.custodianId,
                })),
                skipDuplicates: true,
            });
        }
        return { schedule, eventsGenerated: assignments.length };
    }
    async findAll(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.schedule.findMany({
            where: { familyId },
            include: { child: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCalendar(familyId, userId, year, month) {
        await this.familyService.assertMember(familyId, userId);
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 0);
        const events = await this.prisma.custodyEvent.findMany({
            where: {
                familyId,
                date: { gte: from, lte: to },
            },
            include: {
                child: { select: { id: true, firstName: true, color: true } },
            },
            orderBy: { date: 'asc' },
        });
        return events;
    }
    async overrideDay(familyId, scheduleId, date, custodianId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const dayDate = new Date(date);
        return this.prisma.custodyEvent.upsert({
            where: { scheduleId_date: { scheduleId, date: dayDate } },
            update: { custodianId, isOverride: true },
            create: {
                scheduleId,
                childId: (await this.prisma.schedule.findUnique({
                    where: { id: scheduleId },
                })).childId,
                familyId,
                date: dayDate,
                custodianId,
                isOverride: true,
            },
        });
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        schedule_generator_service_1.ScheduleGeneratorService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map