import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateMomentDto } from './dto/moment.dto';
export declare class MomentsService {
    private prisma;
    private familyService;
    constructor(prisma: PrismaService, familyService: FamilyService);
    create(familyId: string, userId: string, dto: CreateMomentDto): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string | null;
        description: string | null;
        title: string | null;
        mediaUrl: string;
        thumbnailUrl: string | null;
        takenAt: Date | null;
        uploadedBy: string;
    }>;
    findAll(familyId: string, userId: string, childId?: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string | null;
        description: string | null;
        title: string | null;
        mediaUrl: string;
        thumbnailUrl: string | null;
        takenAt: Date | null;
        uploadedBy: string;
    })[]>;
    remove(familyId: string, momentId: string, userId: string): Promise<{
        message: string;
    }>;
}
