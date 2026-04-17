import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/message.dto';
export declare class MessagingService {
    private prisma;
    private familyService;
    private notifications;
    constructor(prisma: PrismaService, familyService: FamilyService, notifications: NotificationsService);
    send(familyId: string, senderId: string, dto: SendMessageDto): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MessageStatus;
        senderId: string;
        content: string;
        contentHash: string;
        previousHash: string;
        attachmentUrl: string | null;
        isSystemMessage: boolean;
    }>;
    findAll(familyId: string, userId: string, cursor?: string, take?: number): Promise<{
        messages: ({
            sender: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            familyId: string;
            status: import("@prisma/client").$Enums.MessageStatus;
            senderId: string;
            content: string;
            contentHash: string;
            previousHash: string;
            attachmentUrl: string | null;
            isSystemMessage: boolean;
        })[];
        nextCursor: string | null;
    }>;
    verifyChain(familyId: string, userId: string): Promise<{
        isValid: boolean;
        totalMessages: number;
        violations: string[];
    }>;
    sendSystemMessage(familyId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        familyId: string;
        status: import("@prisma/client").$Enums.MessageStatus;
        senderId: string;
        content: string;
        contentHash: string;
        previousHash: string;
        attachmentUrl: string | null;
        isSystemMessage: boolean;
    } | undefined>;
    markRead(familyId: string, userId: string): Promise<{
        message: string;
    }>;
}
