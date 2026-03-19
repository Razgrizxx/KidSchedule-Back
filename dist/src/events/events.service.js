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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
let EventsService = class EventsService {
    prisma;
    familyService;
    constructor(prisma, familyService) {
        this.prisma = prisma;
        this.familyService = familyService;
    }
    async create(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const { childIds, ...rest } = dto;
        return this.prisma.event.create({
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
            },
        });
    }
    async findAll(familyId, userId, month) {
        await this.familyService.assertMember(familyId, userId);
        const where = { familyId };
        if (month) {
            const [y, m] = month.split('-').map(Number);
            const start = new Date(y, m - 1, 1);
            const end = new Date(y, m, 1);
            where.startAt = { gte: start, lt: end };
        }
        return this.prisma.event.findMany({
            where,
            orderBy: { startAt: 'asc' },
            include: {
                children: { include: { child: { select: { id: true, firstName: true, lastName: true, color: true } } } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
            },
        });
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
        family_service_1.FamilyService])
], EventsService);
//# sourceMappingURL=events.service.js.map