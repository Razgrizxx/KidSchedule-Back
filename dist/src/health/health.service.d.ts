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
            title: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.HealthRecordType;
        date: Date;
        title: string;
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
            title: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.HealthRecordType;
        date: Date;
        title: string;
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
            title: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.HealthRecordType;
        date: Date;
        title: string;
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
            title: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.HealthRecordType;
        date: Date;
        title: string;
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
        title: string;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
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
        title: string;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        startDate: Date;
        isActive: boolean;
        frequency: string;
        endDate: Date | null;
        dosage: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        startDate: Date;
        isActive: boolean;
        frequency: string;
        endDate: Date | null;
        dosage: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        startDate: Date;
        isActive: boolean;
        frequency: string;
        endDate: Date | null;
        dosage: string;
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
        id: string;
        createdAt: Date;
        name: string;
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
        id: string;
        createdAt: Date;
        name: string;
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
            id: string;
            type: import("@prisma/client").$Enums.HealthRecordType;
            date: Date;
            title: string;
            doctorName: string | null;
        }[];
        activeMedications: {
            id: string;
            name: string;
            frequency: string;
            dosage: string;
        }[];
        allergies: {
            id: string;
            name: string;
            severity: import("@prisma/client").$Enums.AllergySeverity;
        }[];
        documentCount: number;
    }>;
}
