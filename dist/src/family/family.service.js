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
exports.FamilyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const client_1 = require("@prisma/client");
let FamilyService = class FamilyService {
    prisma;
    mail;
    config;
    constructor(prisma, mail, config) {
        this.prisma = prisma;
        this.mail = mail;
        this.config = config;
    }
    async create(userId, dto) {
        const family = await this.prisma.family.create({
            data: {
                name: dto.name,
                members: {
                    create: { userId, role: client_1.UserRole.PARENT },
                },
            },
            include: { members: true },
        });
        return family;
    }
    async findAllForUser(userId) {
        return this.prisma.family.findMany({
            where: { members: { some: { userId } } },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                children: true,
            },
        });
    }
    async findOne(familyId, userId) {
        await this.assertMember(familyId, userId);
        return this.prisma.family.findUnique({
            where: { id: familyId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                children: true,
            },
        });
    }
    async inviteMember(familyId, inviterId, dto) {
        await this.assertMember(familyId, inviterId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const [invitation, family, inviter] = await Promise.all([
            this.prisma.familyInvitation.create({
                data: { familyId, invitedBy: inviterId, email: dto.email, expiresAt },
            }),
            this.prisma.family.findUnique({
                where: { id: familyId },
                include: { children: true },
            }),
            this.prisma.user.findUnique({ where: { id: inviterId } }),
        ]);
        if (family && inviter) {
            void this.mail.sendCoParentInvitation({
                toEmail: dto.email,
                inviterName: `${inviter.firstName} ${inviter.lastName}`,
                familyName: family.name,
                childrenNames: family.children.map((c) => c.firstName),
                token: invitation.token,
            });
        }
        return { message: 'Invitation sent', token: invitation.token };
    }
    async verifyInvitation(token) {
        const invitation = await this.prisma.familyInvitation.findUnique({
            where: { token },
            include: {
                family: true,
                inviter: { select: { firstName: true, lastName: true } },
            },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        if (invitation.status !== 'PENDING')
            throw new common_1.BadRequestException('Invitation already used');
        if (invitation.expiresAt < new Date())
            throw new common_1.BadRequestException('Invitation expired');
        return {
            familyId: invitation.familyId,
            familyName: invitation.family.name,
            inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
            email: invitation.email,
        };
    }
    async acceptInvitation(token, userId) {
        const invitation = await this.prisma.familyInvitation.findUnique({
            where: { token },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        if (invitation.status !== 'PENDING')
            throw new common_1.BadRequestException('Invitation already used');
        if (invitation.expiresAt < new Date())
            throw new common_1.BadRequestException('Invitation expired');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user?.email !== invitation.email)
            throw new common_1.ForbiddenException('Email mismatch');
        await this.prisma.$transaction([
            this.prisma.familyInvitation.update({
                where: { token },
                data: { status: 'ACCEPTED', respondedAt: new Date() },
            }),
            this.prisma.familyMember.upsert({
                where: { familyId_userId: { familyId: invitation.familyId, userId } },
                create: {
                    familyId: invitation.familyId,
                    userId,
                    role: client_1.UserRole.PARENT,
                },
                update: {},
            }),
        ]);
        return {
            message: 'Joined family successfully',
            familyId: invitation.familyId,
        };
    }
    async assertMember(familyId, userId) {
        const member = await this.prisma.familyMember.findUnique({
            where: { familyId_userId: { familyId, userId } },
        });
        if (!member)
            throw new common_1.ForbiddenException('Not a member of this family');
        return member;
    }
};
exports.FamilyService = FamilyService;
exports.FamilyService = FamilyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        config_1.ConfigService])
], FamilyService);
//# sourceMappingURL=family.service.js.map