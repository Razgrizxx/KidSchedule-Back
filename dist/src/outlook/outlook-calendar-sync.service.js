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
var OutlookCalendarSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookCalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const outlook_auth_service_1 = require("./outlook-auth.service");
const GRAPH = 'https://graph.microsoft.com/v1.0';
const CALENDAR_NAME = 'KidSchedule';
const EVENT_TYPE_CATEGORY = {
    CUSTODY_TIME: 'Blue Category',
    SCHOOL: 'Green Category',
    MEDICAL: 'Red Category',
    ACTIVITY: 'Yellow Category',
    VACATION: 'Teal Category',
    OTHER: 'Gray Category',
};
let OutlookCalendarSyncService = OutlookCalendarSyncService_1 = class OutlookCalendarSyncService {
    prisma;
    config;
    outlookAuth;
    logger = new common_1.Logger(OutlookCalendarSyncService_1.name);
    constructor(prisma, config, outlookAuth) {
        this.prisma = prisma;
        this.config = config;
        this.outlookAuth = outlookAuth;
    }
    async handleEventUpsert(payload) {
        const { eventId, userId } = payload;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.outlookRefreshToken)
            return;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { children: { include: { child: true } } },
        });
        if (!event)
            return;
        try {
            const accessToken = await this.outlookAuth.getValidAccessToken(userId);
            const calendarId = await this.getOrCreateKidScheduleCalendar(accessToken, user);
            const outlookEvent = this.mapToOutlookEvent(event);
            const newId = await this.upsertOutlookEvent(accessToken, calendarId, event.outlookEventId, outlookEvent);
            if (newId && newId !== event.outlookEventId) {
                await this.prisma.event.update({ where: { id: eventId }, data: { outlookEventId: newId } });
            }
        }
        catch (err) {
            this.logger.error(`Outlook Calendar sync failed for event ${eventId}`, err);
        }
    }
    async syncAllEvents(familyId, userId, cleanup = false) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.outlookRefreshToken)
            return { synced: 0, custodySynced: 0 };
        const accessToken = await this.outlookAuth.getValidAccessToken(userId);
        const calendarId = await this.getOrCreateKidScheduleCalendar(accessToken, user);
        const [synced, custodySynced] = await Promise.all([
            this.syncRegularEvents(familyId, accessToken, calendarId, cleanup),
            this.syncCustodyBlocks(familyId, accessToken, calendarId, cleanup),
        ]);
        this.logger.log(`Outlook export done — regular: ${synced}, custody blocks: ${custodySynced}`);
        return { synced, custodySynced };
    }
    async getOrCreateKidScheduleCalendar(accessToken, user) {
        if (user.outlookCalendarId) {
            const res = await fetch(`${GRAPH}/me/calendars/${user.outlookCalendarId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok)
                return user.outlookCalendarId;
        }
        const res = await fetch(`${GRAPH}/me/calendars`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: CALENDAR_NAME }),
        });
        if (!res.ok)
            throw new Error(`Failed to create Outlook calendar: ${await res.text()}`);
        const calendar = (await res.json());
        await this.prisma.user.update({
            where: { id: user.id },
            data: { outlookCalendarId: calendar.id },
        });
        user.outlookCalendarId = calendar.id;
        this.logger.log(`Created KidSchedule Outlook calendar: ${calendar.id}`);
        return calendar.id;
    }
    async syncRegularEvents(familyId, accessToken, calendarId, cleanup) {
        const events = await this.prisma.event.findMany({
            where: { familyId, startAt: { gte: new Date() } },
            include: { children: { include: { child: true } } },
        });
        if (cleanup) {
            await this.deleteOutlookEventsBatch(accessToken, calendarId, events.filter((e) => e.outlookEventId).map((e) => e.outlookEventId));
            await this.prisma.event.updateMany({
                where: { familyId, outlookEventId: { not: null } },
                data: { outlookEventId: null },
            });
            events.forEach((e) => (e.outlookEventId = null));
        }
        let synced = 0;
        const BATCH = 5;
        for (let i = 0; i < events.length; i += BATCH) {
            await Promise.all(events.slice(i, i + BATCH).map(async (event) => {
                try {
                    const outlookEvent = this.mapToOutlookEvent(event);
                    const newId = await this.upsertOutlookEvent(accessToken, calendarId, event.outlookEventId, outlookEvent);
                    if (newId && newId !== event.outlookEventId) {
                        await this.prisma.event.update({ where: { id: event.id }, data: { outlookEventId: newId } });
                    }
                    synced++;
                }
                catch (err) {
                    this.logger.warn(`Skipped event ${event.id}: ${err}`);
                }
            }));
        }
        return synced;
    }
    async syncCustodyBlocks(familyId, accessToken, calendarId, cleanup) {
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        const custodyEvents = await this.prisma.custodyEvent.findMany({
            where: { familyId, date: { gte: new Date(), lte: sixMonthsFromNow } },
            include: { child: true },
            orderBy: [{ childId: 'asc' }, { date: 'asc' }],
        });
        if (cleanup) {
            await this.deleteOutlookEventsBatch(accessToken, calendarId, custodyEvents.filter((e) => e.outlookEventId).map((e) => e.outlookEventId));
            await this.prisma.custodyEvent.updateMany({
                where: { familyId, outlookEventId: { not: null } },
                data: { outlookEventId: null },
            });
            custodyEvents.forEach((e) => (e.outlookEventId = null));
        }
        const blocks = this.groupCustodyBlocks(custodyEvents);
        let synced = 0;
        const BATCH = 5;
        for (let i = 0; i < blocks.length; i += BATCH) {
            await Promise.all(blocks.slice(i, i + BATCH).map(async (block) => {
                try {
                    const outlookEvent = this.mapCustodyBlockToOutlookEvent(block);
                    const newId = await this.upsertOutlookEvent(accessToken, calendarId, block.outlookEventId, outlookEvent);
                    if (newId && newId !== block.outlookEventId) {
                        await this.prisma.custodyEvent.update({
                            where: { id: block.anchorId },
                            data: { outlookEventId: newId },
                        });
                    }
                    synced++;
                }
                catch (err) {
                    this.logger.warn(`Skipped custody block ${block.anchorId}: ${err}`);
                }
            }));
        }
        return synced;
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
                    outlookEventId: ev.outlookEventId ?? null,
                });
            }
        }
        return blocks;
    }
    async upsertOutlookEvent(accessToken, calendarId, existingId, body) {
        if (existingId) {
            const res = await fetch(`${GRAPH}/me/calendars/${calendarId}/events/${existingId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok)
                return existingId;
            if (res.status !== 404)
                throw new Error(`Outlook PATCH failed: ${res.status}`);
        }
        const res = await fetch(`${GRAPH}/me/calendars/${calendarId}/events`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Outlook INSERT failed: ${res.status}`);
        const data = (await res.json());
        return data.id;
    }
    async deleteOutlookEventsBatch(accessToken, calendarId, eventIds) {
        const BATCH = 5;
        for (let i = 0; i < eventIds.length; i += BATCH) {
            await Promise.all(eventIds.slice(i, i + BATCH).map((id) => fetch(`${GRAPH}/me/calendars/${calendarId}/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            }).catch(() => { })));
        }
    }
    mapToOutlookEvent(event) {
        const childNames = event.children.map((ec) => ec.child.firstName).join(', ');
        const notes = [
            childNames ? `Children: ${childNames}` : null,
            event.notes ?? null,
            '— Synced from KidSchedule',
        ]
            .filter(Boolean)
            .join('\n');
        const category = EVENT_TYPE_CATEGORY[event.type] ?? 'Gray Category';
        if (event.allDay) {
            const endDate = new Date(event.endAt.getTime() + 86_400_000);
            return {
                subject: event.title,
                body: { contentType: 'text', content: notes },
                isAllDay: true,
                start: { dateTime: this.toOutlookDate(event.startAt), timeZone: 'UTC' },
                end: { dateTime: this.toOutlookDate(endDate), timeZone: 'UTC' },
                categories: [category],
            };
        }
        return {
            subject: event.title,
            body: { contentType: 'text', content: notes },
            isAllDay: false,
            start: { dateTime: event.startAt.toISOString().replace('Z', ''), timeZone: 'UTC' },
            end: { dateTime: event.endAt.toISOString().replace('Z', ''), timeZone: 'UTC' },
            categories: [category],
        };
    }
    mapCustodyBlockToOutlookEvent(block) {
        const endDate = new Date(block.endDate.getTime() + 86_400_000);
        return {
            subject: `Custody: ${block.childName}`,
            body: { contentType: 'text', content: 'Synchronized from KidSchedule' },
            isAllDay: true,
            start: { dateTime: this.toOutlookDate(block.startDate), timeZone: 'UTC' },
            end: { dateTime: this.toOutlookDate(endDate), timeZone: 'UTC' },
            categories: ['Blue Category'],
        };
    }
    toOutlookDate(d) {
        return d.toISOString().slice(0, 19) + '.000';
    }
};
exports.OutlookCalendarSyncService = OutlookCalendarSyncService;
__decorate([
    (0, event_emitter_1.OnEvent)('calendar.event.upsert', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OutlookCalendarSyncService.prototype, "handleEventUpsert", null);
exports.OutlookCalendarSyncService = OutlookCalendarSyncService = OutlookCalendarSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        outlook_auth_service_1.OutlookAuthService])
], OutlookCalendarSyncService);
//# sourceMappingURL=outlook-calendar-sync.service.js.map