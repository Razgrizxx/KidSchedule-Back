import { RequestsService } from './requests.service';
import { CreateChangeRequestDto, RespondChangeRequestDto } from './dto/change-request.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class RequestsController {
    private requestsService;
    constructor(requestsService: RequestsService);
    create(user: AuthUser, familyId: string, dto: CreateChangeRequestDto): Promise<{
        requester: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        type: import("@prisma/client").$Enums.ChangeRequestType;
        status: import("@prisma/client").$Enums.ChangeRequestStatus;
        originalDate: Date | null;
        requestedDate: Date;
        requestedDateTo: Date | null;
        childId: string | null;
        reason: string | null;
        counterDate: Date | null;
        counterReason: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        requesterId: string;
        responderId: string | null;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<({
        requester: {
            id: string;
            firstName: string;
            lastName: string;
        };
        responder: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        type: import("@prisma/client").$Enums.ChangeRequestType;
        status: import("@prisma/client").$Enums.ChangeRequestStatus;
        originalDate: Date | null;
        requestedDate: Date;
        requestedDateTo: Date | null;
        childId: string | null;
        reason: string | null;
        counterDate: Date | null;
        counterReason: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        requesterId: string;
        responderId: string | null;
    })[]>;
    respond(user: AuthUser, familyId: string, requestId: string, dto: RespondChangeRequestDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.ChangeRequestType;
        status: import("@prisma/client").$Enums.ChangeRequestStatus;
        originalDate: Date | null;
        requestedDate: Date;
        requestedDateTo: Date | null;
        childId: string | null;
        reason: string | null;
        counterDate: Date | null;
        counterReason: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        requesterId: string;
        responderId: string | null;
    }>;
}
