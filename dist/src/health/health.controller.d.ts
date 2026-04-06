import { AuthUser } from '../common/interfaces/auth-user.interface';
import { HealthService } from './health.service';
import { CreateHealthRecordDto, UpdateHealthRecordDto, CreateMedicationDto, UpdateMedicationDto, CreateAllergyDto, CreateDocumentDto } from './dto/health.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getSummary(user: AuthUser, familyId: string, childId: string): Promise<{
        recentRecords: {
            id: string;
            type: import("@prisma/client").$Enums.HealthRecordType;
            title: string;
            date: Date;
            doctorName: string | null;
        }[];
        activeMedications: {
            id: string;
            name: string;
            dosage: string;
            frequency: string;
        }[];
        allergies: {
            id: string;
            name: string;
            severity: import("@prisma/client").$Enums.AllergySeverity;
        }[];
        documentCount: number;
    }>;
    createRecord(user: AuthUser, familyId: string, dto: CreateHealthRecordDto): Promise<{
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
            id: string;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            createdAt: Date;
            recordId: string | null;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        id: string;
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRecords(user: AuthUser, familyId: string, childId?: string): Promise<({
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
            id: string;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            createdAt: Date;
            recordId: string | null;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        id: string;
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getRecord(user: AuthUser, familyId: string, recordId: string): Promise<{
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
            id: string;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            createdAt: Date;
            recordId: string | null;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        id: string;
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRecord(user: AuthUser, familyId: string, recordId: string, dto: UpdateHealthRecordDto): Promise<{
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
            id: string;
            familyId: string;
            childId: string;
            type: import("@prisma/client").$Enums.DocumentType;
            title: string;
            createdAt: Date;
            recordId: string | null;
            fileUrl: string;
            cloudinaryPublicId: string | null;
            uploadedBy: string;
        })[];
    } & {
        id: string;
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        date: Date;
        doctorName: string | null;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
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
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.DocumentType;
        title: string;
        createdAt: Date;
        recordId: string | null;
        fileUrl: string;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
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
        familyId: string;
        childId: string;
        type: import("@prisma/client").$Enums.DocumentType;
        title: string;
        createdAt: Date;
        recordId: string | null;
        fileUrl: string;
        cloudinaryPublicId: string | null;
        uploadedBy: string;
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
        id: string;
        familyId: string;
        childId: string;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date | null;
        prescribedBy: string | null;
        isActive: boolean;
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
        id: string;
        familyId: string;
        childId: string;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date | null;
        prescribedBy: string | null;
        isActive: boolean;
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
        id: string;
        familyId: string;
        childId: string;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date | null;
        prescribedBy: string | null;
        isActive: boolean;
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
        id: string;
        familyId: string;
        childId: string;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        name: string;
        severity: import("@prisma/client").$Enums.AllergySeverity;
    }>;
    getAllergies(user: AuthUser, familyId: string, childId?: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        };
    } & {
        id: string;
        familyId: string;
        childId: string;
        notes: string | null;
        createdBy: string;
        createdAt: Date;
        name: string;
        severity: import("@prisma/client").$Enums.AllergySeverity;
    })[]>;
    deleteAllergy(user: AuthUser, familyId: string, allergyId: string): Promise<{
        message: string;
    }>;
}
