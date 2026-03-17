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
exports.CaregiversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let CaregiversService = class CaregiversService {
    prisma;
    familyService;
    constructor(prisma, familyService) {
        this.prisma = prisma;
        this.familyService = familyService;
    }
    async create(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const inviteToken = (0, uuid_1.v4)();
        const linkExpiresAt = this.calculateExpiry(dto.linkExpiry);
        return this.prisma.caregiver.create({
            data: {
                ...dto,
                familyId,
                createdBy: userId,
                inviteToken,
                linkExpiresAt,
            },
        });
    }
    async findAll(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.caregiver.findMany({
            where: {
                familyId,
                OR: [
                    { visibility: client_1.CaregiverVisibility.SHARED },
                    { createdBy: userId, visibility: client_1.CaregiverVisibility.PRIVATE },
                ],
            },
            include: { children: { include: { child: true } } },
        });
    }
    async findOne(familyId, caregiverId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const caregiver = await this.prisma.caregiver.findFirst({
            where: { id: caregiverId, familyId },
        });
        if (!caregiver)
            throw new common_1.NotFoundException('Caregiver not found');
        if (caregiver.visibility === client_1.CaregiverVisibility.PRIVATE &&
            caregiver.createdBy !== userId) {
            throw new common_1.ForbiddenException('Access denied to private caregiver');
        }
        return caregiver;
    }
    async update(familyId, caregiverId, userId, dto) {
        const caregiver = await this.findOne(familyId, caregiverId, userId);
        if (caregiver.createdBy !== userId)
            throw new common_1.ForbiddenException('Only creator can update');
        return this.prisma.caregiver.update({
            where: { id: caregiverId },
            data: {
                ...dto,
                ...(dto.linkExpiry && {
                    linkExpiresAt: this.calculateExpiry(dto.linkExpiry),
                }),
            },
        });
    }
    async remove(familyId, caregiverId, userId) {
        const caregiver = await this.findOne(familyId, caregiverId, userId);
        if (caregiver.createdBy !== userId)
            throw new common_1.ForbiddenException('Only creator can delete');
        await this.prisma.caregiver.delete({ where: { id: caregiverId } });
        return { message: 'Caregiver deleted' };
    }
    async assignToChild(familyId, caregiverId, childId, userId) {
        await this.findOne(familyId, caregiverId, userId);
        return this.prisma.childCaregiver.upsert({
            where: { childId_caregiverId: { childId, caregiverId } },
            create: { childId, caregiverId },
            update: {},
        });
    }
    async resolveByToken(token) {
        const caregiver = await this.prisma.caregiver.findUnique({
            where: { inviteToken: token },
            include: { children: { include: { child: true } } },
        });
        if (!caregiver)
            throw new common_1.NotFoundException('Invalid token');
        if (caregiver.linkExpiry !== client_1.CaregiverLinkExpiry.NEVER &&
            caregiver.linkExpiresAt &&
            caregiver.linkExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Invite link has expired');
        }
        return {
            name: caregiver.name,
            canViewCalendar: caregiver.canViewCalendar,
            canViewHealthInfo: caregiver.canViewHealthInfo,
            canViewEmergencyContacts: caregiver.canViewEmergencyContacts,
            children: caregiver.children.map((cc) => cc.child),
        };
    }
    calculateExpiry(expiry) {
        if (expiry === client_1.CaregiverLinkExpiry.NEVER)
            return null;
        const days = expiry === client_1.CaregiverLinkExpiry.SEVEN_DAYS ? 7 : 30;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
};
exports.CaregiversService = CaregiversService;
exports.CaregiversService = CaregiversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService])
], CaregiversService);
//# sourceMappingURL=caregivers.service.js.map