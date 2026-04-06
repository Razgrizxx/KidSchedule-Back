import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class OutlookAuthService {
    private readonly prisma;
    private readonly config;
    private readonly jwt;
    constructor(prisma: PrismaService, config: ConfigService, jwt: JwtService);
    getAuthUrl(userId: string): string;
    verifyState(state: string): string;
    handleCallback(code: string, userId: string): Promise<void>;
    getValidAccessToken(userId: string): Promise<string>;
    getStatus(userId: string): Promise<{
        connected: boolean;
    }>;
    disconnect(userId: string): Promise<{
        message: string;
    }>;
}
