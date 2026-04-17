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
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.ChangeRequestStatus;
        childId: string | null;
        type: import("@prisma/client").$Enums.ChangeRequestType;
        originalDate: Date | null;
        requestedDate: Date;
        requestedDateTo: Date | null;
        reason: string | null;
        counterDate: Date | null;
        counterReason: string | null;
        resolvedAt: Date | null;
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
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.ChangeRequestStatus;
        childId: string | null;
        type: import("@prisma/client").$Enums.ChangeRequestType;
        originalDate: Date | null;
        requestedDate: Date;
        requestedDateTo: Date | null;
        reason: string | null;
        counterDate: Date | null;
        counterReason: string | null;
        resolvedAt: Date | null;
        requesterId: string;
        responderId: string | null;
    })[]>;
    respond(user: AuthUser, familyId: string, requestId: string, dto: RespondChangeRequestDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.ChangeRequestStatus;
        childId: string | null;
        type: import("@prisma/client").$Enums.ChangeRequestType;
        originalDate: Date | null;
        requestedDate: Date;
        requestedDateTo: Date | null;
        reason: string | null;
        counterDate: Date | null;
        counterReason: string | null;
        resolvedAt: Date | null;
        requesterId: string;
        responderId: string | null;
    }>;
}
