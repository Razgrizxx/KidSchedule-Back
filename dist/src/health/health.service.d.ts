import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateHealthRecordDto, UpdateHealthRecordDto, CreateMedicationDto, UpdateMedicationDto, CreateAllergyDto, CreateDocumentDto } from './dto/health.dto';
export declare class HealthService {
    private prisma;
    private familyService;
    private cloudinary;
    constructor(prisma: PrismaService, familyService: FamilyService, cloudinary: CloudinaryService);
    createRecord(familyId: string, userId: string, dto: CreateHealthRecordDto): Promise<{
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
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            recordId: string | null;
            id: string;
            createdAt: Date;
            familyId: string;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
    }>;
    getRecords(familyId: string, userId: string, childId?: string): Promise<({
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
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            recordId: string | null;
            id: string;
            createdAt: Date;
            familyId: string;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
    })[]>;
    getRecord(familyId: string, recordId: string, userId: string): Promise<{
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
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            recordId: string | null;
            id: string;
            createdAt: Date;
            familyId: string;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
    }>;
    updateRecord(familyId: string, recordId: string, userId: string, dto: UpdateHealthRecordDto): Promise<{
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
        documents: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            recordId: string | null;
            id: string;
            createdAt: Date;
            familyId: string;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
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
        childId: string;
        type: import("@prisma/client").$Enums.DocumentType;
        title: string;
        recordId: string | null;
        id: string;
        createdAt: Date;
        familyId: string;
        fileUrl: string;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
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
            type: import("@prisma/client").$Enums.HealthRecordType;
            title: string;
            id: string;
        } | null;
    } & {
        childId: string;
        type: import("@prisma/client").$Enums.DocumentType;
        title: string;
        recordId: string | null;
        id: string;
        createdAt: Date;
        familyId: string;
        fileUrl: string;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
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
        childId: string;
        notes: string | null;
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date | null;
        prescribedBy: string | null;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
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
        childId: string;
        notes: string | null;
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date | null;
        prescribedBy: string | null;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
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
        childId: string;
        notes: string | null;
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date | null;
        prescribedBy: string | null;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        createdBy: string;
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
        childId: string;
        notes: string | null;
        name: string;
        severity: import("@prisma/client").$Enums.AllergySeverity;
        id: string;
        createdAt: Date;
        familyId: string;
        createdBy: string;
    }>;
    getAllergies(familyId: string, userId: string, childId?: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        };
    } & {
        childId: string;
        notes: string | null;
        name: string;
        severity: import("@prisma/client").$Enums.AllergySeverity;
        id: string;
        createdAt: Date;
        familyId: string;
        createdBy: string;
    })[]>;
    deleteAllergy(familyId: string, allergyId: string, userId: string): Promise<{
        message: string;
    }>;
    getSummary(familyId: string, userId: string, childId: string): Promise<{
        recentRecords: {
            type: import("@prisma/client").$Enums.HealthRecordType;
            title: string;
            date: Date;
            doctorName: string | null;
            id: string;
        }[];
        activeMedications: {
            name: string;
            dosage: string;
            frequency: string;
            id: string;
        }[];
        allergies: {
            name: string;
            severity: import("@prisma/client").$Enums.AllergySeverity;
            id: string;
        }[];
        documentCount: number;
    }>;
}
