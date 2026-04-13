import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface LogAuditDto {
    familyId: string;
    actorId: string;
    action: AuditAction;
    childId?: string;
    affectedDate?: Date;
    previousValue?: string;
    newValue?: string;
    changeRequestId?: string;
    eventId?: string;
    notes?: string;
}
export interface AuditQueryParams {
    from?: string;
    to?: string;
    childId?: string;
    action?: AuditAction;
    take?: number;
    cursor?: string;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(dto: LogAuditDto): Promise<void>;
    findAll(familyId: string, params?: AuditQueryParams): Promise<{
        logs: ({
            child: {
                id: string;
                firstName: string;
                color: string;
            } | null;
            changeRequest: {
                id: string;
                status: import("@prisma/client").$Enums.ChangeRequestStatus;
                type: import("@prisma/client").$Enums.ChangeRequestType;
            } | null;
            actor: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            childId: string | null;
            action: import("@prisma/client").$Enums.AuditAction;
            affectedDate: Date | null;
            previousValue: string | null;
            newValue: string | null;
            eventId: string | null;
            notes: string | null;
            actorId: string;
            changeRequestId: string | null;
        })[];
        nextCursor: string | null;
    }>;
}
