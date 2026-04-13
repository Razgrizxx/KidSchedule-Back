import { EmergencyContactRole } from '@prisma/client';
export declare class CreateEmergencyContactDto {
    childId: string;
    role: EmergencyContactRole;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    isPrimary?: boolean;
}
declare const UpdateEmergencyContactDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEmergencyContactDto>>;
export declare class UpdateEmergencyContactDto extends UpdateEmergencyContactDto_base {
}
export {};
