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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const notifications_service_1 = require("../notifications/notifications.service");
let MessagingService = class MessagingService {
    prisma;
    familyService;
    notifications;
    constructor(prisma, familyService, notifications) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.notifications = notifications;
    }
    async send(familyId, senderId, dto) {
        await this.familyService.assertMember(familyId, senderId);
        const lastMessage = await this.prisma.message.findFirst({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
            select: { contentHash: true },
        });
        const previousHash = lastMessage?.contentHash ?? '0';
        const timestamp = new Date().toISOString();
        const contentHash = (0, crypto_1.createHash)('sha256')
            .update(`${dto.content}${timestamp}${previousHash}`)
            .digest('hex');
        const message = await this.prisma.message.create({
            data: {
                familyId,
                senderId,
                content: dto.content,
                attachmentUrl: dto.attachmentUrl,
                contentHash,
                previousHash,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        const senderName = message.sender
            ? `${message.sender.firstName} ${message.sender.lastName}`
            : 'Nuevo mensaje';
        const preview = dto.content.length > 80
            ? dto.content.slice(0, 80) + '…'
            : dto.content;
        void this.notifications.sendToFamily(familyId, senderId, {
            title: senderName,
            body: preview,
            data: { type: 'MESSAGE', familyId },
        }).catch(() => { });
        return message;
    }
    async findAll(familyId, userId, cursor, take = 50) {
        await this.familyService.assertMember(familyId, userId);
        const messages = await this.prisma.message.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
            take,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        return {
            messages: messages.reverse(),
            nextCursor: messages.length === take ? messages[0].id : null,
        };
    }
    async verifyChain(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const messages = await this.prisma.message.findMany({
            where: { familyId },
            orderBy: { createdAt: 'asc' },
        });
        let isValid = true;
        const violations = [];
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const expectedPrevHash = i === 0 ? '0' : messages[i - 1].contentHash;
            if (msg.previousHash !== expectedPrevHash) {
                isValid = false;
                violations.push(`Message ${msg.id} has broken chain link`);
            }
        }
        return { isValid, totalMessages: messages.length, violations };
    }
    async sendSystemMessage(familyId, content) {
        const lastMessage = await this.prisma.message.findFirst({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
            select: { contentHash: true },
        });
        const previousHash = lastMessage?.contentHash ?? '0';
        const timestamp = new Date().toISOString();
        const contentHash = (0, crypto_1.createHash)('sha256')
            .update(`${content}${timestamp}${previousHash}`)
            .digest('hex');
        const member = await this.prisma.familyMember.findFirst({
            where: { familyId },
        });
        if (!member)
            return;
        return this.prisma.message.create({
            data: {
                familyId,
                senderId: member.userId,
                content,
                contentHash,
                previousHash,
                isSystemMessage: true,
                status: 'DELIVERED',
            },
        });
    }
    async markRead(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        await this.prisma.message.updateMany({
            where: {
                familyId,
                senderId: { not: userId },
                status: { not: 'READ' },
            },
            data: { status: 'READ' },
        });
        return { message: 'Messages marked as read' };
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        notifications_service_1.NotificationsService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map