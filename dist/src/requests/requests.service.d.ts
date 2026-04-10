import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { MessagingService } from '../messaging/messaging.service';
import { ChatGateway } from '../messaging/chat.gateway';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateChangeRequestDto, RespondChangeRequestDto } from './dto/change-request.dto';
export declare class RequestsService {
    private prisma;
    private familyService;
    private messaging;
    private chatGateway;
    private mail;
    private notifications;
    private audit;
    constructor(prisma: PrismaService, familyService: FamilyService, messaging: MessagingService, chatGateway: ChatGateway, mail: MailService, notifications: NotificationsService, audit: AuditService);
    create(familyId: string, requesterId: string, dto: CreateChangeRequestDto): Promise<{
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
    findAll(familyId: string, userId: string): Promise<({
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
    respond(familyId: string, requestId: string, responderId: string, dto: RespondChangeRequestDto): Promise<{
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
    private notifyCoParentByEmail;
    private applyCalendarOverrides;
    private sendStatusMessage;
}
