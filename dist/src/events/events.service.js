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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const holidays_data_1 = require("./holidays.data");
let EventsService = class EventsService {
    prisma;
    familyService;
    eventEmitter;
    constructor(prisma, familyService, eventEmitter) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.eventEmitter = eventEmitter;
    }
    async create(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const { childIds, ...rest } = dto;
        const event = await this.prisma.event.create({
            data: {
                familyId,
                createdBy: userId,
                ...rest,
                startAt: new Date(dto.startAt),
                endAt: new Date(dto.endAt),
                children: {
                    create: childIds.map((childId) => ({ childId })),
                },
            },
            include: {
                children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                caregiver: { select: { id: true, name: true } },
            },
        });
        this.eventEmitter.emit('calendar.event.upsert', {
            eventId: event.id,
            userId,
        });
        return event;
    }
    async findAll(familyId, userId, month) {
        await this.familyService.assertMember(familyId, userId);
        const where = { familyId };
        if (month) {
            const [y, m] = month.split('-').map(Number);
            const start = new Date(Date.UTC(y, m - 1, 1));
            const end = new Date(Date.UTC(y, m, 1));
            where.startAt = { gte: start, lt: end };
        }
        return this.prisma.event.findMany({
            where,
            orderBy: { startAt: 'asc' },
            include: {
                children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                caregiver: { select: { id: true, name: true } },
            },
        });
    }
    async update(familyId, eventId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const { childIds, startAt, endAt, ...rest } = dto;
        const event = await this.prisma.$transaction(async (tx) => {
            if (childIds !== undefined) {
                await tx.eventChild.deleteMany({ where: { eventId } });
                await tx.eventChild.createMany({
                    data: childIds.map((childId) => ({ eventId, childId })),
                });
            }
            return tx.event.update({
                where: { id: eventId, familyId },
                data: {
                    ...rest,
                    ...(startAt && { startAt: new Date(startAt) }),
                    ...(endAt && { endAt: new Date(endAt) }),
                },
                include: {
                    children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                },
            });
        });
        this.eventEmitter.emit('calendar.event.upsert', {
            eventId: event.id,
            userId,
        });
        return event;
    }
    async getHolidays(familyId, userId, year, country) {
        await this.familyService.assertMember(familyId, userId);
        const settings = await this.prisma.familySettings.findUnique({ where: { familyId } });
        const transitionDay = settings?.transitionDay ?? 'MONDAY';
        const DAY_MAP = {
            SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
        };
        const transitionDayNum = DAY_MAP[transitionDay] ?? 1;
        const all = (0, holidays_data_1.getHolidaysForYear)(year);
        const filtered = country ? all.filter((h) => h.country === country) : all;
        return filtered.map((h) => ({
            ...h,
            isTransitionDay: new Date(h.date + 'T12:00:00Z').getDay() === transitionDayNum,
        }));
    }
    async bulkCreate(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        let created = 0;
        let skipped = 0;
        for (const item of dto.events) {
            const hasTime = !!item.startTime;
            const startAt = hasTime
                ? new Date(`${item.date}T${item.startTime}:00.000Z`)
                : new Date(item.date + 'T00:00:00.000Z');
            const endAt = hasTime
                ? new Date(`${item.date}T${item.endTime ?? item.startTime}:00.000Z`)
                : new Date(item.date + 'T23:59:59.000Z');
            const dayStart = new Date(item.date + 'T00:00:00.000Z');
            const dayEnd = new Date(item.date + 'T23:59:59.000Z');
            const existing = await this.prisma.event.findFirst({
                where: { familyId, title: item.title, startAt: { gte: dayStart, lte: dayEnd } },
            });
            if (existing) {
                skipped++;
                continue;
            }
            await this.prisma.event.create({
                data: {
                    familyId,
                    createdBy: userId,
                    title: item.title,
                    type: item.type,
                    visibility: dto.visibility,
                    startAt,
                    endAt,
                    allDay: !hasTime,
                    repeat: 'NONE',
                    notes: item.notes ?? undefined,
                    ...(dto.childIds.length > 0 && {
                        children: { create: dto.childIds.map((childId) => ({ childId })) },
                    }),
                },
            });
            created++;
        }
        return { created, skipped };
    }
    async extractFromImage(familyId, userId, file) {
        await this.familyService.assertMember(familyId, userId);
        const client = new sdk_1.default();
        const base64 = file.buffer.toString('base64');
        const mediaType = file.mimetype;
        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: { type: 'base64', media_type: mediaType, data: base64 },
                        },
                        {
                            type: 'text',
                            text: `Extract all events and scheduled activities from this schedule image.
Return ONLY a raw JSON array — no markdown, no code blocks, no explanation.
Each object must have:
  "title": string
  "date": "YYYY-MM-DD"
  "startTime": "HH:MM" or null
  "endTime": "HH:MM" or null
  "type": one of SCHOOL | ACTIVITY | MEDICAL | VACATION | OTHER
  "notes": string or null
If the year is not shown, assume ${new Date().getFullYear()}.
Return [] if no events are found.`,
                        },
                    ],
                },
            ],
        });
        const raw = response.content[0].text.trim();
        const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
        try {
            const events = JSON.parse(clean);
            return Array.isArray(events) ? events : [];
        }
        catch {
            return [];
        }
    }
    async remove(familyId, eventId, userId) {
        await this.familyService.assertMember(familyId, userId);
        await this.prisma.event.delete({ where: { id: eventId, familyId } });
        return { message: 'Event deleted' };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        event_emitter_1.EventEmitter2])
], EventsService);
//# sourceMappingURL=events.service.js.map