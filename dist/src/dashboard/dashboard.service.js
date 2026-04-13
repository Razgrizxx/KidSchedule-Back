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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getToday(familyId, userId) {
        const now = new Date();
        const todayStart = (0, date_fns_1.startOfDay)(now);
        const todayEnd = (0, date_fns_1.endOfDay)(now);
        const next48h = (0, date_fns_1.addHours)(now, 48);
        const [custodyToday, eventsToday, eventsNext48h, pendingTotal, pendingIncoming, unreadMessages, nextHandoff, familyMembers,] = await Promise.all([
            this.prisma.custodyEvent.findMany({
                where: {
                    familyId,
                    date: { gte: todayStart, lte: todayEnd },
                    schedule: { isActive: true },
                },
                include: {
                    child: { select: { id: true, firstName: true, color: true } },
                },
                orderBy: { date: 'asc' },
            }),
            this.prisma.event.findMany({
                where: {
                    familyId,
                    startAt: { gte: todayStart, lte: todayEnd },
                },
                include: {
                    assignedTo: { select: { id: true, firstName: true } },
                },
                orderBy: { startAt: 'asc' },
                take: 10,
            }),
            this.prisma.event.findMany({
                where: {
                    familyId,
                    startAt: { gt: todayEnd, lte: next48h },
                },
                include: {
                    assignedTo: { select: { id: true, firstName: true } },
                },
                orderBy: { startAt: 'asc' },
                take: 5,
            }),
            this.prisma.changeRequest.count({
                where: { familyId, status: 'PENDING' },
            }),
            this.prisma.changeRequest.count({
                where: { familyId, status: 'PENDING', requesterId: { not: userId } },
            }),
            this.prisma.message.count({
                where: {
                    familyId,
                    senderId: { not: userId },
                    isSystemMessage: false,
                    status: { not: 'READ' },
                    createdAt: { gte: (0, date_fns_1.addHours)(now, -7 * 24) },
                },
            }),
            this.prisma.handoffLog.findFirst({
                where: {
                    familyId,
                    handoffAt: { gte: now },
                    OR: [{ fromParentId: userId }, { toParentId: userId }],
                },
                include: {
                    child: { select: { id: true, firstName: true, color: true } },
                    fromParent: { select: { id: true, firstName: true } },
                    toParent: { select: { id: true, firstName: true } },
                },
                orderBy: { handoffAt: 'asc' },
            }),
            this.prisma.familyMember.findMany({
                where: { familyId },
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
            }),
        ]);
        return {
            date: now.toISOString(),
            custodyToday: custodyToday.map((e) => {
                const member = familyMembers.find((m) => m.userId === e.custodianId);
                return {
                    childId: e.childId,
                    childName: e.child.firstName,
                    childColor: e.child.color,
                    custodianId: e.custodianId,
                    custodianName: member
                        ? `${member.user.firstName} ${member.user.lastName}`
                        : 'Co-parent',
                    isMyDay: e.custodianId === userId,
                };
            }),
            eventsToday: eventsToday.map((e) => ({
                id: e.id,
                title: e.title,
                type: e.type,
                startAt: e.startAt,
                allDay: e.allDay,
                assignedTo: e.assignedTo
                    ? { id: e.assignedTo.id, firstName: e.assignedTo.firstName }
                    : null,
            })),
            eventsNext48h: eventsNext48h.map((e) => ({
                id: e.id,
                title: e.title,
                type: e.type,
                startAt: e.startAt,
                allDay: e.allDay,
            })),
            pendingRequests: {
                total: pendingTotal,
                incomingForMe: pendingIncoming,
            },
            unreadMessages,
            nextHandoff: nextHandoff
                ? {
                    handoffAt: nextHandoff.handoffAt,
                    childName: nextHandoff.child.firstName,
                    childColor: nextHandoff.child.color,
                    fromParent: nextHandoff.fromParent.firstName,
                    toParent: nextHandoff.toParent.firstName,
                    isReceiving: nextHandoff.toParentId === userId,
                    confirmedAt: nextHandoff.confirmedAt,
                }
                : null,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map