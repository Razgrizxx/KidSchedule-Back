import { AuditService } from './audit.service';
import { FamilyService } from '../family/family.service';
import { AuthUser } from '../common/types/auth-user';
export declare class AuditController {
    private readonly auditService;
    private readonly familyService;
    constructor(auditService: AuditService, familyService: FamilyService);
    findAll(familyId: string, user: AuthUser, from?: string, to?: string, childId?: string, action?: string, take?: string, cursor?: string): Promise<{
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
            notes: string | null;
            eventId: string | null;
            action: import("@prisma/client").$Enums.AuditAction;
            actorId: string;
            affectedDate: Date | null;
            previousValue: string | null;
            newValue: string | null;
            changeRequestId: string | null;
        })[];
        nextCursor: string | null;
    }>;
}
