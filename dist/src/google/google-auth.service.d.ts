import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class GoogleAuthService {
    private readonly prisma;
    private readonly config;
    private readonly jwt;
    constructor(prisma: PrismaService, config: ConfigService, jwt: JwtService);
    createOAuth2Client(): import("google-auth-library").OAuth2Client;
    getAuthUrl(userId: string): string;
    verifyState(state: string): string;
    handleCallback(code: string, userId: string): Promise<void>;
    disconnect(userId: string): Promise<{
        message: string;
    }>;
    getStatus(userId: string): Promise<{
        connected: boolean;
    }>;
}
