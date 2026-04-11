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
var GoogleCalendarSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const prisma_service_1 = require("../prisma/prisma.service");
const google_auth_service_1 = require("./google-auth.service");
const chat_gateway_1 = require("../messaging/chat.gateway");
const crypto_util_1 = require("./crypto.util");
const EVENT_TYPE_COLOR = {
    CUSTODY_TIME: '9',
    SCHOOL: '2',
    MEDICAL: '11',
    ACTIVITY: '5',
    VACATION: '7',
    OTHER: '8',
};
const CHILD_COLOR_PALETTE = [
    '9',
    '11',
    '5',
    '7',
    '3',
    '6',
    '10',
    '4',
    '2',
    '1',
    '8',
];
const KIDSCHEDULE_CALENDAR_NAME = 'KidSchedule';
let GoogleCalendarSyncService = GoogleCalendarSyncService_1 = class GoogleCalendarSyncService {
    prisma;
    config;
    googleAuth;
    chatGateway;
    logger = new common_1.Logger(GoogleCalendarSyncService_1.name);
    constructor(prisma, config, googleAuth, chatGateway) {
        this.prisma = prisma;
        this.config = config;
        this.googleAuth = googleAuth;
        this.chatGateway = chatGateway;
    }
    async handleEventUpsert(payload) {
        const { eventId, userId } = payload;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.googleRefreshToken)
            return;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { children: { include: { child: true } } },
        });
        if (!event)
            return;
        try {
            const oauth2Client = await this.getRefreshedClient(user);
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
            const calendarId = await this.getOrCreateKidScheduleCalendar(calendar, user);
            const googleEvent = this.mapToGoogleEvent(event);
            const newId = await this.upsertGoogleEvent(calendar, calendarId, event.googleEventId, googleEvent);
            if (newId && newId !== event.googleEventId) {
                await this.prisma.event.update({ where: { id: eventId }, data: { googleEventId: newId } });
            }
        }
        catch (err) {
            this.logger.error(`Google Calendar sync failed for event ${eventId}`, err);
            if (err?.response?.data?.error === 'invalid_grant' || err?.cause?.message === 'invalid_grant') {
                this.chatGateway.emitToFamily(event.familyId, 'notification', {
                    type: 'GOOGLE_SYNC_ERROR',
                    payload: { userId },
                });
            }
        }
    }
    async syncAllEvents(familyId, userId, cleanup = false) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.googleRefreshToken)
            return { synced: 0, custodySynced: 0 };
        const oauth2Client = await this.getRefreshedClient(user);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        const calendarId = await this.getOrCreateKidScheduleCalendar(calendar, user);
        const childColorMap = await this.buildChildColorMap(familyId);
        this.logger.log(`Export started — calendarId: ${calendarId}, cleanup: ${cleanup}, childColorMap: ${JSON.stringify(childColorMap)}`);
        const [synced, custodySynced] = await Promise.all([
            this.syncRegularEvents(familyId, calendar, calendarId, cleanup),
            this.syncCustodyBlocks(familyId, calendar, calendarId, childColorMap, cleanup),
        ]);
        this.logger.log(`Export done — regular: ${synced}, custody blocks: ${custodySynced}`);
        return { synced, custodySynced };
    }
    async getOrCreateKidScheduleCalendar(calendar, user) {
        if (user.googleCalendarId) {
            try {
                await calendar.calendarList.get({ calendarId: user.googleCalendarId });
                return user.googleCalendarId;
            }
            catch {
            }
        }
        const created = await calendar.calendars.insert({
            requestBody: {
                summary: KIDSCHEDULE_CALENDAR_NAME,
                description: 'Family custody schedule and events synced from KidSchedule',
            },
        });
        const calendarId = created.data.id;
        await calendar.calendarList.patch({
            calendarId,
            requestBody: { backgroundColor: '#0B8043', foregroundColor: '#ffffff' },
        }).catch(() => { });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { googleCalendarId: calendarId },
        });
        user.googleCalendarId = calendarId;
        this.logger.log(`Created KidSchedule calendar: ${calendarId}`);
        return calendarId;
    }
    async buildChildColorMap(familyId) {
        const children = await this.prisma.child.findMany({
            where: { familyId },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });
        return Object.fromEntries(children.map((child, idx) => [
            child.id,
            CHILD_COLOR_PALETTE[idx % CHILD_COLOR_PALETTE.length],
        ]));
    }
    async syncRegularEvents(familyId, calendar, calendarId, cleanup) {
        const events = await this.prisma.event.findMany({
            where: { familyId, startAt: { gte: new Date() } },
            include: { children: { include: { child: true } } },
        });
        this.logger.log(`Regular events found: ${events.length}`);
        if (cleanup) {
            await this.deleteGoogleEventsBatch(calendar, calendarId, events.filter((e) => e.googleEventId).map((e) => e.googleEventId));
            await this.prisma.event.updateMany({
                where: { familyId, googleEventId: { not: null } },
                data: { googleEventId: null },
            });
            events.forEach((e) => (e.googleEventId = null));
        }
        let synced = 0;
        const BATCH = 5;
        for (let i = 0; i < events.length; i += BATCH) {
            await Promise.all(events.slice(i, i + BATCH).map(async (event) => {
                try {
                    const googleEvent = this.mapToGoogleEvent(event);
                    const newId = await this.upsertGoogleEvent(calendar, calendarId, event.googleEventId, googleEvent);
                    if (newId && newId !== event.googleEventId) {
                        await this.prisma.event.update({ where: { id: event.id }, data: { googleEventId: newId } });
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
    async syncCustodyBlocks(familyId, calendar, calendarId, childColorMap, cleanup) {
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        const custodyEvents = await this.prisma.custodyEvent.findMany({
            where: { familyId, date: { gte: new Date(), lte: sixMonthsFromNow } },
            include: { child: true },
            orderBy: [{ childId: 'asc' }, { date: 'asc' }],
        });
        this.logger.log(`Custody events found: ${custodyEvents.length}, date range: now → ${sixMonthsFromNow.toISOString()}`);
        if (cleanup) {
            await this.deleteGoogleEventsBatch(calendar, calendarId, custodyEvents.filter((e) => e.googleEventId).map((e) => e.googleEventId));
            await this.prisma.custodyEvent.updateMany({
                where: { familyId, googleEventId: { not: null } },
                data: { googleEventId: null },
            });
            custodyEvents.forEach((e) => (e.googleEventId = null));
        }
        const blocks = this.groupCustodyBlocks(custodyEvents);
        this.logger.log(`Custody blocks grouped: ${blocks.length}`);
        let synced = 0;
        const BATCH = 5;
        for (let i = 0; i < blocks.length; i += BATCH) {
            await Promise.all(blocks.slice(i, i + BATCH).map(async (block) => {
                try {
                    const colorId = childColorMap[block.childId] ?? '9';
                    const googleEvent = this.mapCustodyBlockToGoogleEvent(block, colorId);
                    const newId = await this.upsertGoogleEvent(calendar, calendarId, block.googleEventId, googleEvent);
                    if (newId && newId !== block.googleEventId) {
                        await this.prisma.custodyEvent.update({
                            where: { id: block.anchorId },
                            data: { googleEventId: newId },
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
                    googleEventId: ev.googleEventId ?? null,
                });
            }
        }
        return blocks;
    }
    async upsertGoogleEvent(calendar, calendarId, existingId, requestBody) {
        if (existingId) {
            try {
                await calendar.events.patch({ calendarId, eventId: existingId, requestBody });
                return existingId;
            }
            catch (err) {
                if (err?.code !== 404 && err?.status !== 404)
                    throw err;
            }
        }
        const res = await calendar.events.insert({ calendarId, requestBody });
        return res.data.id ?? null;
    }
    async deleteGoogleEventsBatch(calendar, calendarId, googleEventIds) {
        const BATCH = 5;
        for (let i = 0; i < googleEventIds.length; i += BATCH) {
            await Promise.all(googleEventIds
                .slice(i, i + BATCH)
                .map((id) => calendar.events.delete({ calendarId, eventId: id }).catch(() => { })));
        }
    }
    async getRefreshedClient(user) {
        if (!user.googleAccessToken || !user.googleRefreshToken) {
            throw new Error(`Google tokens missing for user ${user.id} — integration may have been disconnected`);
        }
        const encKey = this.config.getOrThrow('GOOGLE_TOKEN_ENCRYPTION_KEY');
        const oauth2Client = this.googleAuth.createOAuth2Client();
        oauth2Client.setCredentials({
            access_token: (0, crypto_util_1.decrypt)(user.googleAccessToken, encKey),
            refresh_token: (0, crypto_util_1.decrypt)(user.googleRefreshToken, encKey),
            expiry_date: user.googleTokenExpiry?.getTime(),
        });
        const fiveMinutes = 5 * 60 * 1000;
        const needsRefresh = !user.googleTokenExpiry ||
            user.googleTokenExpiry.getTime() < Date.now() + fiveMinutes;
        if (needsRefresh) {
            const { credentials } = await oauth2Client.refreshAccessToken();
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    ...(credentials.access_token && {
                        googleAccessToken: (0, crypto_util_1.encrypt)(credentials.access_token, encKey),
                    }),
                    ...(credentials.expiry_date && {
                        googleTokenExpiry: new Date(credentials.expiry_date),
                    }),
                },
            });
            oauth2Client.setCredentials(credentials);
        }
        return oauth2Client;
    }
    mapToGoogleEvent(event) {
        const childNames = event.children.map((ec) => ec.child.firstName).join(', ');
        const description = [
            childNames ? `Children: ${childNames}` : null,
            event.notes ?? null,
            `\n— Synced from KidSchedule`,
        ]
            .filter(Boolean)
            .join('\n');
        const base = {
            summary: event.title,
            description,
            colorId: EVENT_TYPE_COLOR[event.type] ?? '8',
        };
        if (event.allDay) {
            return {
                ...base,
                start: { date: event.startAt.toISOString().slice(0, 10) },
                end: { date: new Date(event.endAt.getTime() + 86_400_000).toISOString().slice(0, 10) },
            };
        }
        return {
            ...base,
            start: { dateTime: event.startAt.toISOString() },
            end: { dateTime: event.endAt.toISOString() },
        };
    }
    mapCustodyBlockToGoogleEvent(block, colorId) {
        return {
            summary: `Custody: ${block.childName}`,
            description: `Synchronized from KidSchedule`,
            colorId,
            start: { date: block.startDate.toISOString().slice(0, 10) },
            end: { date: new Date(block.endDate.getTime() + 86_400_000).toISOString().slice(0, 10) },
        };
    }
};
exports.GoogleCalendarSyncService = GoogleCalendarSyncService;
__decorate([
    (0, event_emitter_1.OnEvent)('calendar.event.upsert', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleCalendarSyncService.prototype, "handleEventUpsert", null);
exports.GoogleCalendarSyncService = GoogleCalendarSyncService = GoogleCalendarSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        google_auth_service_1.GoogleAuthService,
        chat_gateway_1.ChatGateway])
], GoogleCalendarSyncService);
//# sourceMappingURL=google-calendar-sync.service.js.map