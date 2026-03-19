import { CaregiverLinkExpiry, CaregiverVisibility } from '@prisma/client';
export declare class CreateCaregiverDto {
    name: string;
    phone?: string;
    email?: string;
    relationship?: string;
    visibility: CaregiverVisibility;
    linkExpiry: CaregiverLinkExpiry;
    canViewCalendar?: boolean;
    canViewHealthInfo?: boolean;
    canViewEmergencyContacts?: boolean;
    canViewAllergies?: boolean;
    sendEmail?: boolean;
}
declare const UpdateCaregiverDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCaregiverDto>>;
export declare class UpdateCaregiverDto extends UpdateCaregiverDto_base {
}
export {};
