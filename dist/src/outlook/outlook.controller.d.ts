import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { AuthUser } from '../common/types/auth-user';
import { OutlookAuthService } from './outlook-auth.service';
import { OutlookCalendarSyncService } from './outlook-calendar-sync.service';
export declare class OutlookController {
    private readonly outlookAuth;
    private readonly outlookSync;
    private readonly config;
    private readonly logger;
    constructor(outlookAuth: OutlookAuthService, outlookSync: OutlookCalendarSyncService, config: ConfigService);
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
    exportAll(user: AuthUser, familyId: string, body: {
        cleanup?: boolean;
    }): Promise<{
        synced: number;
        custodySynced: number;
    }>;
}
