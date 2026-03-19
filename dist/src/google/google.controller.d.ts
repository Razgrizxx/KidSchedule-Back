import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { AuthUser } from '../common/types/auth-user';
import { GoogleAuthService } from './google-auth.service';
import { GoogleCalendarSyncService } from './google-calendar-sync.service';
export declare class GoogleController {
    private readonly googleAuth;
    private readonly googleSync;
    private readonly config;
    constructor(googleAuth: GoogleAuthService, googleSync: GoogleCalendarSyncService, config: ConfigService);
    getAuthUrl(user: AuthUser): {
        url: string;
    };
    callback(code: string, state: string, error: string, res: Response): Promise<void>;
    getStatus(user: AuthUser): Promise<{
        connected: boolean;
    }>;
    disconnect(user: AuthUser): Promise<{
        message: string;
    }>;
    syncAll(user: AuthUser, familyId: string): Promise<{
        synced: number;
    }>;
}
