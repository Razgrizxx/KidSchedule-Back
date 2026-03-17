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
let SettingsService = class SettingsService {
    prisma;
    familyService;
    constructor(prisma, familyService) {
        this.prisma = prisma;
        this.familyService = familyService;
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map