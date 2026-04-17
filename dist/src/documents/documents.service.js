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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let DocumentsService = class DocumentsService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async upload(familyId, userId, file, body) {
        const result = await this.storage.upload(file, `kidschedule/families/${familyId}/documents`, 'raw');
        return this.prisma.familyDocument.create({
            data: {
                familyId,
                uploadedBy: userId,
                childId: body.childId || null,
                category: body.category,
                title: body.title,
                description: body.description,
                fileUrl: result.secure_url,
                cloudinaryPublicId: result.public_id,
                mimeType: file.mimetype,
            },
            include: { uploader: { select: { id: true, firstName: true } } },
        });
    }
    async findAll(familyId, childId, category) {
        return this.prisma.familyDocument.findMany({
            where: {
                familyId,
                ...(childId && { childId }),
                ...(category && { category }),
            },
            include: {
                uploader: { select: { id: true, firstName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(familyId, id, userId) {
        const doc = await this.prisma.familyDocument.findFirst({ where: { id, familyId } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        if (doc.uploadedBy !== userId)
            throw new common_1.ForbiddenException('Only the uploader can delete');
        await this.storage.delete(doc.cloudinaryPublicId);
        await this.prisma.familyDocument.delete({ where: { id } });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.LocalStorageService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map