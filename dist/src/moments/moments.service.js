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
exports.MomentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let MomentsService = class MomentsService {
    prisma;
    familyService;
    cloudinary;
    constructor(prisma, familyService, cloudinary) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.cloudinary = cloudinary;
    }
    async create(familyId, userId, dto, file) {
        await this.familyService.assertMember(familyId, userId);
        const result = await this.cloudinary.upload(file, `kidschedule/moments/${familyId}`);
        return this.prisma.moment.create({
            data: {
                familyId,
                uploadedBy: userId,
                childId: dto.childId,
                caption: dto.caption,
                mediaUrl: result.secure_url,
                cloudinaryPublicId: result.public_id,
            },
            include: {
                uploader: { select: { id: true, firstName: true, lastName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
    }
    async findAll(familyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.moment.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
            include: {
                uploader: { select: { id: true, firstName: true, lastName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
    }
    async remove(familyId, momentId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const moment = await this.prisma.moment.findFirst({
            where: { id: momentId, familyId },
        });
        if (!moment)
            throw new common_1.NotFoundException('Moment not found');
        if (moment.uploadedBy !== userId)
            throw new common_1.ForbiddenException('Only uploader can delete');
        if (moment.cloudinaryPublicId) {
            await this.cloudinary.delete(moment.cloudinaryPublicId);
        }
        await this.prisma.moment.delete({ where: { id: momentId } });
        return { message: 'Moment deleted' };
    }
};
exports.MomentsService = MomentsService;
exports.MomentsService = MomentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        cloudinary_service_1.CloudinaryService])
], MomentsService);
//# sourceMappingURL=moments.service.js.map