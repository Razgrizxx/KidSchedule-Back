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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(dto) {
        try {
            await this.prisma.custodyAuditLog.create({ data: dto });
        }
        catch {
        }
    }
    async findAll(familyId, params = {}) {
        const { from, to, childId, action, take = 50, cursor } = params;
        const where = {
            familyId,
            ...(childId && { childId }),
            ...(action && { action }),
            ...((from || to) && {
                createdAt: {
                    ...(from && { gte: new Date(from + 'T00:00:00.000Z') }),
                    ...(to && { lte: new Date(to + 'T23:59:59.999Z') }),
                },
            }),
        };
        const rows = await this.prisma.custodyAuditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: {
                actor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                child: { select: { id: true, firstName: true, color: true } },
                changeRequest: { select: { id: true, type: true, status: true } },
            },
        });
        return {
            logs: rows,
            nextCursor: rows.length === take ? rows[rows.length - 1].id : null,
        };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map