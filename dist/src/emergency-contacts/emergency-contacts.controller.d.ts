import { EmergencyContactsService } from './emergency-contacts.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto';
export declare class EmergencyContactsController {
    private readonly service;
    constructor(service: EmergencyContactsService);
    create(user: {
        id: string;
    }, familyId: string, dto: CreateEmergencyContactDto): Promise<{
        createdByUser: {
            id: string;
            firstName: string;
        };
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.EmergencyContactRole;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        address: string | null;
        isPrimary: boolean;
    }>;
    findAll(familyId: string, childId?: string): Promise<({
        createdByUser: {
            id: string;
            firstName: string;
        };
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.EmergencyContactRole;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        address: string | null;
        isPrimary: boolean;
    })[]>;
    update(user: {
        id: string;
    }, familyId: string, id: string, dto: UpdateEmergencyContactDto): Promise<{
        createdByUser: {
            id: string;
            firstName: string;
        };
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.EmergencyContactRole;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        familyId: string;
        childId: string;
        createdBy: string;
        notes: string | null;
        address: string | null;
        isPrimary: boolean;
    }>;
    remove(user: {
        id: string;
    }, familyId: string, id: string): Promise<void>;
}
