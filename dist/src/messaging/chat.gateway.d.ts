import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagingService } from './messaging.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private messagingService;
    server: Server;
    constructor(jwtService: JwtService, messagingService: MessagingService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinFamily(client: Socket, familyId: string): {
        event: string;
        familyId: string;
    };
    handleSendMessage(client: Socket, dto: {
        familyId: string;
        content: string;
    }): Promise<({
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
        isSystemMessage: boolean;
    }) | undefined>;
    handleTyping(client: Socket, familyId: string): void;
    handleStopTyping(client: Socket, familyId: string): void;
    emitToFamily(familyId: string, event: string, data: unknown): void;
}
