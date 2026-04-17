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
const storage_service_1 = require("../storage/storage.service");
const notifications_service_1 = require("../notifications/notifications.service");
const subscription_service_1 = require("../stripe/subscription.service");
let MomentsService = class MomentsService {
    prisma;
    familyService;
    storage;
    subService;
    notifications;
    constructor(prisma, familyService, storage, subService, notifications) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.storage = storage;
        this.subService = subService;
        this.notifications = notifications;
    }
    async create(familyId, userId, dto, file) {
        await this.familyService.assertMember(familyId, userId);
        const hasUnlimited = await this.subService.hasFeature(userId, 'moments_unlimited');
        if (!hasUnlimited) {
            const count = await this.prisma.moment.count({ where: { familyId } });
            if (count >= subscription_service_1.FREE_MOMENTS_LIMIT) {
                throw new common_1.ForbiddenException(`Free plan is limited to ${subscription_service_1.FREE_MOMENTS_LIMIT} photos. Upgrade to Plus to upload unlimited moments.`);
            }
        }
        const result = await this.storage.upload(file, `kidschedule/moments/${familyId}`);
        const moment = await this.prisma.moment.create({
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
        const uploaderName = moment.uploader
            ? `${moment.uploader.firstName} ${moment.uploader.lastName}`
            : 'Your co-parent';
        const childName = moment.child?.firstName ?? '';
        void this.notifications.sendToFamily(familyId, userId, {
            title: `${uploaderName} shared a moment`,
            body: moment.caption
                ? `${childName}: ${moment.caption}`
                : `New photo of ${childName}`,
            data: { type: 'MOMENT', familyId, momentId: moment.id },
        }).catch(() => { });
        return moment;
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
            await this.storage.delete(moment.cloudinaryPublicId);
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
        storage_service_1.LocalStorageService,
        subscription_service_1.SubscriptionService,
        notifications_service_1.NotificationsService])
], MomentsService);
//# sourceMappingURL=moments.service.js.map