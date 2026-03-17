import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/message.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class MessagingController {
    private messagingService;
    constructor(messagingService: MessagingService);
    send(user: AuthUser, familyId: string, dto: SendMessageDto): Promise<{
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
        content: string;
        attachmentUrl: string | null;
        senderId: string;
        contentHash: string;
        previousHash: string;
    }>;
    findAll(user: AuthUser, familyId: string, cursor?: string, take?: string): Promise<{
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
            content: string;
            attachmentUrl: string | null;
            senderId: string;
            contentHash: string;
            previousHash: string;
        })[];
        nextCursor: string | null;
    }>;
    verifyChain(user: AuthUser, familyId: string): Promise<{
        isValid: boolean;
        totalMessages: number;
        violations: string[];
    }>;
    markRead(user: AuthUser, familyId: string): Promise<{
        message: string;
    }>;
}
