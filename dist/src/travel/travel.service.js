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
let TravelService = class TravelService {
    prisma;
    notifications;
    audit;
    constructor(prisma, notifications, audit) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.audit = audit;
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
            body: `${notice.creator.firstName} is traveling${childLabel} to ${dto.destination} (${dto.departureDate} – ${dto.returnDate})`,
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
    async acknowledge(familyId, id, userId) {
        const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
        if (!notice)
            throw new common_1.NotFoundException('Travel notice not found');
        if (notice.createdBy === userId)
            throw new common_1.ForbiddenException('Cannot acknowledge your own notice');
        if (notice.acknowledgedBy)
            throw new common_1.ForbiddenException('Already acknowledged');
        return this.prisma.travelNotice.update({
            where: { id },
            data: { acknowledgedBy: userId, acknowledgedAt: new Date() },
            include: {
                creator: { select: { id: true, firstName: true } },
                acknowledger: { select: { id: true, firstName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
    }
    async remove(familyId, id, userId) {
        const notice = await this.prisma.travelNotice.findFirst({ where: { id, familyId } });
        if (!notice)
            throw new common_1.NotFoundException('Travel notice not found');
        if (notice.createdBy !== userId)
            throw new common_1.ForbiddenException('Only the creator can delete');
        await this.prisma.travelNotice.delete({ where: { id } });
    }
};
exports.TravelService = TravelService;
exports.TravelService = TravelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        audit_service_1.AuditService])
], TravelService);
//# sourceMappingURL=travel.service.js.map