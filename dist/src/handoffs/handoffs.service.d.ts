import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { AuditService } from '../audit/audit.service';
import { CreateHandoffDto } from './dto/handoff.dto';
export declare class HandoffsService {
    private readonly prisma;
    private readonly familyService;
    private readonly audit;
    constructor(prisma: PrismaService, familyService: FamilyService, audit: AuditService);
    create(familyId: string, actorId: string, dto: CreateHandoffDto): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        fromParent: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        toParent: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        notes: string | null;
        handoffAt: Date;
        toParentId: string;
        location: string | null;
        confirmedBy: string | null;
        confirmedAt: Date | null;
        fromParentId: string;
    }>;
    findAll(familyId: string, userId: string, opts: {
        childId?: string;
        from?: string;
        to?: string;
        take?: number;
        cursor?: string;
    }): Promise<{
        handoffs: ({
            child: {
                id: string;
                firstName: string;
                color: string;
            };
            fromParent: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
            toParent: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string;
            notes: string | null;
            handoffAt: Date;
            toParentId: string;
            location: string | null;
            confirmedBy: string | null;
            confirmedAt: Date | null;
            fromParentId: string;
        })[];
        nextCursor: string | null;
    }>;
    confirm(familyId: string, handoffId: string, userId: string): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        };
        fromParent: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        toParent: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string;
        notes: string | null;
        handoffAt: Date;
        toParentId: string;
        location: string | null;
        confirmedBy: string | null;
        confirmedAt: Date | null;
        fromParentId: string;
    }>;
    remove(familyId: string, handoffId: string, userId: string): Promise<{
        message: string;
    }>;
}
