import { AuthUser } from '../common/types/auth-user';
import { HealthService } from './health.service';
import { CreateHealthRecordDto, UpdateHealthRecordDto, CreateMedicationDto, UpdateMedicationDto, CreateAllergyDto, CreateDocumentDto } from './dto/health.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getSummary(user: AuthUser, familyId: string, childId: string): Promise<{
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
    createRecord(user: AuthUser, familyId: string, dto: CreateHealthRecordDto): Promise<{
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
    getRecords(user: AuthUser, familyId: string, childId?: string): Promise<({
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
    getRecord(user: AuthUser, familyId: string, recordId: string): Promise<{
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
    updateRecord(user: AuthUser, familyId: string, recordId: string, dto: UpdateHealthRecordDto): Promise<{
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
    deleteRecord(user: AuthUser, familyId: string, recordId: string): Promise<{
        message: string;
    }>;
    uploadDocument(user: AuthUser, familyId: string, dto: CreateDocumentDto, file: Express.Multer.File): Promise<{
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
    getDocuments(user: AuthUser, familyId: string, childId?: string): Promise<({
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
    deleteDocument(user: AuthUser, familyId: string, documentId: string): Promise<{
        message: string;
    }>;
    createMedication(user: AuthUser, familyId: string, dto: CreateMedicationDto): Promise<{
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
    getMedications(user: AuthUser, familyId: string, childId?: string): Promise<({
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
    updateMedication(user: AuthUser, familyId: string, medicationId: string, dto: UpdateMedicationDto): Promise<{
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
    deleteMedication(user: AuthUser, familyId: string, medicationId: string): Promise<{
        message: string;
    }>;
    createAllergy(user: AuthUser, familyId: string, dto: CreateAllergyDto): Promise<{
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
    getAllergies(user: AuthUser, familyId: string, childId?: string): Promise<({
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
    deleteAllergy(user: AuthUser, familyId: string, allergyId: string): Promise<{
        message: string;
    }>;
}
