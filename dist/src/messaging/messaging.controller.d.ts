import { MessagingService } from './messaging.service';
import { ChatGateway } from './chat.gateway';
import { SendMessageDto } from './dto/message.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class MessagingController {
    private messagingService;
    private chatGateway;
    constructor(messagingService: MessagingService, chatGateway: ChatGateway);
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
        senderId: string;
        content: string;
        contentHash: string;
        previousHash: string;
        attachmentUrl: string | null;
        isSystemMessage: boolean;
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
            senderId: string;
            content: string;
            contentHash: string;
            previousHash: string;
            attachmentUrl: string | null;
            isSystemMessage: boolean;
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
