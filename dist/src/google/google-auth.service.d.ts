import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Auth } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';
export declare class GoogleAuthService {
    private readonly prisma;
    private readonly config;
    private readonly jwt;
    constructor(prisma: PrismaService, config: ConfigService, jwt: JwtService);
    createOAuth2Client(): Auth.OAuth2Client;
    getAuthUrl(userId: string): string;
    verifyState(state: string): string;
    handleCallback(code: string, userId: string): Promise<{
        familyIds: string[];
    }>;
    disconnect(userId: string): Promise<{
        message: string;
    }>;
    getStatus(userId: string): Promise<{
        connected: boolean;
    }>;
}
