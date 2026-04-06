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
exports.IcalService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let IcalService = class IcalService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateFeedToken(userId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { icalFeedToken: true },
        });
        if (user.icalFeedToken)
            return user.icalFeedToken;
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.prisma.user.update({ where: { id: userId }, data: { icalFeedToken: token } });
        return token;
    }
    async rotateFeedToken(userId) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.prisma.user.update({ where: { id: userId }, data: { icalFeedToken: token } });
        return token;
    }
    async generateFeed(token) {
        const user = await this.prisma.user.findFirst({
            where: { icalFeedToken: token },
            select: { id: true, familyMemberships: { select: { familyId: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException('Feed not found');
        const familyId = user.familyMemberships[0]?.familyId;
        if (!familyId)
            return this.buildCalendar([]);
        const events = await this.prisma.event.findMany({
            where: {
                familyId,
                startAt: { gte: new Date() },
                visibility: 'SHARED',
            },
            include: { children: { include: { child: { select: { firstName: true } } } } },
            orderBy: { startAt: 'asc' },
        });
        const sixMonths = new Date();
        sixMonths.setMonth(sixMonths.getMonth() + 6);
        const custodyEvents = await this.prisma.custodyEvent.findMany({
            where: { familyId, date: { gte: new Date(), lte: sixMonths } },
            include: { child: { select: { firstName: true } } },
            orderBy: { date: 'asc' },
        });
        const lines = [];
        for (const ev of events) {
            const childNames = ev.children.map((ec) => ec.child.firstName).join(', ');
            const desc = [
                childNames ? `Children: ${childNames}` : null,
                ev.notes ?? null,
                'Synced from KidSchedule',
            ]
                .filter(Boolean)
                .join('\\n');
            if (ev.allDay) {
                lines.push('BEGIN:VEVENT', `UID:ks-${ev.id}@kidschedule`, `DTSTAMP:${this.toIcalStamp(new Date())}`, `DTSTART;VALUE=DATE:${this.toIcalDate(ev.startAt)}`, `DTEND;VALUE=DATE:${this.toIcalDate(new Date(ev.endAt.getTime() + 86_400_000))}`, `SUMMARY:${this.escape(ev.title)}`, ...(desc ? [`DESCRIPTION:${this.escape(desc)}`] : []), 'END:VEVENT');
            }
            else {
                lines.push('BEGIN:VEVENT', `UID:ks-${ev.id}@kidschedule`, `DTSTAMP:${this.toIcalStamp(new Date())}`, `DTSTART:${this.toIcalStamp(ev.startAt)}`, `DTEND:${this.toIcalStamp(ev.endAt)}`, `SUMMARY:${this.escape(ev.title)}`, ...(desc ? [`DESCRIPTION:${this.escape(desc)}`] : []), 'END:VEVENT');
            }
        }
        const blocks = this.groupCustodyBlocks(custodyEvents);
        for (const block of blocks) {
            const endDate = new Date(block.endDate.getTime() + 86_400_000);
            lines.push('BEGIN:VEVENT', `UID:ks-custody-${block.anchorId}@kidschedule`, `DTSTAMP:${this.toIcalStamp(new Date())}`, `DTSTART;VALUE=DATE:${this.toIcalDate(block.startDate)}`, `DTEND;VALUE=DATE:${this.toIcalDate(endDate)}`, `SUMMARY:Custody: ${this.escape(block.childName)}`, 'DESCRIPTION:Synchronized from KidSchedule', 'END:VEVENT');
        }
        return this.buildCalendar(lines);
    }
    groupCustodyBlocks(events) {
        const blocks = [];
        const ONE_DAY_MS = 86_400_000;
        for (const ev of events) {
            const last = blocks[blocks.length - 1];
            const isConsecutive = last &&
                last.childId === ev.childId &&
                last.custodianId === ev.custodianId &&
                ev.date.getTime() - last.endDate.getTime() <= ONE_DAY_MS + 1000;
            if (isConsecutive) {
                last.endDate = ev.date;
            }
            else {
                blocks.push({
                    childId: ev.childId,
                    childName: ev.child.firstName,
                    custodianId: ev.custodianId,
                    startDate: ev.date,
                    endDate: ev.date,
                    anchorId: ev.id,
                });
            }
        }
        return blocks;
    }
    buildCalendar(eventLines) {
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//KidSchedule//KidSchedule//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:KidSchedule',
            'X-WR-CALDESC:Your KidSchedule family calendar',
            'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
            ...eventLines,
            'END:VCALENDAR',
        ].join('\r\n');
    }
    toIcalStamp(d) {
        return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    }
    toIcalDate(d) {
        return d.toISOString().slice(0, 10).replace(/-/g, '');
    }
    escape(s) {
        return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
    }
};
exports.IcalService = IcalService;
exports.IcalService = IcalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IcalService);
//# sourceMappingURL=ical.service.js.map