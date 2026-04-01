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
exports.CaregiverPortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CaregiverPortalService = class CaregiverPortalService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(token) {
        const caregiver = await this.prisma.caregiver.findUnique({
            where: { inviteToken: token },
            include: {
                children: { include: { child: true } },
            },
        });
        if (!caregiver)
            throw new common_1.NotFoundException('Invalid access token');
        if (caregiver.linkExpiry !== client_1.CaregiverLinkExpiry.NEVER &&
            caregiver.linkExpiresAt &&
            caregiver.linkExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Access link has expired');
        }
        const children = caregiver.children.map((cc) => cc.child);
        const childIds = children.map((c) => c.id);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const [custodyEvents, contacts, assignedEvents] = await Promise.all([
            caregiver.canViewCalendar && caregiver.familyId && childIds.length > 0
                ? this.prisma.custodyEvent.findMany({
                    where: {
                        familyId: caregiver.familyId,
                        childId: { in: childIds },
                        date: { gte: startOfMonth, lte: endOfMonth },
                    },
                    orderBy: { date: 'asc' },
                })
                : Promise.resolve([]),
            caregiver.canViewEmergencyContacts && caregiver.familyId
                ? this.prisma.familyMember.findMany({
                    where: { familyId: caregiver.familyId },
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                })
                : Promise.resolve([]),
            this.prisma.event.findMany({
                where: {
                    caregiverId: caregiver.id,
                    startAt: {
                        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        lte: new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
                    },
                },
                orderBy: { startAt: 'asc' },
                include: {
                    children: {
                        include: {
                            child: { select: { id: true, firstName: true, lastName: true, color: true } },
                        },
                    },
                },
            }),
        ]);
        return {
            name: caregiver.name,
            familyId: caregiver.familyId,
            permissions: {
                canViewCalendar: caregiver.canViewCalendar,
                canViewHealthInfo: caregiver.canViewHealthInfo,
                canViewEmergencyContacts: caregiver.canViewEmergencyContacts,
                canViewAllergies: caregiver.canViewAllergies,
            },
            children,
            custodyEvents: caregiver.canViewCalendar ? custodyEvents : [],
            contacts: caregiver.canViewEmergencyContacts
                ? contacts.map((m) => m.user)
                : [],
            assignedEvents,
        };
    }
};
exports.CaregiverPortalService = CaregiverPortalService;
exports.CaregiverPortalService = CaregiverPortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CaregiverPortalService);
//# sourceMappingURL=caregiver-portal.service.js.map