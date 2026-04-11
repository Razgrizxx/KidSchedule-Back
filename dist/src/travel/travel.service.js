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
exports.TravelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const audit_service_1 = require("../audit/audit.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let TravelService = class TravelService {
    prisma;
    notifications;
    audit;
    eventEmitter;
    constructor(prisma, notifications, audit, eventEmitter) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.audit = audit;
        this.eventEmitter = eventEmitter;
    }
    async create(familyId, userId, dto) {
        const notice = await this.prisma.travelNotice.create({
            data: {
                familyId,
                createdBy: userId,
                childId: dto.childId ?? null,
                destination: dto.destination,
                departureDate: new Date(dto.departureDate),
                returnDate: new Date(dto.returnDate),
                contactPhone: dto.contactPhone,
                contactEmail: dto.contactEmail,
                notes: dto.notes,
            },
            include: {
                creator: { select: { id: true, firstName: true, lastName: true } },
                child: { select: { id: true, firstName: true } },
            },
        });
        const childLabel = notice.child ? ` with ${notice.child.firstName}` : '';
        this.notifications.sendToFamily(familyId, userId, {
            title: '✈️ Travel Notice',
            body: `${notice.creator.firstName} is traveling${childLabel} to ${dto.destination} (${dto.departureDate} – ${dto.returnDate}). Please accept or reject.`,
        }).catch(() => { });
        return notice;
    }
    async findAll(familyId) {
        return this.prisma.travelNotice.findMany({
            where: { familyId },
            include: {
                creator: { select: { id: true, firstName: true, lastName: true } },
                acknowledger: { select: { id: true, firstName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
            orderBy: { departureDate: 'desc' },
        });
    }
    async accept(familyId, id, userId) {
        const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
        if (!notice)
            throw new common_1.NotFoundException('Travel notice not found');
        if (notice.createdBy === userId)
            throw new common_1.ForbiddenException('Cannot accept your own notice');
        if (notice.status !== 'PENDING')
            throw new common_1.ForbiddenException('Notice already responded to');
        const calEvent = await this.prisma.event.create({
            data: {
                familyId,
                createdBy: notice.createdBy,
                title: `✈️ ${notice.destination}`,
                type: 'VACATION',
                visibility: 'SHARED',
                startAt: notice.departureDate,
                endAt: notice.returnDate,
                allDay: true,
                repeat: 'NONE',
                notes: notice.notes ?? undefined,
                ...(notice.childId && {
                    children: { create: [{ childId: notice.childId }] },
                }),
            },
        });
        this.eventEmitter.emit('calendar.event.upsert', {
            eventId: calEvent.id,
            userId: notice.createdBy,
        });
        const updated = await this.prisma.travelNotice.update({
            where: { id },
            data: {
                status: 'ACCEPTED',
                acknowledgedBy: userId,
                acknowledgedAt: new Date(),
                linkedEventId: calEvent.id,
            },
            include: {
                creator: { select: { id: true, firstName: true } },
                acknowledger: { select: { id: true, firstName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
        this.notifications.sendToFamily(familyId, userId, {
            title: '✅ Travel Notice Accepted',
            body: `Your trip to ${notice.destination} has been accepted and added to the calendar.`,
        }).catch(() => { });
        return updated;
    }
    async reject(familyId, id, userId) {
        const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
        if (!notice)
            throw new common_1.NotFoundException('Travel notice not found');
        if (notice.createdBy === userId)
            throw new common_1.ForbiddenException('Cannot reject your own notice');
        if (notice.status !== 'PENDING')
            throw new common_1.ForbiddenException('Notice already responded to');
        const updated = await this.prisma.travelNotice.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectedBy: userId,
                rejectedAt: new Date(),
            },
            include: {
                creator: { select: { id: true, firstName: true } },
                acknowledger: { select: { id: true, firstName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
        this.notifications.sendToFamily(familyId, userId, {
            title: '❌ Travel Notice Rejected',
            body: `Your trip to ${notice.destination} was rejected by your co-parent.`,
        }).catch(() => { });
        return updated;
    }
    async remove(familyId, id, userId) {
        const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
        if (!notice)
            throw new common_1.NotFoundException('Travel notice not found');
        if (notice.createdBy !== userId)
            throw new common_1.ForbiddenException('Only the creator can delete');
        if (notice.linkedEventId) {
            await this.prisma.event.deleteMany({
                where: { id: notice.linkedEventId, familyId },
            });
        }
        await this.prisma.travelNotice.delete({ where: { id } });
    }
};
exports.TravelService = TravelService;
exports.TravelService = TravelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        audit_service_1.AuditService,
        event_emitter_1.EventEmitter2])
], TravelService);
//# sourceMappingURL=travel.service.js.map