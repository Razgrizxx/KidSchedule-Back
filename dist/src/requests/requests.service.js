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
let RequestsService = class RequestsService {
    prisma;
    familyService;
    constructor(prisma, familyService) {
        this.prisma = prisma;
        this.familyService = familyService;
    }
    async create(familyId, requesterId, dto) {
        await this.familyService.assertMember(familyId, requesterId);
        return this.prisma.changeRequest.create({
            data: {
                familyId,
                requesterId,
                type: dto.type,
                originalDate: new Date(dto.originalDate),
                requestedDate: new Date(dto.requestedDate),
                childId: dto.childId,
                reason: dto.reason,
            },
            include: {
                requester: { select: { id: true, firstName: true, lastName: true } },
            },
        });
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
        });
        if (!request)
            throw new common_1.NotFoundException('Change request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already resolved');
        if (request.requesterId === responderId) {
            throw new common_1.ForbiddenException('Cannot respond to your own request');
        }
        if (dto.action === 'COUNTER_PROPOSED' && !dto.counterDate) {
            throw new common_1.BadRequestException('counterDate is required for counter proposals');
        }
        return this.prisma.changeRequest.update({
            where: { id: requestId },
            data: {
                status: dto.action,
                responderId,
                counterDate: dto.counterDate ? new Date(dto.counterDate) : undefined,
                counterReason: dto.counterReason,
                resolvedAt: dto.action !== 'COUNTER_PROPOSED' ? new Date() : undefined,
            },
        });
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map