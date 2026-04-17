import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { LocalStorageService } from '../storage/storage.service';
import { CreateHealthRecordDto, UpdateHealthRecordDto, CreateMedicationDto, UpdateMedicationDto, CreateAllergyDto, CreateDocumentDto } from './dto/health.dto';
export declare class HealthService {
    private prisma;
    private familyService;
    private storage;
    constructor(prisma: PrismaService, familyService: FamilyService, storage: LocalStorageService);
    createRecord(familyId: string, userId: string, dto: CreateHealthRecordDto): Promise<{
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
            title: string;
            recordId: string | null;
            fileUrl: string;
        })[];
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        notes: string | null;
        doctorName: string | null;
    }>;
    getRecords(familyId: string, userId: string, childId?: string): Promise<({
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
            title: string;
            recordId: string | null;
            fileUrl: string;
        })[];
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        notes: string | null;
        doctorName: string | null;
    })[]>;
    getRecord(familyId: string, recordId: string, userId: string): Promise<{
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
            title: string;
            recordId: string | null;
            fileUrl: string;
        })[];
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        notes: string | null;
        doctorName: string | null;
    }>;
    updateRecord(familyId: string, recordId: string, userId: string, dto: UpdateHealthRecordDto): Promise<{
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
            title: string;
            recordId: string | null;
            fileUrl: string;
        })[];
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        notes: string | null;
        doctorName: string | null;
    }>;
    deleteRecord(familyId: string, recordId: string, userId: string): Promise<{
        message: string;
    }>;
    uploadDocument(familyId: string, userId: string, dto: CreateDocumentDto, file: Express.Multer.File): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.DocumentType;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
        title: string;
        recordId: string | null;
        fileUrl: string;
    }>;
    getDocuments(familyId: string, userId: string, childId?: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
        record: {
            id: string;
            type: import("@prisma/client").$Enums.HealthRecordType;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.DocumentType;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
        title: string;
        recordId: string | null;
        fileUrl: string;
    })[]>;
    deleteDocument(familyId: string, documentId: string, userId: string): Promise<{
        message: string;
    }>;
    createMedication(familyId: string, userId: string, dto: CreateMedicationDto): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        startDate: Date;
        isActive: boolean;
        notes: string | null;
        dosage: string;
        frequency: string;
        endDate: Date | null;
        prescribedBy: string | null;
    }>;
    getMedications(familyId: string, userId: string, childId?: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        startDate: Date;
        isActive: boolean;
        notes: string | null;
        dosage: string;
        frequency: string;
        endDate: Date | null;
        prescribedBy: string | null;
    })[]>;
    updateMedication(familyId: string, medicationId: string, userId: string, dto: UpdateMedicationDto): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        startDate: Date;
        isActive: boolean;
        notes: string | null;
        dosage: string;
        frequency: string;
        endDate: Date | null;
        prescribedBy: string | null;
    }>;
    deleteMedication(familyId: string, medicationId: string, userId: string): Promise<{
        message: string;
    }>;
    createAllergy(familyId: string, userId: string, dto: CreateAllergyDto): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        severity: import("@prisma/client").$Enums.AllergySeverity;
    }>;
    getAllergies(familyId: string, userId: string, childId?: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        severity: import("@prisma/client").$Enums.AllergySeverity;
    })[]>;
    deleteAllergy(familyId: string, allergyId: string, userId: string): Promise<{
        message: string;
    }>;
    getSummary(familyId: string, userId: string, childId: string): Promise<{
        recentRecords: {
            date: Date;
            id: string;
            type: import("@prisma/client").$Enums.HealthRecordType;
            title: string;
            doctorName: string | null;
        }[];
        activeMedications: {
            name: string;
            id: string;
            dosage: string;
            frequency: string;
        }[];
        allergies: {
            name: string;
            id: string;
            severity: import("@prisma/client").$Enums.AllergySeverity;
        }[];
        documentCount: number;
    }>;
}
