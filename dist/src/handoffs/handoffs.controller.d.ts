import { HandoffsService } from './handoffs.service';
import { CreateHandoffDto } from './dto/handoff.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class HandoffsController {
    private readonly handoffsService;
    constructor(handoffsService: HandoffsService);
    create(familyId: string, user: AuthUser, dto: CreateHandoffDto): Promise<{
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
        location: string | null;
        confirmedBy: string | null;
        confirmedAt: Date | null;
        fromParentId: string;
        toParentId: string;
    }>;
    findAll(familyId: string, user: AuthUser, childId?: string, from?: string, to?: string, take?: string, cursor?: string): Promise<{
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
            location: string | null;
            confirmedBy: string | null;
            confirmedAt: Date | null;
            fromParentId: string;
            toParentId: string;
        })[];
        nextCursor: string | null;
    }>;
    confirm(familyId: string, handoffId: string, user: AuthUser): Promise<{
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
        location: string | null;
        confirmedBy: string | null;
        confirmedAt: Date | null;
        fromParentId: string;
        toParentId: string;
    }>;
    remove(familyId: string, handoffId: string, user: AuthUser): Promise<{
        message: string;
    }>;
}
