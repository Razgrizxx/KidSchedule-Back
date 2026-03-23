import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';
import { SubscriptionService } from '../stripe/subscription.service';
export declare class ChildrenService {
    private prisma;
    private familyService;
    private subService;
    constructor(prisma: PrismaService, familyService: FamilyService, subService: SubscriptionService);
    create(familyId: string, userId: string, dto: CreateChildDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }>;
    findAll(familyId: string, userId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }[]>;
    findOne(familyId: string, childId: string, userId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }>;
    update(familyId: string, childId: string, userId: string, dto: UpdateChildDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }>;
    remove(familyId: string, childId: string, userId: string): Promise<{
        message: string;
    }>;
}
