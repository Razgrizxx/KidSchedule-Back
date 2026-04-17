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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const storage_service_1 = require("../storage/storage.service");
let SettingsService = class SettingsService {
    prisma;
    familyService;
    storage;
    constructor(prisma, familyService, storage) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.storage = storage;
    }
    async getFamilySettings(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.familySettings.upsert({
            where: { familyId },
            create: { familyId },
            update: {},
        });
    }
    async updateFamilySettings(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.familySettings.upsert({
            where: { familyId },
            create: { familyId, ...dto },
            update: dto,
        });
    }
    async getUserSettings(userId) {
        return this.prisma.userSettings.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
    }
    async updateUserSettings(userId, dto) {
        return this.prisma.userSettings.upsert({
            where: { userId },
            create: { userId, ...dto },
            update: dto,
        });
    }
    async registerFcmToken(userId, token) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true },
        });
        if (user && !user.fcmTokens.includes(token)) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { fcmTokens: { push: token } },
            });
        }
        return { ok: true };
    }
    async removeFcmToken(userId, token) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true },
        });
        if (user) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { fcmTokens: { set: user.fcmTokens.filter((t) => t !== token) } },
            });
        }
        return { ok: true };
    }
    async uploadAvatar(userId, file) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { avatarUrl: true },
        });
        if (user?.avatarUrl?.startsWith('/uploads/')) {
            const publicId = user.avatarUrl.replace(/^\/uploads\//, '');
            await this.storage.delete(publicId).catch(() => null);
        }
        const result = await this.storage.upload(file, `kidschedule/avatars`);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: result.secure_url },
            select: { avatarUrl: true },
        });
        return { avatarUrl: updated.avatarUrl };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        storage_service_1.LocalStorageService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map