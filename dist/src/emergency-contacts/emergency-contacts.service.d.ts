import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto';
export declare class EmergencyContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(familyId: string, userId: string, dto: CreateEmergencyContactDto): Promise<{
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
    update(familyId: string, id: string, userId: string, dto: UpdateEmergencyContactDto): Promise<{
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
    remove(familyId: string, id: string, userId: string): Promise<void>;
}
