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
const crypto_util_1 = require("./crypto.util");
const EVENT_TYPE_COLOR = {
    CUSTODY_TIME: '8',
    SCHOOL: '9',
    MEDICAL: '11',
    ACTIVITY: '5',
    VACATION: '7',
    OTHER: '1',
};
let GoogleCalendarSyncService = GoogleCalendarSyncService_1 = class GoogleCalendarSyncService {
    prisma;
    config;
    googleAuth;
    logger = new common_1.Logger(GoogleCalendarSyncService_1.name);
    constructor(prisma, config, googleAuth) {
        this.prisma = prisma;
        this.config = config;
        this.googleAuth = googleAuth;
    }
    async handleEventUpsert(payload) {
        const { eventId, userId } = payload;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.googleRefreshToken)
            return;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                children: { include: { child: true } },
            },
        });
        if (!event)
            return;
        try {
            const oauth2Client = await this.getRefreshedClient(user);
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
            const googleEvent = this.mapToGoogleEvent(event);
            if (event.googleEventId) {
                await calendar.events.patch({
                    calendarId: 'primary',
                    eventId: event.googleEventId,
                    requestBody: googleEvent,
                });
                this.logger.log(`Updated Google event ${event.googleEventId} for event ${eventId}`);
            }
            else {
                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: googleEvent,
                });
                const googleEventId = response.data.id;
                if (googleEventId) {
                    await this.prisma.event.update({
                        where: { id: eventId },
                        data: { googleEventId },
                    });
                    this.logger.log(`Created Google event ${googleEventId} for event ${eventId}`);
                }
            }
        }
        catch (err) {
            this.logger.error(`Google Calendar sync failed for event ${eventId}`, err);
        }
    }
    async syncAllEvents(familyId, userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.googleRefreshToken) {
            return { synced: 0 };
        }
        const events = await this.prisma.event.findMany({
            where: { familyId, startAt: { gte: new Date() } },
            include: { children: { include: { child: true } } },
        });
        const oauth2Client = await this.getRefreshedClient(user);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        let synced = 0;
        for (const event of events) {
            try {
                const googleEvent = this.mapToGoogleEvent(event);
                if (event.googleEventId) {
                    await calendar.events.patch({
                        calendarId: 'primary',
                        eventId: event.googleEventId,
                        requestBody: googleEvent,
                    });
                }
                else {
                    const response = await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: googleEvent,
                    });
                    if (response.data.id) {
                        await this.prisma.event.update({
                            where: { id: event.id },
                            data: { googleEventId: response.data.id },
                        });
                    }
                }
                synced++;
            }
            catch (err) {
                this.logger.warn(`Skipped event ${event.id} during full sync: ${err}`);
            }
        }
        return { synced };
    }
    async getRefreshedClient(user) {
        const encKey = this.config.getOrThrow('GOOGLE_TOKEN_ENCRYPTION_KEY');
        const oauth2Client = this.googleAuth.createOAuth2Client();
        const accessToken = (0, crypto_util_1.decrypt)(user.googleAccessToken, encKey);
        const refreshToken = (0, crypto_util_1.decrypt)(user.googleRefreshToken, encKey);
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
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
        if (event.allDay) {
            const dateStr = event.startAt.toISOString().slice(0, 10);
            const endDateStr = new Date(event.endAt.getTime() + 86400000)
                .toISOString()
                .slice(0, 10);
            return {
                summary: event.title,
                description,
                colorId: EVENT_TYPE_COLOR[event.type] ?? '1',
                start: { date: dateStr },
                end: { date: endDateStr },
            };
        }
        return {
            summary: event.title,
            description,
            colorId: EVENT_TYPE_COLOR[event.type] ?? '1',
            start: { dateTime: event.startAt.toISOString() },
            end: { dateTime: event.endAt.toISOString() },
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
        google_auth_service_1.GoogleAuthService])
], GoogleCalendarSyncService);
//# sourceMappingURL=google-calendar-sync.service.js.map