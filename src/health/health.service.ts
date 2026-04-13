import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  CreateHealthRecordDto,
  UpdateHealthRecordDto,
  CreateMedicationDto,
  UpdateMedicationDto,
  CreateAllergyDto,
  CreateDocumentDto,
} from './dto/health.dto';

const RECORD_INCLUDE = {
  child: { select: { id: true, firstName: true, color: true } },
  uploader: { select: { id: true, firstName: true, lastName: true } },
  documents: {
    orderBy: { createdAt: 'desc' as const },
    include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
  },
};

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private cloudinary: CloudinaryService,
  ) {}

  // ── Health Records ────────────────────────────────────────────────────────

  async createRecord(familyId: string, userId: string, dto: CreateHealthRecordDto) {
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

  async getRecords(familyId: string, userId: string, childId?: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.healthRecord.findMany({
      where: { familyId, ...(childId ? { childId } : {}) },
      orderBy: { date: 'desc' },
      include: RECORD_INCLUDE,
    });
  }

  async getRecord(familyId: string, recordId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const record = await this.prisma.healthRecord.findFirst({
      where: { id: recordId, familyId },
      include: RECORD_INCLUDE,
    });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async updateRecord(familyId: string, recordId: string, userId: string, dto: UpdateHealthRecordDto) {
    await this.familyService.assertMember(familyId, userId);
    const record = await this.prisma.healthRecord.findFirst({ where: { id: recordId, familyId } });
    if (!record) throw new NotFoundException('Record not found');
    return this.prisma.healthRecord.update({
      where: { id: recordId },
      data: {
        ...dto,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
      include: RECORD_INCLUDE,
    });
  }

  async deleteRecord(familyId: string, recordId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const record = await this.prisma.healthRecord.findFirst({
      where: { id: recordId, familyId },
      include: { documents: true },
    });
    if (!record) throw new NotFoundException('Record not found');

    // Delete associated documents from Cloudinary
    for (const doc of record.documents) {
      if (doc.cloudinaryPublicId) {
        await this.cloudinary.delete(doc.cloudinaryPublicId).catch(() => {});
      }
    }

    await this.prisma.healthRecord.delete({ where: { id: recordId } });
    return { message: 'Record deleted' };
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  async uploadDocument(
    familyId: string,
    userId: string,
    dto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    await this.familyService.assertMember(familyId, userId);

    if (dto.recordId) {
      const record = await this.prisma.healthRecord.findFirst({ where: { id: dto.recordId, familyId } });
      if (!record) throw new NotFoundException('Record not found');
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

  async getDocuments(familyId: string, userId: string, childId?: string) {
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

  async deleteDocument(familyId: string, documentId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const doc = await this.prisma.healthDocument.findFirst({ where: { id: documentId, familyId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.uploadedBy !== userId) throw new ForbiddenException('Only uploader can delete');

    if (doc.cloudinaryPublicId) {
      await this.cloudinary.delete(doc.cloudinaryPublicId).catch(() => {});
    }

    await this.prisma.healthDocument.delete({ where: { id: documentId } });
    return { message: 'Document deleted' };
  }

  // ── Medications ───────────────────────────────────────────────────────────

  async createMedication(familyId: string, userId: string, dto: CreateMedicationDto) {
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

  async getMedications(familyId: string, userId: string, childId?: string) {
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

  async updateMedication(familyId: string, medicationId: string, userId: string, dto: UpdateMedicationDto) {
    await this.familyService.assertMember(familyId, userId);
    const med = await this.prisma.medication.findFirst({ where: { id: medicationId, familyId } });
    if (!med) throw new NotFoundException('Medication not found');
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

  async deleteMedication(familyId: string, medicationId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const med = await this.prisma.medication.findFirst({ where: { id: medicationId, familyId } });
    if (!med) throw new NotFoundException('Medication not found');
    await this.prisma.medication.delete({ where: { id: medicationId } });
    return { message: 'Medication deleted' };
  }

  // ── Allergies ─────────────────────────────────────────────────────────────

  async createAllergy(familyId: string, userId: string, dto: CreateAllergyDto) {
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

  async getAllergies(familyId: string, userId: string, childId?: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.allergy.findMany({
      where: { familyId, ...(childId ? { childId } : {}) },
      orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
      include: {
        child: { select: { id: true, firstName: true, color: true } },
      },
    });
  }

  async deleteAllergy(familyId: string, allergyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const allergy = await this.prisma.allergy.findFirst({ where: { id: allergyId, familyId } });
    if (!allergy) throw new NotFoundException('Allergy not found');
    await this.prisma.allergy.delete({ where: { id: allergyId } });
    return { message: 'Allergy deleted' };
  }

  // ── Summary per child (for dashboard card) ───────────────────────────────

  async getSummary(familyId: string, userId: string, childId: string) {
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
}
