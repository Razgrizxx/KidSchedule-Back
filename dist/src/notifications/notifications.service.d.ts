import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare class NotificationsService implements OnModuleInit {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private app;
    constructor(config: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    sendToUser(userId: string, payload: PushPayload): Promise<void>;
    sendToFamily(familyId: string, excludeUserId: string, payload: PushPayload): Promise<void>;
    private dispatchMulticast;
    private pruneTokens;
    private getFilteredTokens;
    private chunk;
}
