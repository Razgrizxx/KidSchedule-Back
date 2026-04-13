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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_service_1 = require("../family/family.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const RECORD_INCLUDE = {
    child: { select: { id: true, firstName: true, color: true } },
    uploader: { select: { id: true, firstName: true, lastName: true } },
    documents: {
        orderBy: { createdAt: 'desc' },
        include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
    },
};
let HealthService = class HealthService {
    prisma;
    familyService;
    cloudinary;
    constructor(prisma, familyService, cloudinary) {
        this.prisma = prisma;
        this.familyService = familyService;
        this.cloudinary = cloudinary;
    }
    async createRecord(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.healthRecord.create({
            data: {
                familyId,
                childId: dto.childId,
                type: dto.type,
                title: dto.title,
                date: new Date(dto.date),
                doctorName: dto.doctorName,
                notes: dto.notes,
                createdBy: userId,
            },
            include: RECORD_INCLUDE,
        });
    }
    async getRecords(familyId, userId, childId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.healthRecord.findMany({
            where: { familyId, ...(childId ? { childId } : {}) },
            orderBy: { date: 'desc' },
            include: RECORD_INCLUDE,
        });
    }
    async getRecord(familyId, recordId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const record = await this.prisma.healthRecord.findFirst({
            where: { id: recordId, familyId },
            include: RECORD_INCLUDE,
        });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        return record;
    }
    async updateRecord(familyId, recordId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const record = await this.prisma.healthRecord.findFirst({ where: { id: recordId, familyId } });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        return this.prisma.healthRecord.update({
            where: { id: recordId },
            data: {
                ...dto,
                ...(dto.date ? { date: new Date(dto.date) } : {}),
            },
            include: RECORD_INCLUDE,
        });
    }
    async deleteRecord(familyId, recordId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const record = await this.prisma.healthRecord.findFirst({
            where: { id: recordId, familyId },
            include: { documents: true },
        });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        for (const doc of record.documents) {
            if (doc.cloudinaryPublicId) {
                await this.cloudinary.delete(doc.cloudinaryPublicId).catch(() => { });
            }
        }
        await this.prisma.healthRecord.delete({ where: { id: recordId } });
        return { message: 'Record deleted' };
    }
    async uploadDocument(familyId, userId, dto, file) {
        await this.familyService.assertMember(familyId, userId);
        if (dto.recordId) {
            const record = await this.prisma.healthRecord.findFirst({ where: { id: dto.recordId, familyId } });
            if (!record)
                throw new common_1.NotFoundException('Record not found');
        }
        const result = await this.cloudinary.upload(file, `kidschedule/health/${familyId}`);
        return this.prisma.healthDocument.create({
            data: {
                familyId,
                childId: dto.childId,
                recordId: dto.recordId,
                type: dto.type,
                title: dto.title,
                fileUrl: result.secure_url,
                cloudinaryPublicId: result.public_id,
                uploadedBy: userId,
            },
            include: {
                uploader: { select: { id: true, firstName: true, lastName: true } },
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
    }
    async getDocuments(familyId, userId, childId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.healthDocument.findMany({
            where: { familyId, ...(childId ? { childId } : {}) },
            orderBy: { createdAt: 'desc' },
            include: {
                uploader: { select: { id: true, firstName: true, lastName: true } },
                child: { select: { id: true, firstName: true, color: true } },
                record: { select: { id: true, title: true, type: true } },
            },
        });
    }
    async deleteDocument(familyId, documentId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const doc = await this.prisma.healthDocument.findFirst({ where: { id: documentId, familyId } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        if (doc.uploadedBy !== userId)
            throw new common_1.ForbiddenException('Only uploader can delete');
        if (doc.cloudinaryPublicId) {
            await this.cloudinary.delete(doc.cloudinaryPublicId).catch(() => { });
        }
        await this.prisma.healthDocument.delete({ where: { id: documentId } });
        return { message: 'Document deleted' };
    }
    async createMedication(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.medication.create({
            data: {
                familyId,
                childId: dto.childId,
                name: dto.name,
                dosage: dto.dosage,
                frequency: dto.frequency,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                prescribedBy: dto.prescribedBy,
                notes: dto.notes,
                createdBy: userId,
            },
            include: {
                child: { select: { id: true, firstName: true, color: true } },
                uploader: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async getMedications(familyId, userId, childId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.medication.findMany({
            where: { familyId, ...(childId ? { childId } : {}) },
            orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
            include: {
                child: { select: { id: true, firstName: true, color: true } },
                uploader: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async updateMedication(familyId, medicationId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        const med = await this.prisma.medication.findFirst({ where: { id: medicationId, familyId } });
        if (!med)
            throw new common_1.NotFoundException('Medication not found');
        return this.prisma.medication.update({
            where: { id: medicationId },
            data: {
                ...dto,
                ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
            },
            include: {
                child: { select: { id: true, firstName: true, color: true } },
                uploader: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async deleteMedication(familyId, medicationId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const med = await this.prisma.medication.findFirst({ where: { id: medicationId, familyId } });
        if (!med)
            throw new common_1.NotFoundException('Medication not found');
        await this.prisma.medication.delete({ where: { id: medicationId } });
        return { message: 'Medication deleted' };
    }
    async createAllergy(familyId, userId, dto) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.allergy.create({
            data: {
                familyId,
                childId: dto.childId,
                name: dto.name,
                severity: dto.severity,
                notes: dto.notes,
                createdBy: userId,
            },
            include: {
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
    }
    async getAllergies(familyId, userId, childId) {
        await this.familyService.assertMember(familyId, userId);
        return this.prisma.allergy.findMany({
            where: { familyId, ...(childId ? { childId } : {}) },
            orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
            include: {
                child: { select: { id: true, firstName: true, color: true } },
            },
        });
    }
    async deleteAllergy(familyId, allergyId, userId) {
        await this.familyService.assertMember(familyId, userId);
        const allergy = await this.prisma.allergy.findFirst({ where: { id: allergyId, familyId } });
        if (!allergy)
            throw new common_1.NotFoundException('Allergy not found');
        await this.prisma.allergy.delete({ where: { id: allergyId } });
        return { message: 'Allergy deleted' };
    }
    async getSummary(familyId, userId, childId) {
        await this.familyService.assertMember(familyId, userId);
        const [recentRecords, activeMedications, allergies, documentCount] = await Promise.all([
            this.prisma.healthRecord.findMany({
                where: { familyId, childId },
                orderBy: { date: 'desc' },
                take: 3,
                select: { id: true, type: true, title: true, date: true, doctorName: true },
            }),
            this.prisma.medication.findMany({
                where: { familyId, childId, isActive: true },
                select: { id: true, name: true, dosage: true, frequency: true },
            }),
            this.prisma.allergy.findMany({
                where: { familyId, childId },
                select: { id: true, name: true, severity: true },
            }),
            this.prisma.healthDocument.count({ where: { familyId, childId } }),
        ]);
        return { recentRecords, activeMedications, allergies, documentCount };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_service_1.FamilyService,
        cloudinary_service_1.CloudinaryService])
], HealthService);
//# sourceMappingURL=health.service.js.map