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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const messaging_service_1 = require("../messaging/messaging.service");
const chat_gateway_1 = require("../messaging/chat.gateway");
const mail_service_1 = require("../mail/mail.service");
let RequestsService = class RequestsService {
    prisma;
    familyService;
    messaging;
    chatGateway;
    mail;
    constructor(prisma, familyService, messaging, chatGateway, mail) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.messaging = messaging;
        this.chatGateway = chatGateway;
        this.mail = mail;
    }
    async create(familyId, requesterId, dto) {
        await this.familyService.assertMember(familyId, requesterId);
        const created = await this.prisma.changeRequest.create({
            data: {
                familyId,
                requesterId,
                type: dto.type,
                originalDate: dto.originalDate ? new Date(dto.originalDate) : undefined,
                requestedDate: new Date(dto.requestedDate),
                requestedDateTo: dto.requestedDateTo ? new Date(dto.requestedDateTo) : undefined,
                childId: dto.childId,
                reason: dto.reason,
            },
            include: {
                requester: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const requesterName = `${created.requester.firstName} ${created.requester.lastName}`;
        const reqFmt = new Date(dto.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const msg = dto.originalDate
            ? (() => {
                const origFmt = new Date(dto.originalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `System: ${requesterName} has requested a custody swap — giving up ${origFmt} in exchange for ${reqFmt}.`;
            })()
            : dto.requestedDateTo
                ? (() => {
                    const toFmt = new Date(dto.requestedDateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return `System: ${requesterName} has requested extra days from ${reqFmt} to ${toFmt}.`;
                })()
                : `System: ${requesterName} has requested an extra day on ${reqFmt}.`;
        await this.messaging.sendSystemMessage(familyId, msg);
        void this.notifyCoParentByEmail(familyId, created.requester.id, {
            requesterName,
            type: dto.type,
            requestedDate: new Date(dto.requestedDate).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric',
            }),
        }).catch(() => { });
        return created;
    }
    async findAll(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.changeRequest.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
            include: {
                requester: { select: { id: true, firstName: true, lastName: true } },
                responder: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async respond(familyId, requestId, responderId, dto) {
        await this.familyService.assertMember(familyId, responderId);
        const request = await this.prisma.changeRequest.findFirst({
            where: { id: requestId, familyId },
            include: {
                requester: { select: { id: true, firstName: true, lastName: true } },
                responder: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!request)
            throw new common_1.NotFoundException('Change request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already resolved');
        if (request.requesterId === responderId)
            throw new common_1.ForbiddenException('Cannot respond to your own request');
        if (dto.action === 'COUNTER_PROPOSED' && !dto.counterDate)
            throw new common_1.BadRequestException('counterDate is required for counter proposals');
        const updated = await this.prisma.changeRequest.update({
            where: { id: requestId },
            data: {
                status: dto.action,
                responderId,
                counterDate: dto.counterDate ? new Date(dto.counterDate) : undefined,
                counterReason: dto.counterReason,
                resolvedAt: dto.action !== 'COUNTER_PROPOSED' ? new Date() : undefined,
            },
        });
        if (dto.action === 'ACCEPTED') {
            await this.applyCalendarOverrides(request, responderId);
        }
        await this.sendStatusMessage(familyId, request, dto.action, responderId);
        this.chatGateway.emitToFamily(familyId, 'notification', {
            type: 'REQUEST_UPDATED',
            payload: { requestId, status: dto.action },
        });
        return updated;
    }
    async notifyCoParentByEmail(familyId, requesterId, opts) {
        const memberships = await this.prisma.familyMember.findMany({
            where: { familyId, userId: { not: requesterId } },
            include: { user: { select: { email: true } } },
        });
        for (const m of memberships) {
            void this.mail.sendChangeRequestNotification({
                toEmail: m.user.email,
                requesterName: opts.requesterName,
                type: opts.type,
                requestedDate: opts.requestedDate,
            });
        }
    }
    async applyCalendarOverrides(request, responderId) {
        const schedules = await this.prisma.schedule.findMany({
            where: {
                familyId: request.familyId,
                ...(request.childId ? { childId: request.childId } : {}),
                isActive: true,
            },
        });
        if (schedules.length === 0)
            return;
        const schedule = schedules[0];
        const requestedDates = [];
        const endDate = request.requestedDateTo ?? request.requestedDate;
        const cur = new Date(request.requestedDate);
        while (cur <= endDate) {
            requestedDates.push(new Date(cur));
            cur.setUTCDate(cur.getUTCDate() + 1);
        }
        const overrides = [
            ...requestedDates.map((d) => [d, request.requesterId]),
            ...(request.originalDate ? [[request.originalDate, responderId]] : []),
        ];
        for (const [date, custodianId] of overrides) {
            await this.prisma.custodyEvent.upsert({
                where: { scheduleId_date: { scheduleId: schedule.id, date } },
                update: { custodianId, isOverride: true },
                create: {
                    scheduleId: schedule.id,
                    childId: schedule.childId,
                    familyId: request.familyId,
                    date,
                    custodianId,
                    isOverride: true,
                },
            });
        }
    }
    async sendStatusMessage(familyId, request, action, responderId) {
        const responder = await this.prisma.user.findUnique({
            where: { id: responderId },
            select: { firstName: true, lastName: true },
        });
        const responderName = responder ? `${responder.firstName} ${responder.lastName}` : 'Co-parent';
        const requesterName = `${request.requester.firstName} ${request.requester.lastName}`;
        const reqFmt = request.requestedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const isSwap = !!request.originalDate;
        const origFmt = isSwap
            ? request.originalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null;
        const messages = {
            ACCEPTED: isSwap
                ? `System: ${responderName} has APPROVED the custody swap requested by ${requesterName} (${origFmt} ↔ ${reqFmt}). Calendar updated.`
                : `System: ${responderName} has APPROVED ${requesterName}'s request for an extra day on ${reqFmt}. Calendar updated.`,
            DECLINED: isSwap
                ? `System: ${responderName} has DECLINED the custody swap requested by ${requesterName} (${origFmt} ↔ ${reqFmt}).`
                : `System: ${responderName} has DECLINED ${requesterName}'s request for ${reqFmt}.`,
            COUNTER_PROPOSED: `System: ${responderName} has sent a COUNTER-PROPOSAL to ${requesterName}'s request for ${reqFmt}.`,
        };
        const msg = messages[action];
        if (msg)
            await this.messaging.sendSystemMessage(familyId, msg);
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        messaging_service_1.MessagingService,
        chat_gateway_1.ChatGateway,
        mail_service_1.MailService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map