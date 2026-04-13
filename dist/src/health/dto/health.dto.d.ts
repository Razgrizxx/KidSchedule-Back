import { HealthRecordType, DocumentType, AllergySeverity } from '@prisma/client';
export declare class CreateHealthRecordDto {
    childId: string;
    type: HealthRecordType;
    title: string;
    date: string;
    doctorName?: string;
    notes?: string;
}
export declare class UpdateHealthRecordDto {
    type?: HealthRecordType;
    title?: string;
    date?: string;
    doctorName?: string;
    notes?: string;
}
export declare class CreateMedicationDto {
    childId: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy?: string;
    notes?: string;
}
export declare class UpdateMedicationDto {
    dosage?: string;
    frequency?: string;
    endDate?: string;
    notes?: string;
    isActive?: boolean;
}
export declare class CreateAllergyDto {
    childId: string;
    name: string;
    severity: AllergySeverity;
    notes?: string;
}
export declare class CreateDocumentDto {
    childId: string;
    recordId?: string;
    type: DocumentType;
    title: string;
}
