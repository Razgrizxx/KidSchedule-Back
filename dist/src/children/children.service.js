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
exports.ChildrenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const PLAN_CHILD_LIMITS = {
    FREE: 1,
    ESSENTIAL: 1,
    PLUS: 4,
    COMPLETE: Infinity,
};
let ChildrenService = class ChildrenService {
    prisma;
    familyService;
    constructor(prisma, familyService) {
        this.prisma = prisma;
        this.familyService = familyService;
    }
    async create(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        const plan = sub?.plan ?? 'FREE';
        const limit = PLAN_CHILD_LIMITS[plan] ?? 1;
        const currentCount = await this.prisma.child.count({ where: { familyId } });
        if (currentCount >= limit) {
            throw new common_1.ForbiddenException(`Your ${plan} plan allows up to ${limit} child profile${limit === 1 ? '' : 's'}. Upgrade your plan to add more.`);
        }
        return this.prisma.child.create({
            data: { ...dto, familyId, dateOfBirth: new Date(dto.dateOfBirth) },
        });
    }
    async findAll(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.child.findMany({
            where: { familyId },
            orderBy: { firstName: 'asc' },
        });
    }
    async findOne(familyId, childId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const child = await this.prisma.child.findFirst({
            where: { id: childId, familyId },
        });
        if (!child)
            throw new common_1.NotFoundException('Child not found');
        return child;
    }
    async update(familyId, childId, userId, dto) {
        await this.findOne(familyId, childId, userId);
        return this.prisma.child.update({
            where: { id: childId },
            data: {
                ...dto,
                ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
            },
        });
    }
    async remove(familyId, childId, userId) {
        await this.findOne(familyId, childId, userId);
        await this.prisma.child.delete({ where: { id: childId } });
        return { message: 'Child deleted' };
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map