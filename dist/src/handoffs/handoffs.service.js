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
exports.HandoffsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const audit_service_1 = require("../audit/audit.service");
const INCLUDE = {
    child: { select: { id: true, firstName: true, color: true } },
    fromParent: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    toParent: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
};
let HandoffsService = class HandoffsService {
    prisma;
    familyService;
    audit;
    constructor(prisma, familyService, audit) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.audit = audit;
    }
    async create(familyId, actorId, dto) {
        await this.familyService.assertMember(familyId, actorId);
        const handoff = await this.prisma.handoffLog.create({
            data: {
                familyId,
                childId: dto.childId,
                handoffAt: new Date(dto.handoffAt),
                fromParentId: actorId,
                toParentId: dto.toParentId,
                location: dto.location,
                notes: dto.notes,
            },
            include: INCLUDE,
        });
        void this.audit.log({
            familyId,
            actorId,
            action: 'EVENT_CREATED',
            childId: dto.childId,
            affectedDate: new Date(dto.handoffAt),
            notes: `Handoff registrado → ${handoff.toParent.firstName} ${handoff.toParent.lastName}`,
        });
        return handoff;
    }
    async findAll(familyId, userId, opts) {
        await this.familyService.assertMember(familyId, userId);
        const { childId, from, to, take = 30, cursor } = opts;
        const rows = await this.prisma.handoffLog.findMany({
            where: {
                familyId,
                ...(childId && { childId }),
                ...((from || to) && {
                    handoffAt: {
                        ...(from && { gte: new Date(from + 'T00:00:00.000Z') }),
                        ...(to && { lte: new Date(to + 'T23:59:59.999Z') }),
                    },
                }),
            },
            orderBy: { handoffAt: 'desc' },
            take,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: INCLUDE,
        });
        return {
            handoffs: rows,
            nextCursor: rows.length === take ? rows[rows.length - 1].id : null,
        };
    }
    async confirm(familyId, handoffId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const handoff = await this.prisma.handoffLog.findFirst({
            where: { id: handoffId, familyId },
        });
        if (!handoff)
            throw new common_1.NotFoundException('Handoff not found');
        if (handoff.toParentId !== userId) {
            throw new common_1.ForbiddenException('Only the receiving parent can confirm this handoff');
        }
        if (handoff.confirmedBy) {
            throw new common_1.ForbiddenException('Handoff already confirmed');
        }
        return this.prisma.handoffLog.update({
            where: { id: handoffId },
            data: { confirmedBy: userId, confirmedAt: new Date() },
            include: INCLUDE,
        });
    }
    async remove(familyId, handoffId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const handoff = await this.prisma.handoffLog.findFirst({
            where: { id: handoffId, familyId },
        });
        if (!handoff)
            throw new common_1.NotFoundException('Handoff not found');
        if (handoff.fromParentId !== userId) {
            throw new common_1.ForbiddenException('Only the parent who logged this handoff can delete it');
        }
        if (handoff.confirmedBy) {
            throw new common_1.ForbiddenException('Cannot delete a confirmed handoff');
        }
        await this.prisma.handoffLog.delete({ where: { id: handoffId } });
        return { message: 'Handoff deleted' };
    }
};
exports.HandoffsService = HandoffsService;
exports.HandoffsService = HandoffsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        audit_service_1.AuditService])
], HandoffsService);
//# sourceMappingURL=handoffs.service.js.map